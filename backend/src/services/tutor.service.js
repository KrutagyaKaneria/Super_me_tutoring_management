const Tutor = require('../models/tutor.model');
const AppError = require('../utils/AppError');

// Upsert logic for profile updating. We assume a tutor profile might not exist 
// on initial registration, but is implicitly created or updated when they provide details.
exports.updateTutorProfile = async (userId, updateData) => {
  // We only allow updating benign fields directly
  const allowedFields = ['subjects', 'languages', 'availabilitySlots'];
  const sanitizedData = {};
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      // Basic validation for availability slots
      if (field === 'availabilitySlots' && Array.isArray(updateData[field])) {
        updateData[field].forEach((slot, index) => {
          if (!slot.day || !slot.startTime || !slot.endTime) {
            console.log(`Validation failed for slot at index ${index}:`, slot);
            throw new AppError(`Invalid availability slot at index ${index}. Day, startTime, and endTime are required.`, 400);
          }
        });
      }
      sanitizedData[field] = updateData[field];
    }
  });

  const tutor = await Tutor.findOneAndUpdate(
    { user: userId },
    sanitizedData,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return tutor;
};

exports.getAssignedStudents = async (tutorUserId) => {
  const tutorProfile = await Tutor.findOne({ user: tutorUserId });
  if (!tutorProfile) return [];

  const Student = require('../models/student.model');
  const students = await Student.find({ assignedTutor: tutorProfile._id })
    .populate('user', 'name email');
    
  return students;
};

exports.getTutorMarks = async (tutorUserId) => {
  const Exam = require('../models/exam.model');
  const marks = await Exam.find({ addedBy: tutorUserId })
    .populate('studentId', 'name')
    .sort({ date: -1 });
    
  return marks;
};
