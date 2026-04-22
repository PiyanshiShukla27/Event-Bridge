const express = require('express');
const Enrollment = require('../models/Enrollment');
const Event = require('../models/Event');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments/:eventId
// @desc    Enroll in an event (participant only)
// @access  Private/Participant
router.post('/:eventId', authenticate, authorize('participant'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot enroll in a past event' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      eventId: req.params.eventId
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this event' });
    }

    // Check available slots
    const enrollmentCount = await Enrollment.countDocuments({ eventId: req.params.eventId });
    if (enrollmentCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'No available slots for this event' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enrollment error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already enrolled in this event' });
    }
    res.status(500).json({ message: 'Server error during enrollment' });
  }
});

// @route   DELETE /api/enrollments/:eventId
// @desc    Unenroll from an event (participant only)
// @access  Private/Participant
router.delete('/:eventId', authenticate, authorize('participant'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Successfully unenrolled' });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ message: 'Server error during unenrollment' });
  }
});

// @route   GET /api/enrollments/my
// @desc    Get my enrollments (participant)
// @access  Private/Participant
router.get('/my', authenticate, authorize('participant'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate({
        path: 'eventId',
        populate: { path: 'adminId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    const result = enrollments
      .filter(e => e.eventId) // filter out deleted events
      .map(e => ({
        enrollmentId: e._id,
        attendanceStatus: e.attendanceStatus,
        enrolledAt: e.createdAt,
        event: {
          id: e.eventId._id,
          name: e.eventId.name,
          description: e.eventId.description,
          date: e.eventId.date,
          venue: e.eventId.venue,
          branch: e.eventId.branch,
          admin: e.eventId.adminId
        }
      }));

    res.json(result);
  } catch (error) {
    console.error('My enrollments error:', error);
    res.status(500).json({ message: 'Server error fetching enrollments' });
  }
});

// @route   PUT /api/enrollments/:eventId/attendance
// @desc    Mark own attendance (participant)
// @access  Private/Participant
router.put('/:eventId/attendance', authenticate, authorize('participant'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.attendanceStatus = 'present';
    await enrollment.save();

    res.json({ message: 'Attendance marked successfully', enrollment });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
});

// @route   PUT /api/enrollments/:enrollmentId/verify
// @desc    Admin verify/update attendance
// @access  Private/Admin
router.put('/:enrollmentId/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }

    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('eventId');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Verify admin owns this event
    if (enrollment.eventId.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this enrollment' });
    }

    enrollment.attendanceStatus = status;
    await enrollment.save();

    res.json({ message: 'Attendance updated', enrollment });
  } catch (error) {
    console.error('Verify attendance error:', error);
    res.status(500).json({ message: 'Server error verifying attendance' });
  }
});

module.exports = router;
