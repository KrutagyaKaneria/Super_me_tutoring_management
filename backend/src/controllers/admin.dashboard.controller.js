const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');

exports.getAdminDashboard = catchAsync(async (req, res, next) => {
  const data = await dashboardService.getAdminDashboard();
  res.status(200).json(new ApiResponse(200, data, 'Admin dashboard fetched successfully'));
});
