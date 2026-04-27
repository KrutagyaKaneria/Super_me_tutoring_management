const adminUserService = require('../services/admin.user.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.createUser = catchAsync(async (req, res, next) => {
  const result = await adminUserService.createUser(req.body);

  res.status(201).json(
    new ApiResponse(201, { user: result }, 'User created successfully')
  );
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await adminUserService.getAllUsers();

  res.status(200).json(
    new ApiResponse(200, { users, count: users.length }, 'Users retrieved successfully')
  );
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const result = await adminUserService.updateUser(req.params.id, req.body);

  res.status(200).json(
    new ApiResponse(200, { user: result }, 'User updated successfully')
  );
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // adminId is req.user.id, user ID to delete is req.params.id
  await adminUserService.deleteUser(req.user.id, req.params.id);

  res.status(204).json({
    success: true,
    data: null,
    message: 'User deleted successfully'
  });
});
