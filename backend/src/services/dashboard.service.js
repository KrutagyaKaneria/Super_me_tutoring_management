const User = require('../models/user.model');
const Session = require('../models/session.model');
const Tutor = require('../models/tutor.model');
const Student = require('../models/student.model');
const Exam = require('../models/exam.model');
const parentDashboardService = require('./parent.dashboard.service');

exports.getAdminDashboard = async () => {
  const totalUsers = await User.countDocuments();
  const totalSessions = await Session.countDocuments();
  const activeSessions = await Session.countDocuments({ status: 'pending' });
  const pendingApprovals = await Session.countDocuments({ status: 'completed' });
  
  const students = await Student.find();
  const totalRevenue = students.reduce((acc, s) => acc + (s.totalFeesPaid || 0), 0);
  
  return {
    totalUsers,
    totalSessions,
    activeSessions,
    pendingApprovals,
    totalRevenue
  };
};

exports.getCoordinatorDashboard = async () => {
  const totalTutors = await Tutor.countDocuments();
  const totalStudents = await Student.countDocuments();
  const pendingAttendances = await Session.countDocuments({ status: 'completed' });
  const recentSessions = await Session.find().sort({ createdAt: -1 }).limit(5).populate('tutorId studentId', 'name');
  
  // Get assignments (Students with their assigned tutors)
  const assignments = await Student.find()
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'assignedTutor',
      populate: {
        path: 'user',
        select: 'name'
      }
    });
  
  return {
    totalTutors,
    totalStudents,
    pendingAttendances,
    recentSessions,
    assignments
  };
};

exports.getTutorDashboard = async (tutorUserId) => {
  const tutor = await Tutor.findOne({ user: tutorUserId });
  const tutorProfileId = tutor ? tutor._id : null;

  // 1. Total unique students assigned to this tutor
  const totalStudents = await Student.countDocuments({ assignedTutor: tutorProfileId });

  // 2. Sessions this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySessions = await Session.countDocuments({
    tutorId: tutorUserId,
    scheduledDate: { $gte: firstDayOfMonth },
    status: { $in: ['completed', 'approved'] }
  });

  // 3. Pending approvals (completed but not approved)
  const pendingApprovals = await Session.countDocuments({
    tutorId: tutorUserId,
    status: 'completed'
  });

  // 4. Monthly earnings (Sum of approved sessions in current month)
  // Note: In this architecture, earnings are stored in the tutor profile upon approval
  // To get "this month's" earnings specifically, we'd need a transactions model or iterate sessions.
  // For now, we'll use a simplified sum or the totalEarnings from profile.
  const monthlyEarnings = tutor ? tutor.totalEarnings : 0; // Simplified

  // 5. Today's sessions
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  
  const todaySessions = await Session.find({
    tutorId: tutorUserId,
    scheduledDate: { $gte: startOfToday, $lte: endOfToday }
  }).populate('studentId', 'name');

  const upcomingSessions = await Session.find({ 
    tutorId: tutorUserId, 
    status: 'scheduled',
    scheduledDate: { $gt: endOfToday }
  })
    .sort({ scheduledDate: 1 })
    .limit(5)
    .populate('studentId', 'name');

  return {
    totalStudents,
    monthlySessions,
    pendingApprovals,
    monthlyEarnings,
    todaySessions,
    upcomingSessions,
    profile: tutor
  };
};

exports.getStudentDashboard = async (studentUserId) => {
  const student = await Student.findOne({ user: studentUserId });
  const pendingFees = student ? student.pendingFees : 0;
  const totalFeesPaid = student ? student.totalFeesPaid : 0;
  
  const sessionsCompleted = await Session.countDocuments({
    studentId: studentUserId,
    status: { $in: ['completed', 'approved'] }
  });

  const completedSessions = await Session.find({
    studentId: studentUserId,
    status: { $in: ['completed', 'approved'] }
  });
  const hoursCompleted = completedSessions.reduce((acc, s) => acc + (s.durationInHours || 0), 0);

  const upcomingSessions = await Session.find({ studentId: studentUserId, status: 'scheduled' })
    .sort({ scheduledDate: 1, startTime: 1 })
    .limit(5)
    .populate('tutorId', 'name');

  const upcomingClassesCount = await Session.countDocuments({
    studentId: studentUserId,
    status: 'scheduled'
  });

  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const recentMarks = await Exam.find({ studentId: studentUserId })
    .sort({ date: -1 })
    .limit(5);

  return {
    pendingFees,
    totalFeesPaid,
    sessionsCompleted,
    hoursCompleted,
    upcomingClassesCount,
    upcomingSessions,
    nextSession,
    recentMarks
  };
};

// Reuse existing logic for Parent
exports.getParentDashboard = async (parentUserId) => {
  const parent = await Parent.findOne({ user: parentUserId }).populate('children');
  if (!parent) throw new AppError('Parent profile not found', 404);

  const studentUserIds = parent.children.map(child => child.user);

  // 1. Combine metrics for all children
  const sessionsCompleted = await Session.countDocuments({
    studentId: { $in: studentUserIds },
    status: { $in: ['completed', 'approved'] }
  });

  const allCompletedSessions = await Session.find({
    studentId: { $in: studentUserIds },
    status: { $in: ['completed', 'approved'] }
  }).populate('studentId', 'name');

  const hoursCompleted = allCompletedSessions.reduce((acc, s) => acc + (s.durationInHours || 0), 0);

  // 2. Combine financial metrics
  const pendingFees = parent.children.reduce((acc, child) => acc + (child.pendingFees || 0), 0);
  const totalFeesPaid = parent.children.reduce((acc, child) => acc + (child.totalFeesPaid || 0), 0);

  // 3. Fetch Recent Marks for all children
  const recentMarks = await Exam.find({ studentId: { $in: studentUserIds } })
    .sort({ date: -1 })
    .limit(5)
    .populate('studentId', 'name');

  // 4. Build Fee Ledger (Approved sessions are essentially invoices)
  const feeLedger = allCompletedSessions
    .filter(s => s.status === 'approved')
    .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
    .limit(10)
    .map(s => ({
      date: s.scheduledDate,
      studentName: s.studentId?.name || 'Child',
      description: `Tutoring Session: ${s.subject}`,
      amount: s.durationInHours * 250, // Simplified: ideally we store actual amount in session doc
    }));

  return {
    children: parent.children,
    sessionsCompleted,
    hoursCompleted,
    pendingFees,
    totalFeesPaid,
    recentMarks,
    feeLedger
  };
};
