const Exam = require('../models/exam.model');
const Parent = require('../models/parent.model');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

exports.addMarks = async (addedByUserId, data) => {
  const { studentId, subject, examName, date, marks, totalMarks, feedback } = data;

  if (!studentId) throw new AppError('studentId is required', 400);
  if (!subject) throw new AppError('subject is required', 400);
  if (!examName) throw new AppError('examName is required', 400);
  if (!date) throw new AppError('date is required', 400);

  const marksNumber = Number(marks);
  const totalMarksNumber = Number(totalMarks);
  if (!Number.isFinite(marksNumber) || !Number.isFinite(totalMarksNumber)) {
    throw new AppError('marks and totalMarks must be valid numbers', 400);
  }

  if (totalMarksNumber <= 0) {
    throw new AppError('totalMarks must be greater than 0', 400);
  }

  if (marksNumber < 0) throw new AppError('Marks cannot be negative', 400);
  if (marksNumber > totalMarksNumber) throw new AppError('Marks cannot exceed totalMarks', 400);

  const studentUser = await User.findById(studentId).select('role');
  if (!studentUser || studentUser.role !== 'student') {
    throw new AppError('Invalid studentId. Marks must be linked to a student user.', 400);
  }

  const examDate = new Date(date);
  if (Number.isNaN(examDate.getTime())) {
    throw new AppError('Invalid date', 400);
  }

  const newExam = await Exam.create({
    studentId,
    subject,
    examName,
    date: examDate,
    marks: marksNumber,
    totalMarks: totalMarksNumber,
    feedback,
    addedBy: addedByUserId
  });

  return newExam;
};

exports.getStudentMarks = async (studentUserId) => {
  return await Exam.find({ studentId: studentUserId })
    .populate('addedBy', 'name role')
    .sort({ date: -1 });
};

exports.getParentStudentMarks = async (parentUserId) => {
  const populatedParent = await Parent.findOne({ user: parentUserId }).populate('children');
  
  if (!populatedParent || !populatedParent.children || populatedParent.children.length === 0) {
     return [];
  }

  // Extract the raw User IDs bound to the Student Profiles natively
  const studentUserIds = populatedParent.children.map(child => child.user);

  return await Exam.find({ studentId: { $in: studentUserIds } })
    .populate('studentId', 'name')
    .populate('addedBy', 'name role')
    .sort({ date: -1 });
};
