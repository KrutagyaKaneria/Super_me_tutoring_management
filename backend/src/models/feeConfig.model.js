const mongoose = require('mongoose');

const feeConfigSchema = new mongoose.Schema(
  {
    gradeMin: {
      type: Number,
      required: true,
    },
    gradeMax: {
      type: Number,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FeeConfig = mongoose.model('FeeConfig', feeConfigSchema);
module.exports = FeeConfig;
