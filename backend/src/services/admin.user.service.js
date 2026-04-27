const User = require('../models/user.model');
const AppError = require('../utils/AppError');

exports.createUser = async (userData) => {
  // Validate unique email is handled by mongoose, but good to ensure fields are clean
  const { name, email, password, role, isActive } = userData;

  // Let Mongoose handle duplicate email via its unique index (will throw 11000 error, 
  // or we can manually check for cleaner error message)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 400);
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    isActive: isActive !== undefined ? isActive : true
  });

  // Automatically create role-specific profiles
  console.log(`Creating profile for role: ${role} for user: ${newUser._id}`);
  
  if (role === 'tutor') {
    const Tutor = require('../models/tutor.model');
    await Tutor.create({ user: newUser._id });
    console.log('Tutor profile created');
  } else if (role === 'student') {
    const Student = require('../models/student.model');
    await Student.create({ user: newUser._id });
    console.log('Student profile created');
  } else if (role === 'parent') {
    const Parent = require('../models/parent.model');
    await Parent.create({ user: newUser._id });
    console.log('Parent profile created');
  }

  newUser.password = undefined; // Don't return password
  return newUser;
};

exports.getAllUsers = async () => {
  const users = await User.find().select('-__v');
  return users;
};

exports.updateUser = async (userId, updateData) => {
  // Prevent password updates through this general update service
  if (updateData.password) {
     throw new AppError('This route is not for password updates. Please use a dedicated route.', 400);
  }
  
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return user;
};

exports.deleteUser = async (adminId, userId) => {
  // Prevent admin from deleting themselves
  if (adminId.toString() === userId.toString()) {
    throw new AppError('You cannot delete your own admin account.', 400);
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  return null;
};
