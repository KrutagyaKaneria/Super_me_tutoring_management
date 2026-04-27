const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // parent User ID
    },
    assignedTutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor', // Assigned to a specific Tutor document
    },
    totalFeesPaid: {
      type: Number,
      default: 0,
    },
    pendingFees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
