const reportService = require('../services/report.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getPlatformReports = catchAsync(async (req, res, next) => {
  const reportData = await reportService.getAdminPlatformReports();

  res.status(200).json(
    new ApiResponse(200, reportData, 'Platform macro reports compiled successfully')
  );
});
