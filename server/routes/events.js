const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Enrollment = require('../models/Enrollment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (with optional filters)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { branch, search, upcoming } = req.query;
    const filter = {};

    if (branch && branch !== 'All') {
      filter.$or = [{ branch }, { branch: 'All' }];
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }

    // If admin, only show their events
    if (req.user.role === 'admin') {
      filter.adminId = req.user._id;
    }

    const events = await Event.find(filter)
      .populate('adminId', 'name email')
      .sort({ date: 1 });

    // Get enrollment counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const enrollmentCount = await Enrollment.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          enrollmentCount,
          availableSlots: event.maxParticipants - enrollmentCount
        };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   GET /api/events/analytics/summary
// @desc    Get analytics summary (admin)
// @access  Private/Admin
router.get('/analytics/summary', authenticate, authorize('admin'), async (req, res) => {
  try {
    const adminEvents = await Event.find({ adminId: req.user._id });
    const eventIds = adminEvents.map(e => e._id);

    const enrollments = await Enrollment.find({ eventId: { $in: eventIds } })
      .populate('userId', 'branch');

    // Branch-wise participation
    const branchStats = {};
    enrollments.forEach(e => {
      const branch = e.userId?.branch || 'Unknown';
      branchStats[branch] = (branchStats[branch] || 0) + 1;
    });

    // Per-event participation
    const eventStats = await Promise.all(
      adminEvents.map(async (event) => {
        const count = await Enrollment.countDocuments({ eventId: event._id });
        const presentCount = await Enrollment.countDocuments({ eventId: event._id, attendanceStatus: 'present' });
        return {
          eventName: event.name,
          eventId: event._id,
          totalEnrolled: count,
          presentCount,
          maxParticipants: event.maxParticipants,
          date: event.date
        };
      })
    );

    const totalParticipants = enrollments.length;
    const totalEvents = adminEvents.length;
    const upcomingEvents = adminEvents.filter(e => new Date(e.date) >= new Date()).length;

    res.json({
      totalEvents,
      totalParticipants,
      upcomingEvents,
      branchStats,
      eventStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with details
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('adminId', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const enrollmentCount = await Enrollment.countDocuments({ eventId: event._id });

    res.json({
      ...event.toObject(),
      enrollmentCount,
      availableSlots: event.maxParticipants - enrollmentCount
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// @route   GET /api/events/:id/participants
// @desc    Get participants enrolled in an event (admin)
// @access  Private/Admin
router.get('/:id/participants', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view participants of this event' });
    }

    const enrollments = await Enrollment.find({ eventId: req.params.id })
      .populate('userId', 'name email branch')
      .sort({ createdAt: -1 });

    const participants = enrollments.map(e => ({
      enrollmentId: e._id,
      userId: e.userId._id,
      name: e.userId.name,
      email: e.userId.email,
      branch: e.userId.branch,
      attendanceStatus: e.attendanceStatus,
      enrolledAt: e.createdAt
    }));

    res.json(participants);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error fetching participants' });
  }
});

// @route   POST /api/events
// @desc    Create a new event (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('branch').isIn(['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'All']).withMessage('Valid branch is required'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, description, date, venue, branch, maxParticipants } = req.body;
    const event = await Event.create({
      name,
      description,
      date,
      venue,
      branch,
      maxParticipants,
      adminId: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event (admin only, own events)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { name, description, date, venue, branch, maxParticipants } = req.body;
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, description, date, venue, branch, maxParticipants },
      { new: true, runValidators: true }
    );

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (admin only, own events)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete all enrollments for this event
    await Enrollment.deleteMany({ eventId: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

module.exports = router;
