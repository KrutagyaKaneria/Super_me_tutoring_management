const Tutor = require('../models/tutor.model');
const Student = require('../models/student.model');
const Parent = require('../models/parent.model');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const AppError = require('../utils/AppError');

exports.getAllTutors = async () => {
  // 1. Find all users with role 'tutor'
  const tutorUsers = await User.find({ role: 'tutor' }).select('name email isActive');
  
  // 2. Ensure each has a profile and return them
  const tutors = await Promise.all(tutorUsers.map(async (user) => {
    let profile = await Tutor.findOne({ user: user._id }).populate('user', 'name email isActive');
    if (!profile) {
      profile = await Tutor.create({ user: user._id });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));
    
  return tutors;
};

exports.getAllStudents = async () => {
  // 1. Find all users with role 'student'
  const studentUsers = await User.find({ role: 'student' }).select('name email isActive');
  
  // 2. Ensure each has a profile and return them
  const students = await Promise.all(studentUsers.map(async (user) => {
    let profile = await Student.findOne({ user: user._id }).populate('user', 'name email isActive');
    if (!profile) {
      profile = await Student.create({ user: user._id });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));
    
  return students;
};

exports.assignTutorToStudent = async (studentUserId, tutorUserId) => {
  // 1. Validate both users exist in the system and have proper roles
  const [studentUser, tutorUser] = await Promise.all([
    User.findById(studentUserId),
    User.findById(tutorUserId)
  ]);

  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Valid student user not found', 404);
  }

  if (!tutorUser || tutorUser.role !== 'tutor') {
    throw new AppError('Valid tutor user not found', 404);
  }

  // 2. Prevent assigning inactive tutor
  if (!tutorUser.isActive) {
    throw new AppError('Cannot assign an inactive tutor', 400);
  }

  // 3. Ensure profiles exist (Coordinator handles implicit creation if they don't yet)
  let tutorProfile = await Tutor.findOne({ user: tutorUserId });
  if (!tutorProfile) {
      // Create bare profile if missing
      tutorProfile = await Tutor.create({ user: tutorUserId });
  }

  let studentProfile = await Student.findOne({ user: studentUserId });
  if (!studentProfile) {
      studentProfile = await Student.create({ user: studentUserId });
  }

  // 4. Prevent duplicate assignment
  if (studentProfile.assignedTutor && studentProfile.assignedTutor.toString() === tutorProfile._id.toString()) {
      throw new AppError('This tutor is already assigned to this student', 400);
  }

  // 5. Store assignedTutorId in Student Document
  studentProfile.assignedTutor = tutorProfile._id;
  await studentProfile.save();

  return studentProfile;
};

// PHASE 7 Additions
const FeeConfig = require('../models/feeConfig.model');

exports.getPendingAttendance = async () => {
  // 'completed' sessions are awaiting coordinator approval
  return await Session.find({ status: 'completed' })
    .populate('tutorId', 'name email')
    .populate('studentId', 'name email');
};

exports.approveSession = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);

  // Prevent duplicate approval
  if (session.status === 'approved') {
    throw new AppError('This session has already been approved financially.', 400);
  }

  // Must be completed first
  if (session.status !== 'completed') {
    throw new AppError(`Cannot approve a session with status: ${session.status}`, 400);
  }

  const student = await Student.findOne({ user: session.studentId });
  const tutor = await Tutor.findOne({ user: session.tutorId });

  if (!student || !tutor) throw new AppError('Associated profile mapping missing', 404);

  const gradeNumeric = parseInt(student.grade, 10);
  if (isNaN(gradeNumeric)) {
    throw new AppError('Student grade is not explicitly formatted as a number. Cannot determine hourly rate.', 400);
  }

  // Find fee config boundary
  const feeConfig = await FeeConfig.findOne({
    gradeMin: { $lte: gradeNumeric },
    gradeMax: { $gte: gradeNumeric }
  });

  if (!feeConfig) {
    throw new AppError(`No FeeConfig explicitly mapped for Grade ${gradeNumeric}.`, 404);
  }

  const amount = session.durationInHours * feeConfig.hourlyRate;

  // Atomically update metrics (ensure logic runs exclusively once)
  tutor.totalEarnings += amount;
  student.pendingFees += amount;
  session.status = 'approved';

  await tutor.save();
  await student.save();
  await session.save();

  return session;
};

exports.rejectSession = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) throw new AppError('Session not found', 404);

  if (session.status === 'approved' || session.status === 'rejected') {
     throw new AppError('Session is already processed.', 400);
  }

  session.status = 'rejected';
  await session.save();

  return session;
};

exports.getAllParents = async () => {
  const parentUsers = await User.find({ role: 'parent' }).select('name email isActive');

  const parents = await Promise.all(parentUsers.map(async (user) => {
    let profile = await Parent.findOne({ user: user._id }).populate('user', 'name email isActive').populate({
      path: 'children',
      populate: { path: 'user', select: 'name' }
    });
    if (!profile) {
      profile = await Parent.create({ user: user._id, children: [] });
      profile = await profile.populate('user', 'name email isActive');
    }
    return profile;
  }));

  return parents;
};

exports.linkParentToStudent = async (parentUserId, studentUserId) => {
  // 1. Validate parent user
  const parentUser = await User.findById(parentUserId);
  if (!parentUser || parentUser.role !== 'parent') {
    throw new AppError('Valid parent user not found', 404);
  }

  // 2. Validate student user
  const studentUser = await User.findById(studentUserId);
  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Valid student user not found', 404);
  }

  // 3. Get or create parent profile
  let parentProfile = await Parent.findOne({ user: parentUserId });
  if (!parentProfile) {
    parentProfile = await Parent.create({ user: parentUserId, children: [] });
  }

  // 4. Get or create student profile
  let studentProfile = await Student.findOne({ user: studentUserId });
  if (!studentProfile) {
    studentProfile = await Student.create({ user: studentUserId });
  }

  // 5. Prevent duplicate linkage
  const alreadyLinked = parentProfile.children.some(
    childId => childId.toString() === studentProfile._id.toString()
  );
  if (alreadyLinked) {
    throw new AppError('This student is already linked to this parent', 400);
  }

  // 6. Link: add student profile ID to parent's children array
  parentProfile.children.push(studentProfile._id);
  await parentProfile.save();

  // 7. Also store parent reference on student (for reverse lookup)
  studentProfile.parent = parentUserId;
  await studentProfile.save();

  // Return populated result
  const result = await Parent.findById(parentProfile._id)
    .populate('user', 'name email')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'name email' }
    });

  return result;
};
