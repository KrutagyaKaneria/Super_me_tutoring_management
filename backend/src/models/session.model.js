const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    meetingLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'pending', 'completed', 'cancelled', 'approved', 'rejected'],
      default: 'scheduled',
    },
    startTime: {
      type: String, // scheduled time e.g. "10:00"
      required: true,
    },
    actualStartTime: {
      type: Date,
    },
    endTime: {
      type: String, // scheduled time e.g. "11:00"
      required: true,
    },
    actualEndTime: {
      type: Date,
    },
    durationInHours: {
      type: Number,
      required: true,
    },
    tutorNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
