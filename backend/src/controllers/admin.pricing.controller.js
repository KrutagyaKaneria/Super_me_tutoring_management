const coordinatorService = require('../services/coordinator.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.upsertAssignmentPricing = catchAsync(async (req, res, next) => {
  const pricing = await coordinatorService.upsertAssignmentPricing(req.body);

  res.status(200).json(
    new ApiResponse(200, { pricing }, 'Assignment pricing updated successfully')
  );
});

exports.getAssignmentPricing = catchAsync(async (req, res, next) => {
  const { tutorId, studentId, subject } = req.query;
  const pricing = await coordinatorService.getAssignmentPricing(tutorId, studentId, subject);

  res.status(200).json(
    new ApiResponse(200, { pricing }, 'Assignment pricing retrieved successfully')
  );
});
