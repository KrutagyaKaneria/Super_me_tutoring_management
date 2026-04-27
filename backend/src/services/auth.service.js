const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

exports.registerUser = async (userData) => {
  // Prevent user from setting admin role via direct registration
  const role = userData.role === 'admin' ? 'student' : userData.role;

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: role || 'student',
  });

  const token = signToken(newUser._id);
  
  // Remove password from output
  newUser.password = undefined;

  return { user: newUser, token };
};

exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  // 1) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isActive) {
      throw new AppError('Account is inactive', 401);
  }

  // 2) If everything ok, send token to client
  const token = signToken(user._id);
  user.password = undefined;

  return { user, token };
};

exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
