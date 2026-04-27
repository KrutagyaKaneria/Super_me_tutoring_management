const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const sessionService = require('../services/session.service');

exports.getSchedule = catchAsync(async (req, res, next) => {
  // req.user.id refers to the active student user
  const schedule = await sessionService.getStudentSchedule(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { schedule, count: schedule.length }, 'Student schedule retrieved successfully')
  );
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const dashboardService = require('../services/dashboard.service');
  const data = await dashboardService.getStudentDashboard(req.user.id);

  res.status(200).json(
    new ApiResponse(200, data, 'Student dashboard retrieved')
  );
});

exports.getMarks = catchAsync(async (req, res, next) => {
  const examService = require('../services/exam.service');
  const marks = await examService.getStudentMarks(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { marks, count: marks.length }, 'Student marks retrieved seamlessly')
  );
});
