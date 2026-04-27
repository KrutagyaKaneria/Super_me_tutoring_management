const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: [0, 'Marks cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: true,
      min: [1, 'Total marks must be greater than zero'],
    },
    feedback: {
      type: String,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to natively prevent marks > totalMarks
examSchema.pre('save', function () {
  if (this.marks > this.totalMarks) {
    throw new Error('Marks cannot exceed total marks natively permitted for the exam.');
  }
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
