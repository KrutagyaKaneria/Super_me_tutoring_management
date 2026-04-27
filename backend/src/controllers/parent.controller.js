const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const examService = require('../services/exam.service');

exports.getMarks = catchAsync(async (req, res, next) => {
  const marks = await examService.getParentStudentMarks(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { marks, count: marks.length }, 'Parent children marks retrieved securely')
  );
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const dashboardService = require('../services/dashboard.service');
  const data = await dashboardService.getParentDashboard(req.user.id);

  res.status(200).json(
    new ApiResponse(200, data, 'Parent dashboard retrieved')
  );
});

const dashboardService = require('../services/parent.dashboard.service');

exports.getChildProgress = catchAsync(async (req, res, next) => {
  const progress = await dashboardService.getChildProgress(req.user.id);

  res.status(200).json(
    new ApiResponse(200, progress, 'Child progress retrieved successfully')
  );
});

exports.getFeeLedger = catchAsync(async (req, res, next) => {
  const ledger = await dashboardService.getFeeLedger(req.user.id);

  res.status(200).json(
    new ApiResponse(200, ledger, 'Fee ledger retrieved successfully')
  );
});

exports.getPayments = catchAsync(async (req, res, next) => {
  const payments = await dashboardService.getPayments(req.user.id);

  res.status(200).json(
    new ApiResponse(200, payments, 'Payments data retrieved successfully')
  );
});

exports.downloadReport = catchAsync(async (req, res, next) => {
  const reportService = require('../services/report.service');
  const reportData = await reportService.getParentConsolidatedReport(req.user.id);
  
  // Natively trigger the stubbed PDF buffer compiler
  const pdfBuffer = await reportService.generatePdfBuffer(reportData);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=parent-consolidated-report.pdf');
  
  // Directly send the buffer down the HTTP stream
  res.send(pdfBuffer);
});
