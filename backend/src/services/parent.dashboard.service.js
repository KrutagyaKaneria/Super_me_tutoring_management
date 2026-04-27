const Parent = require('../models/parent.model');
const Session = require('../models/session.model');
const Exam = require('../models/exam.model');

const getParentChildrenProfiles = async (parentUserId) => {
  const parentProfile = await Parent.findOne({ user: parentUserId }).populate({
    path: 'children',
    populate: { path: 'user', select: 'name email' }
  });
  if (!parentProfile || !parentProfile.children) return [];
  return parentProfile.children;
};

exports.getChildProgress = async (parentUserId) => {
  const childrenProfiles = await getParentChildrenProfiles(parentUserId);
  if (childrenProfiles.length === 0) return { message: 'No children linked to this parent profile.' };

  const studentUserIds = childrenProfiles.map(child => child.user._id);

  const marks = await Exam.find({ studentId: { $in: studentUserIds } })
    .populate('studentId', 'name')
    .sort({ date: -1 });

  const sessions = await Session.find({ studentId: { $in: studentUserIds } })
    .populate('studentId', 'name')
    .populate('tutorId', 'name')
    .sort({ scheduledDate: -1 });

  const attendanceSummary = {
    totalScheduled: sessions.filter(s => s.status === 'scheduled').length,
    totalCompletedOrApproved: sessions.filter(s => s.status === 'completed' || s.status === 'approved').length,
    totalCancelled: sessions.filter(s => s.status === 'cancelled').length,
    totalPendingExecution: sessions.filter(s => s.status === 'pending').length,
  };

  return {
    attendanceSummary,
    sessionHistory: sessions,
    marksSummary: marks
  };
};

exports.getFeeLedger = async (parentUserId) => {
  const childrenProfiles = await getParentChildrenProfiles(parentUserId);
  if (childrenProfiles.length === 0) return { message: 'No children linked to this parent profile.' };
  
  let feesDue = 0;
  let feesPaid = 0;
  
  const childLedgers = childrenProfiles.map(child => {
    feesDue += child.pendingFees || 0;
    feesPaid += child.totalFeesPaid || 0;
    
    return {
      studentInfo: child.user,
      pendingFees: child.pendingFees || 0,
      totalFeesPaid: child.totalFeesPaid || 0,
      outstandingBalance: child.pendingFees || 0
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
  // Currently tracks abstract balances logically identical to the ledger.
  // In a future phase, a dedicated 'Payment' transaction model would be queried here.
  const ledger = await this.getFeeLedger(parentUserId);
  return {
    notice: 'Detailed transactional payment history will route here. Currently routing abstracted balances.',
    ledgerData: ledger
  };
};
