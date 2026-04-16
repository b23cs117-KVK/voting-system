const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Virtual to determine if election is active
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Ensure virtuals are included in JSON output
electionSchema.set('toJSON', { virtuals: true });
electionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Election', electionSchema);
