const Tutor = require('../models/tutor.model');
const AppError = require('../utils/AppError');
const Session = require('../models/session.model');
const Student = require('../models/student.model');
const FeeConfig = require('../models/feeConfig.model');
const AssignmentPricing = require('../models/assignmentPricing.model');

function normalizeOptionalSubject(subject) {
  return typeof subject === 'string' ? subject.trim() : '';
}

function toPositiveNumberOrNull(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// Upsert logic for profile updating. We assume a tutor profile might not exist 
// on initial registration, but is implicitly created or updated when they provide details.
exports.updateTutorProfile = async (userId, updateData) => {
  // We only allow updating benign fields directly
  const allowedFields = ['subjects', 'languages', 'availabilitySlots'];
  const sanitizedData = {};
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      // Basic validation for availability slots
      if (field === 'availabilitySlots' && Array.isArray(updateData[field])) {
        updateData[field].forEach((slot, index) => {
          if (!slot.day || !slot.startTime || !slot.endTime) {
            console.log(`Validation failed for slot at index ${index}:`, slot);
            throw new AppError(`Invalid availability slot at index ${index}. Day, startTime, and endTime are required.`, 400);
          }
        });
      }
      sanitizedData[field] = updateData[field];
    }
  });

  const tutor = await Tutor.findOneAndUpdate(
    { user: userId },
    sanitizedData,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return tutor;
};

exports.getAssignedStudents = async (tutorUserId) => {
  const tutorProfile = await Tutor.findOne({ user: tutorUserId });
  if (!tutorProfile) return [];

  const Student = require('../models/student.model');
  const students = await Student.find({ assignedTutor: tutorProfile._id })
    .populate('user', 'name email');
    
  return students;
};

exports.getTutorMarks = async (tutorUserId) => {
  const Exam = require('../models/exam.model');
  const marks = await Exam.find({ addedBy: tutorUserId })
    .populate('studentId', 'name')
    .sort({ date: -1 });
    
  return marks;
};

exports.getTutorEarnings = async (tutorUserId) => {
  const tutorProfile = await Tutor.findOne({ user: tutorUserId });
  if (!tutorProfile) {
    throw new AppError('Tutor profile not found', 404);
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [approvedSessionsThisMonth, pendingSessionsThisMonth] = await Promise.all([
    Session.find({
      tutorId: tutorUserId,
      status: 'approved',
      scheduledDate: { $gte: monthStart },
    })
      .populate('studentId', 'name')
      .select('studentId durationInHours tutorAmount tutorPayoutPerHour amount hourlyRate subject scheduledDate'),

    Session.find({
      tutorId: tutorUserId,
      status: 'pending_approval',
      scheduledDate: { $gte: monthStart },
    })
      .populate('studentId', 'name')
      .select('studentId durationInHours subject scheduledDate'),
  ]);

  const studentUserIds = Array.from(
    new Set(
      [...approvedSessionsThisMonth, ...pendingSessionsThisMonth]
        .map((s) => String(s.studentId?._id || s.studentId))
        .filter(Boolean)
    )
  );

  const studentProfiles = await Student.find({ user: { $in: studentUserIds } })
    .select('user grade')
    .lean();

  const gradeByStudentUserId = new Map();
  for (const sp of studentProfiles) {
    const g = parseInt(sp.grade, 10);
    gradeByStudentUserId.set(String(sp.user), Number.isFinite(g) ? g : null);
  }

  const estimatePendingPayout = async (session) => {
    const duration = Number(session.durationInHours || 0);
    if (!Number.isFinite(duration) || duration <= 0) return 0;

    const studentId = String(session.studentId?._id || session.studentId);
    const normalizedSubject = normalizeOptionalSubject(session.subject);

    const assignmentPricing = await (async () => {
      const subjectSpecific = normalizedSubject
        ? await AssignmentPricing.findOne({
            tutorId: tutorUserId,
            studentId,
            subject: normalizedSubject,
            isActive: true,
          }).lean()
        : null;
      if (subjectSpecific) return subjectSpecific;
      return await AssignmentPricing.findOne({ tutorId: tutorUserId, studentId, subject: '', isActive: true }).lean();
    })();

    const assignmentPayout = assignmentPricing ? toPositiveNumberOrNull(assignmentPricing.tutorPayoutPerHour) : null;
    const assignmentBilling = assignmentPricing ? toPositiveNumberOrNull(assignmentPricing.billingRatePerHour) : null;

    let fallbackRate = null;
    const gradeNumeric = gradeByStudentUserId.get(studentId);
    if (gradeNumeric != null) {
      const feeConfig = await FeeConfig.findOne({ gradeMin: { $lte: gradeNumeric }, gradeMax: { $gte: gradeNumeric } })
        .select('hourlyRate')
        .lean();
      const maybe = feeConfig ? Number(feeConfig.hourlyRate) : null;
      fallbackRate = Number.isFinite(maybe) && maybe > 0 ? maybe : null;
    }

    const payoutRatePerHour = assignmentPayout ?? fallbackRate ?? assignmentBilling;
    if (!Number.isFinite(payoutRatePerHour) || payoutRatePerHour <= 0) return 0;
    return Number((duration * payoutRatePerHour).toFixed(2));
  };

  // Approved totals
  let approvedHours = 0;
  let approvedAmount = 0;
  const byStudent = new Map();

  for (const s of approvedSessionsThisMonth) {
    const duration = Number(s.durationInHours || 0);
    if (!Number.isFinite(duration) || duration <= 0) continue;

    const earned = Number((s.tutorAmount ?? s.amount ?? 0) || 0);
    approvedHours += duration;
    approvedAmount += earned;

    const studentId = String(s.studentId?._id || s.studentId);
    const studentName = s.studentId?.name || 'Unknown';
    const gradeNumeric = gradeByStudentUserId.get(studentId);
    const displayName = gradeNumeric != null ? `${studentName} (Gr ${gradeNumeric})` : studentName;

    const prev = byStudent.get(studentId) || { name: displayName, hours: 0, earned: 0 };
    prev.hours += duration;
    prev.earned += earned;
    byStudent.set(studentId, prev);
  }

  // Pending totals (estimated)
  let pendingHours = 0;
  let pendingAmountEstimate = 0;
  const pendingEstimates = await Promise.all(pendingSessionsThisMonth.map(estimatePendingPayout));
  for (let i = 0; i < pendingSessionsThisMonth.length; i++) {
    const duration = Number(pendingSessionsThisMonth[i].durationInHours || 0);
    if (Number.isFinite(duration) && duration > 0) pendingHours += duration;
    pendingAmountEstimate += Number(pendingEstimates[i] || 0);
  }

  const breakdownByStudent = Array.from(byStudent.values())
    .map((v) => {
      const hours = Number(v.hours.toFixed(2));
      const earned = Number(v.earned.toFixed(2));
      const rate = hours > 0 ? Number((earned / hours).toFixed(2)) : 0;
      return { name: v.name, hours, rate, earned };
    })
    .sort((a, b) => b.earned - a.earned);

  return {
    stats: {
      thisMonth: {
        amount: Number(approvedAmount.toFixed(2)),
        hours: Number(approvedHours.toFixed(2)),
      },
      pending: {
        amount: Number(pendingAmountEstimate.toFixed(2)),
        hours: Number(pendingHours.toFixed(2)),
      },
      totalEarned: Number((tutorProfile.totalEarnings || 0).toFixed(2)),
    },
    breakdownByStudent,
  };
};
