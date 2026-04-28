const Tutor = require('../models/tutor.model');
const Student = require('../models/student.model');
const Parent = require('../models/parent.model');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const AssignmentPricing = require('../models/assignmentPricing.model');

exports.getAllTutors = async () => {
  // 1. Find all users with role 'tutor'
  const tutorUsers = await User.find({ role: 'tutor' }).select('name email isActive');
  
  // 2. Ensure each has a profile and return them
  const tutors = await Promise.all(tutorUsers.map(async (user) => {
    let profile = await Tutor.findOne({ user: user._id }).populate('user', 'name email isActive');
    if (!profile) {
      profile = await Tutor.create({ user: user._id });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));
    
  return tutors;
};

exports.getAllStudents = async () => {
  // 1. Find all users with role 'student'
  const studentUsers = await User.find({ role: 'student' }).select('name email isActive');
  
  // 2. Ensure each has a profile and return them
  const students = await Promise.all(studentUsers.map(async (user) => {
    let profile = await Student.findOne({ user: user._id }).populate('user', 'name email isActive');
    if (!profile) {
      profile = await Student.create({ user: user._id });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));
    
  return students;
};

exports.assignTutorToStudent = async (studentUserId, tutorUserId) => {
  // 1. Validate both users exist in the system and have proper roles
  const [studentUser, tutorUser] = await Promise.all([
    User.findById(studentUserId),
    User.findById(tutorUserId)
  ]);

  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Valid student user not found', 404);
  }

  if (!tutorUser || tutorUser.role !== 'tutor') {
    throw new AppError('Valid tutor user not found', 404);
  }

  // 2. Prevent assigning inactive tutor
  if (!tutorUser.isActive) {
    throw new AppError('Cannot assign an inactive tutor', 400);
  }

  // 3. Ensure profiles exist (Coordinator handles implicit creation if they don't yet)
  let tutorProfile = await Tutor.findOne({ user: tutorUserId });
  if (!tutorProfile) {
      // Create bare profile if missing
      tutorProfile = await Tutor.create({ user: tutorUserId });
  }

  let studentProfile = await Student.findOne({ user: studentUserId });
  if (!studentProfile) {
      studentProfile = await Student.create({ user: studentUserId });
  }

  // 4. Prevent duplicate assignment
  if (studentProfile.assignedTutor && studentProfile.assignedTutor.toString() === tutorProfile._id.toString()) {
      throw new AppError('This tutor is already assigned to this student', 400);
  }

  // 5. Store assignedTutorId in Student Document
  studentProfile.assignedTutor = tutorProfile._id;
  await studentProfile.save();

  return studentProfile;
};

// PHASE 7 Additions
const FeeConfig = require('../models/feeConfig.model');

function normalizeOptionalSubject(subject) {
  return typeof subject === 'string' ? subject.trim() : '';
}

function toPositiveNumberOrNull(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

exports.upsertAssignmentPricing = async (data) => {
  const {
    tutorId,
    studentId,
    subject,
    billingRatePerHour,
    tutorPayoutPerHour,
    board,
    grade,
    customNotes,
    isActive,
  } = data || {};

  if (!tutorId || !studentId) {
    throw new AppError('tutorId and studentId are required', 400);
  }

  const [tutorUser, studentUser] = await Promise.all([
    User.findById(tutorId).select('role isActive'),
    User.findById(studentId).select('role isActive'),
  ]);

  if (!tutorUser || tutorUser.role !== 'tutor') {
    throw new AppError('Valid tutor user not found', 404);
  }
  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Valid student user not found', 404);
  }

  const normalizedSubject = normalizeOptionalSubject(subject);

  const update = {
    subject: normalizedSubject,
    board,
    grade,
    customNotes,
    isActive: typeof isActive === 'boolean' ? isActive : true,
  };

  const billing = toPositiveNumberOrNull(billingRatePerHour);
  const payout = toPositiveNumberOrNull(tutorPayoutPerHour);
  if (billing !== null) update.billingRatePerHour = billing;
  if (payout !== null) update.tutorPayoutPerHour = payout;

  const pricing = await AssignmentPricing.findOneAndUpdate(
    { tutorId, studentId, subject: normalizedSubject },
    { $set: update, $setOnInsert: { tutorId, studentId } },
    { new: true, upsert: true, runValidators: true }
  );

  return pricing;
};

exports.getAssignmentPricing = async (tutorId, studentId, subject) => {
  if (!tutorId || !studentId) {
    throw new AppError('tutorId and studentId are required', 400);
  }

  const normalizedSubject = normalizeOptionalSubject(subject);

  // 1) Subject-specific pricing (if provided)
  if (normalizedSubject) {
    const subjectSpecific = await AssignmentPricing.findOne({ tutorId, studentId, subject: normalizedSubject, isActive: true });
    if (subjectSpecific) return subjectSpecific;
  }

  // 2) All-subject pricing
  return await AssignmentPricing.findOne({ tutorId, studentId, subject: '', isActive: true });
};

exports.getPendingAttendance = async () => {
  return await Session.find({ status: 'pending_approval' })
    .populate('tutorId', 'name email')
    .populate('studentId', 'name email');
};

exports.approveSession = async (sessionId) => {
  const tx = await mongoose.startSession();
  tx.startTransaction();
  try {
    const session = await Session.findById(sessionId).session(tx);
    if (!session) throw new AppError('Session not found', 404);

    if (session.status === 'approved' || session.financialsApplied) {
      throw new AppError('This session has already been approved financially.', 400);
    }

    if (session.status !== 'pending_approval') {
      throw new AppError(`Cannot approve a session with status: ${session.status}`, 400);
    }

    const student = await Student.findOne({ user: session.studentId }).session(tx);
    const tutor = await Tutor.findOne({ user: session.tutorId }).session(tx);
    if (!student || !tutor) throw new AppError('Associated profile mapping missing', 404);

    const duration = Number(session.durationInHours || 0);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new AppError('Session duration is invalid. Cannot approve financials.', 400);
    }

    // Pricing priority:
    // 1) Assignment-level custom pricing
    // 2) FeeConfig grade-based fallback (backward compatible)
    const normalizedSessionSubject = normalizeOptionalSubject(session.subject);

    const assignmentPricing = await (async () => {
      // subject-specific first, then all-subject (""), both active
      const subjectSpecific = normalizedSessionSubject
        ? await AssignmentPricing.findOne({ tutorId: session.tutorId, studentId: session.studentId, subject: normalizedSessionSubject, isActive: true }).session(tx)
        : null;
      if (subjectSpecific) return subjectSpecific;
      return await AssignmentPricing.findOne({ tutorId: session.tutorId, studentId: session.studentId, subject: '', isActive: true }).session(tx);
    })();

    const assignmentBilling = assignmentPricing ? toPositiveNumberOrNull(assignmentPricing.billingRatePerHour) : null;
    const assignmentPayout = assignmentPricing ? toPositiveNumberOrNull(assignmentPricing.tutorPayoutPerHour) : null;

    // FeeConfig is now an optional fallback.
    // If you configure custom pricing for each tutor–student, you do NOT need FeeConfig.
    let fallbackRate = null;
    if (assignmentBilling === null || assignmentPayout === null) {
      const gradeNumeric = parseInt(student.grade, 10);
      if (Number.isFinite(gradeNumeric)) {
        const feeConfig = await FeeConfig.findOne({
          gradeMin: { $lte: gradeNumeric },
          gradeMax: { $gte: gradeNumeric },
        }).session(tx);
        const maybe = feeConfig ? Number(feeConfig.hourlyRate) : null;
        fallbackRate = Number.isFinite(maybe) && maybe > 0 ? maybe : null;
      }
    }

    // If FeeConfig isn't present, we fall back to the other custom rate (so providing only 1 rate still works).
    const billingRatePerHour = assignmentBilling ?? fallbackRate ?? assignmentPayout;
    const tutorPayoutPerHour = assignmentPayout ?? fallbackRate ?? assignmentBilling;

    if (!Number.isFinite(billingRatePerHour) || billingRatePerHour <= 0) {
      throw new AppError('No valid billing rate found. Configure custom pricing (billingRatePerHour) or FeeConfig.', 400);
    }
    if (!Number.isFinite(tutorPayoutPerHour) || tutorPayoutPerHour <= 0) {
      throw new AppError('No valid tutor payout rate found. Configure custom pricing (tutorPayoutPerHour) or FeeConfig.', 400);
    }

    const billedAmount = Number((duration * billingRatePerHour).toFixed(2));
    const tutorAmount = Number((duration * tutorPayoutPerHour).toFixed(2));
    const platformMargin = Number((billedAmount - tutorAmount).toFixed(2));

    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId, status: 'pending_approval', financialsApplied: false },
      {
        $set: {
          status: 'approved',
          financialsApplied: true,
          // Backward compatibility: keep these as the billed (student) rate/amount
          hourlyRate: billingRatePerHour,
          amount: billedAmount,

          billingRatePerHour,
          tutorPayoutPerHour,
          tutorAmount,
          platformMargin,
        }
      },
      { new: true, session: tx }
    );

    if (!updatedSession) {
      throw new AppError('Session approval could not be applied (already processed).', 400);
    }

    tutor.totalEarnings += tutorAmount;
    student.pendingFees += billedAmount;

    await tutor.save({ session: tx });
    await student.save({ session: tx });

    await tx.commitTransaction();
    return updatedSession;
  } catch (err) {
    await tx.abortTransaction();
    throw err;
  } finally {
    tx.endSession();
  }
};

exports.rejectSession = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);

  if (session.status === 'approved' || session.status === 'rejected') {
     throw new AppError('Session is already processed.', 400);
  }

  if (session.status !== 'pending_approval') {
    throw new AppError(`Cannot reject a session with status: ${session.status}`, 400);
  }

  session.status = 'rejected';
  await session.save();

  return session;
};

exports.getAllParents = async () => {
  const parentUsers = await User.find({ role: 'parent' }).select('name email isActive');

  const parents = await Promise.all(parentUsers.map(async (user) => {
    let profile = await Parent.findOne({ user: user._id }).populate('user', 'name email isActive').populate({
      path: 'children',
      populate: { path: 'user', select: 'name' }
    });
    if (!profile) {
      profile = await Parent.create({ user: user._id, children: [] });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));

  return parents;
};

exports.linkParentToStudent = async (parentUserId, studentUserId) => {
  // 1. Validate parent user
  const parentUser = await User.findById(parentUserId);
  if (!parentUser || parentUser.role !== 'parent') {
    throw new AppError('Valid parent user not found', 404);
  }

  // 2. Validate student user
  const studentUser = await User.findById(studentUserId);
  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Valid student user not found', 404);
  }

  // 3. Get or create parent profile
  let parentProfile = await Parent.findOne({ user: parentUserId });
  if (!parentProfile) {
    parentProfile = await Parent.create({ user: parentUserId, children: [] });
  }

  // 4. Get or create student profile
  let studentProfile = await Student.findOne({ user: studentUserId });
  if (!studentProfile) {
    studentProfile = await Student.create({ user: studentUserId });
  }

  // 5. Prevent duplicate linkage
  const alreadyLinked = parentProfile.children.some(
    childId => childId.toString() === studentProfile._id.toString()
  );
  if (alreadyLinked) {
    throw new AppError('This student is already linked to this parent', 400);
  }

  // 6. Link: add student profile ID to parent's children array
  parentProfile.children.push(studentProfile._id);
  await parentProfile.save();

  // 7. Also store parent reference on student (for reverse lookup)
  studentProfile.parent = parentUserId;
  await studentProfile.save();

  // Return populated result
  const result = await Parent.findById(parentProfile._id)
    .populate('user', 'name email')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'name email' }
    });

  return result;
};
