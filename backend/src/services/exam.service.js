const Exam = require('../models/exam.model');
const Parent = require('../models/parent.model');
const AppError = require('../utils/AppError');

exports.addMarks = async (addedByUserId, data) => {
  const { studentId, subject, examName, date, marks, totalMarks, feedback } = data;

  if (marks < 0) throw new AppError('Marks cannot be negative', 400);
  if (marks > totalMarks) throw new AppError('Marks cannot exceed totalMarks natively', 400);

  const newExam = await Exam.create({
    studentId,
    subject,
    examName,
    date,
    marks,
    totalMarks,
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
