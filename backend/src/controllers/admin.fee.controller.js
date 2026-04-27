const FeeConfig = require('../models/feeConfig.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.upsertFeeConfig = catchAsync(async (req, res, next) => {
  const { gradeMin, gradeMax, hourlyRate } = req.body;

  // We find one that exists or create a new one based on the bounds
  const feeConfig = await FeeConfig.findOneAndUpdate(
    { gradeMin, gradeMax },
    { hourlyRate },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, { feeConfig }, 'Fee configuration updated successfully')
  );
});

exports.getAllFeeConfigs = catchAsync(async (req, res, next) => {
  const feeConfigs = await FeeConfig.find().sort({ gradeMin: 1 });
  res.status(200).json(
    new ApiResponse(200, { feeConfigs, count: feeConfigs.length }, 'Fee configs retrieved')
  );
});
