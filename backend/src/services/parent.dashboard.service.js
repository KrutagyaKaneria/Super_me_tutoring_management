const Parent = require('../models/parent.model');
const Student = require('../models/student.model');
const Session = require('../models/session.model');
const Exam = require('../models/exam.model');

// Helper: get or auto-create parent profile with full child population
const getParentWithChildren = async (parentUserId) => {
  const parent = await Parent.findOneAndUpdate(
    { user: parentUserId },
    { $setOnInsert: { user: parentUserId, children: [] } },
    { upsert: true, new: true }
  ).populate({
    path: 'children',
    populate: { path: 'user', select: 'name email' }
  });
  return parent;
};

exports.getChildProgress = async (parentUserId) => {
  const parent = await getParentWithChildren(parentUserId);
  const childrenProfiles = parent.children || [];

  if (childrenProfiles.length === 0) {
    return {
      attendanceSummary: { totalScheduled: 0, totalCompletedOrApproved: 0, totalCancelled: 0 },
      sessionHistory: [],
      marksSummary: []
    };
  }

  const studentUserIds = childrenProfiles
    .filter(child => child && child.user)
    .map(child => child.user._id || child.user);

  const marks = await Exam.find({ studentId: { $in: studentUserIds } })
    .populate('studentId', 'name')
    .sort({ date: -1 });

  const sessions = await Session.find({ studentId: { $in: studentUserIds } })
    .populate('studentId', 'name')
    .populate('tutorId', 'name')
    .sort({ scheduledDate: -1 });

  const attendanceSummary = {
    totalScheduled: sessions.filter(s => s.status === 'scheduled').length,
    totalCompletedOrApproved: sessions.filter(s => s.status === 'pending_approval' || s.status === 'approved').length,
    totalCancelled: sessions.filter(s => s.status === 'cancelled').length,
  };

  return {
    attendanceSummary,
    sessionHistory: sessions,
    marksSummary: marks
  };
};

exports.getFeeLedger = async (parentUserId) => {
  const parent = await getParentWithChildren(parentUserId);
  const childrenProfiles = parent.children || [];

  if (childrenProfiles.length === 0) {
    return { totalFeesDue: 0, totalFeesPaid: 0, totalOutstandingBalance: 0, breakdown: [] };
  }

  // Query Student profiles directly for accurate fee data
  const studentProfileIds = childrenProfiles.map(c => c._id);
  const studentProfiles = await Student.find({ _id: { $in: studentProfileIds } }).populate('user', 'name email');

  let feesDue = 0;
  let feesPaid = 0;

  const childLedgers = studentProfiles.map(s => {
    feesDue += s.pendingFees || 0;
    feesPaid += s.totalFeesPaid || 0;
    return {
      studentInfo: s.user,
      pendingFees: s.pendingFees || 0,
      totalFeesPaid: s.totalFeesPaid || 0,
      outstandingBalance: s.pendingFees || 0
    };
  });

  return {
    totalFeesDue: feesDue,
    totalFeesPaid: feesPaid,
    totalOutstandingBalance: feesDue,
    breakdown: childLedgers
  };
};

exports.getPayments = async (parentUserId) => {
  const ledger = await exports.getFeeLedger(parentUserId);
  return {
    notice: 'Detailed transactional payment history will be available in the next release.',
    ledgerData: ledger
  };
};
