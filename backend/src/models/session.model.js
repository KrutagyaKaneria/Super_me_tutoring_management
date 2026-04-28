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
      // NOTE: Legacy values ('pending'/'completed'/'ongoing') are retained to avoid breaking
      // existing data. New workflow MUST use: scheduled -> in_progress -> pending_approval -> approved/rejected
      enum: [
        'scheduled',
        'in_progress',
        'pending_approval',
        'approved',
        'rejected',
        'cancelled',
        // legacy
        'pending',
        'completed',
        'ongoing',
      ],
      default: 'scheduled',
    },
    // Scheduled time window
    scheduledStartTime: {
      type: String, // e.g. "10:00"
      required: true,
    },
    scheduledEndTime: {
      type: String, // e.g. "11:00"
      required: true,
    },

    // Actual timestamps (tutor attendance)
    // Mixed is used to preserve compatibility with any legacy data where startTime/endTime
    // might have been stored as strings.
    startTime: {
      type: mongoose.Schema.Types.Mixed,
    },
    endTime: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Legacy fields (kept for backward compatibility; not used by new workflow)
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    durationInHours: {
      type: Number,
      required: true,
      default: 0,
    },
    // Finance automation (applies only on approval)
    financialsApplied: {
      type: Boolean,
      default: false,
    },
    hourlyRate: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    // Advanced pricing (stored at approval time for historical accuracy)
    billingRatePerHour: {
      type: Number,
    },
    tutorPayoutPerHour: {
      type: Number,
    },
    tutorAmount: {
      type: Number,
    },
    platformMargin: {
      type: Number,
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
