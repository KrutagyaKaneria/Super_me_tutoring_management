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

// Generates Consolidated Output for Parents
exports.getParentConsolidatedReport = async (parentUserId) => {
  const parentProfile = await Parent.findOne({ user: parentUserId }).populate({
    path: 'children',
    populate: { path: 'user', select: 'name email' }
  });

  if (!parentProfile || !parentProfile.children) {
    throw new AppError('Parent or children profile misconfigured.', 404);
  }

  const studentIds = parentProfile.children.map(c => c.user._id);

  const attendance = await getAttendanceReport(studentIds);
  const marks = await getMarksReport(studentIds);
  const fees = await getFeeReport(parentProfile);

  return {
    reportType: 'Consolidated Parent Report',
    generatedAt: new Date(),
    summary: {
      attendance,
      marks,
      fees
    }
  };
};

// Generates System-wide Analytics for Admins
exports.getAdminPlatformReports = async () => {
  // Broad analytical aggregation
  const totalSessions = await Session.countDocuments();
  const pendingApprovals = await Session.countDocuments({ status: 'completed' });
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
