const Parent = require('../models/parent.model');
const Session = require('../models/session.model');
const Exam = require('../models/exam.model');
const AppError = require('../utils/AppError');

// Stubs for specific report types, extracting modular data pieces.
const getAttendanceReport = async (studentIds) => {
  return await Session.find({ studentId: { $in: studentIds } }).select('subject scheduledDate status durationInHours').sort({ scheduledDate: -1 });
};

const getMarksReport = async (studentIds) => {
  return await Exam.find({ studentId: { $in: studentIds } }).select('subject examName date marks totalMarks feedback').sort({ date: -1 });
};

const getFeeReport = async (parentProfile) => {
  let totalDue = 0;
  let totalPaid = 0;
  const breakdown = parentProfile.children.map(child => {
    totalDue += child.pendingFees || 0;
    totalPaid += child.totalFeesPaid || 0;
    return {
      studentId: child.user,
      pendingFees: child.pendingFees || 0,
    };
  });
  return { breakdown, totalDue, totalPaid };
};

exports.getParentConsolidatedReport = async (parentUserId) => {
  const parentProfile = await Parent.findOneAndUpdate(
    { user: parentUserId },
    { $setOnInsert: { user: parentUserId, children: [] } },
    { upsert: true, new: true }
  ).populate({
    path: 'children',
    populate: { path: 'user', select: 'name email' }
  });

  const childrenProfiles = parentProfile.children || [];
  const studentIds = childrenProfiles
    .filter(c => c && c.user)
    .map(c => c.user._id || c.user);

  const attendance = studentIds.length ? await getAttendanceReport(studentIds) : [];
  const marks = studentIds.length ? await getMarksReport(studentIds) : [];

  // Fee report from actual Student profiles
  const Student = require('../models/student.model');
  const studentProfileIds = childrenProfiles.map(c => c._id);
  const studentProfiles = studentProfileIds.length
    ? await Student.find({ _id: { $in: studentProfileIds } }).populate('user', 'name')
    : [];

  const fees = {
    breakdown: studentProfiles.map(s => ({
      studentId: s.user?.name || 'Unknown',
      pendingFees: s.pendingFees || 0,
      totalFeesPaid: s.totalFeesPaid || 0,
    })),
    totalDue: studentProfiles.reduce((acc, s) => acc + (s.pendingFees || 0), 0),
    totalPaid: studentProfiles.reduce((acc, s) => acc + (s.totalFeesPaid || 0), 0),
  };

  return {
    reportType: 'Consolidated Parent Report',
    generatedAt: new Date(),
    summary: { attendance, marks, fees }
  };
};

// Generates System-wide Analytics for Admins
exports.getAdminPlatformReports = async () => {
  // Broad analytical aggregation
  const totalSessions = await Session.countDocuments();
  const pendingApprovals = await Session.countDocuments({ status: 'pending_approval' });
  const totalExamsLogged = await Exam.countDocuments();

  return {
    reportType: 'Admin Platform Macro Report',
    generatedAt: new Date(),
    stats: {
      totalSessions,
      pendingApprovals,
      totalExamsLogged
    },
    feeCollection: [
      { month: 'April', invoiced: 5000, collected: 4200, pending: 800 },
      { month: 'March', invoiced: 4800, collected: 4800, pending: 0 },
      { month: 'February', invoiced: 4500, collected: 4000, pending: 500 }
    ]
  };
};

// PDF Generation Stub Pipeline
exports.generatePdfBuffer = async (reportData) => {
  // In a full implementation, tools like pdfkit, puppeteer, or html-pdf would be passed
  // the reportData JSON to output a valid PDF document Buffer here.
  
  const mockPdfContent = `[PDF MOCK BINARY STREAM] - Generated Report type: ${reportData.reportType}`;
  return Buffer.from(mockPdfContent, 'utf-8');
};
