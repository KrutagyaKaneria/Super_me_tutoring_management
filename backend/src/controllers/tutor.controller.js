const tutorService = require('../services/tutor.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.updateProfile = catchAsync(async (req, res, next) => {
  // We use req.user.id because tutors can only update their own profiles via this route
  const tutor = await tutorService.updateTutorProfile(req.user.id, req.body);

  res.status(200).json(
    new ApiResponse(200, { tutor }, 'Tutor profile updated successfully')
  );
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const dashboardService = require('../services/dashboard.service');
  const data = await dashboardService.getTutorDashboard(req.user.id);

  res.status(200).json(
    new ApiResponse(200, data, 'Tutor dashboard retrieved')
  );
});

exports.getTutorSessions = catchAsync(async (req, res, next) => {
  const sessionService = require('../services/session.service');
  const sessions = await sessionService.getTutorSessions(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { sessions }, 'Tutor sessions retrieved successfully')
  );
});

exports.startSession = catchAsync(async (req, res, next) => {
  const sessionService = require('../services/session.service');
  const session = await sessionService.startSession(req.user.id, req.params.id);

  res.status(200).json(
    new ApiResponse(200, { session }, 'Session started successfully')
  );
});

exports.endSession = catchAsync(async (req, res, next) => {
  const sessionService = require('../services/session.service');
  const session = await sessionService.endSession(req.user.id, req.params.id);

  res.status(200).json(
    new ApiResponse(200, { session }, 'Session ended successfully')
  );
});

exports.addMarks = catchAsync(async (req, res, next) => {
  const examService = require('../services/exam.service');
  const exam = await examService.addMarks(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, { exam }, 'Marks natively added successfully via Tutor map')
  );
});

exports.getAllStudents = catchAsync(async (req, res, next) => {
  const students = await tutorService.getAssignedStudents(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { students }, 'Assigned students retrieved successfully')
  );
});

exports.getMarks = catchAsync(async (req, res, next) => {
  const marks = await tutorService.getTutorMarks(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { marks }, 'Tutor marks retrieved successfully')
  );
});

exports.submitAttendance = catchAsync(async (req, res, next) => {
  const sessionService = require('../services/session.service');
  const session = await sessionService.submitManualSession(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, { session }, 'Attendance submitted for approval')
  );
});

exports.getEarnings = catchAsync(async (req, res, next) => {
  const data = await tutorService.getTutorEarnings(req.user.id);

  res.status(200).json(
    new ApiResponse(200, data, 'Tutor earnings retrieved successfully')
  );
});
