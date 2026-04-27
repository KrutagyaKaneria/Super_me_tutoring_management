const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.register = catchAsync(async (req, res, next) => {
  const result = await authService.registerUser(req.body);

  res.status(201).json(
    new ApiResponse(201, result, 'User registered successfully')
  );
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  res.status(200).json(
    new ApiResponse(200, result, 'User logged in successfully')
  );
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is set by authMiddleware protect
  const user = await authService.getUserProfile(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User profile fetched successfully')
  );
});
