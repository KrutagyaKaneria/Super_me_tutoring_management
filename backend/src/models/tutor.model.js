const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    subjects: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    availabilitySlots: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Tutor = mongoose.model('Tutor', tutorSchema);
module.exports = Tutor;
