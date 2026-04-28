const mongoose = require('mongoose');

const assignmentPricingSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: subject-specific pricing. Empty string means "all subjects".
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    // Metadata fields (optional)
    board: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    customNotes: {
      type: String,
      trim: true,
    },

    // Rates (per hour)
    billingRatePerHour: {
      type: Number,
      min: 0,
    },
    tutorPayoutPerHour: {
      type: Number,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentPricingSchema.index(
  { tutorId: 1, studentId: 1, subject: 1 },
  { unique: true, name: 'uniq_tutor_student_subject_pricing' }
);

const AssignmentPricing = mongoose.model('AssignmentPricing', assignmentPricingSchema);
module.exports = AssignmentPricing;
