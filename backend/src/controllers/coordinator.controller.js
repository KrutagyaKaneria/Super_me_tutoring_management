const coordinatorService = require('../services/coordinator.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getAllTutors = catchAsync(async (req, res, next) => {
  const tutors = await coordinatorService.getAllTutors();

  res.status(200).json(
    new ApiResponse(200, { tutors, count: tutors.length }, 'Tutors retrieved successfully')
  );
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const dashboardService = require('../services/dashboard.service');
  const data = await dashboardService.getCoordinatorDashboard();

  res.status(200).json(
    new ApiResponse(200, data, 'Coordinator dashboard retrieved')
  );
});

exports.assignStudent = catchAsync(async (req, res, next) => {
  const { studentId, tutorId } = req.body;

  if (!studentId || !tutorId) {
    return next(new (require('../utils/AppError'))('Please provide both studentId and tutorId', 400));
  }

  const studentProfile = await coordinatorService.assignTutorToStudent(studentId, tutorId);

  res.status(200).json(
    new ApiResponse(200, { studentProfile }, 'Tutor assigned to student successfully')
  );
});

exports.scheduleSession = catchAsync(async (req, res, next) => {
  const sessionService = require('../services/session.service');
  // req.user.id is the coordinator mapping
  const session = await sessionService.scheduleSession(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, { session }, 'Session scheduled successfully')
  );
});

exports.getPendingAttendance = catchAsync(async (req, res, next) => {
  const pending = await coordinatorService.getPendingAttendance();

  res.status(200).json(
    new ApiResponse(200, { pending, count: pending.length }, 'Pending attendance retrieved')
  );
});

exports.approveSession = catchAsync(async (req, res, next) => {
  const session = await coordinatorService.approveSession(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { session }, 'Session approved, financials verified')
  );
});

exports.rejectSession = catchAsync(async (req, res, next) => {
  const session = await coordinatorService.rejectSession(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { session }, 'Session rejected')
  );
});

exports.addMarks = catchAsync(async (req, res, next) => {
  const examService = require('../services/exam.service');
  const exam = await examService.addMarks(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, { exam }, 'Marks natively added successfully via Coordinator map')
  );
});

exports.getAllMarks = catchAsync(async (req, res, next) => {
  const Exam = require('../models/exam.model');
  const marks = await Exam.find().populate('studentId', 'name').sort({ date: -1 });

  res.status(200).json(
    new ApiResponse(200, { marks }, 'All student marks retrieved')
  );
});

exports.getAllSessions = catchAsync(async (req, res, next) => {
  const Session = require('../models/session.model');
  const sessions = await Session.find()
    .populate('studentId', 'name')
    .populate('tutorId', 'name')
    .sort({ scheduledDate: -1 });

  res.status(200).json(
    new ApiResponse(200, { sessions }, 'All sessions retrieved successfully')
  );
});

exports.getAllStudents = catchAsync(async (req, res, next) => {
  const students = await coordinatorService.getAllStudents();

  res.status(200).json(
    new ApiResponse(200, { students }, 'All students retrieved successfully')
  );
});

exports.getAllParents = catchAsync(async (req, res, next) => {
  const parents = await coordinatorService.getAllParents();

  res.status(200).json(
    new ApiResponse(200, { parents }, 'All parents retrieved successfully')
  );
});

exports.linkParent = catchAsync(async (req, res, next) => {
  const { parentId, studentId } = req.body;

  if (!parentId || !studentId) {
    return next(new (require('../utils/AppError'))('Please provide both parentId and studentId', 400));
  }

  const result = await coordinatorService.linkParentToStudent(parentId, studentId);

  res.status(200).json(
    new ApiResponse(200, { parent: result }, 'Student linked to parent successfully')
  );
});
