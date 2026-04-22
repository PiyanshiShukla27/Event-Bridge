const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendanceStatus: {
    type: String,
    enum: ['pending', 'present', 'absent'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
