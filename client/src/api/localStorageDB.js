/**
 * LocalStorage-based Database Layer for EventBridge
 * Replaces MongoDB backend — all data persists in browser localStorage.
 * When a real backend is ready, simply switch the import in axios.js.
 */

const KEYS = {
  USERS: 'eb_users',
  EVENTS: 'eb_events',
  ENROLLMENTS: 'eb_enrollments',
};

// ── Helpers ──────────────────────────────────────────────
const generateId = () => '_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

const getStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Seed a default admin account so the app is usable immediately
const seedDefaults = () => {
  const users = getStore(KEYS.USERS);
  if (users.length === 0) {
    const defaultAdmin = {
      _id: generateId(),
      name: 'Admin User',
      email: 'admin@eventbridge.com',
      password: 'admin123',
      role: 'admin',
      branch: 'CSE',
      createdAt: new Date().toISOString(),
    };
    const defaultParticipant = {
      _id: generateId(),
      name: 'Test Student',
      email: 'student@eventbridge.com',
      password: 'student123',
      role: 'participant',
      branch: 'CSE',
      createdAt: new Date().toISOString(),
    };
    setStore(KEYS.USERS, [defaultAdmin, defaultParticipant]);
  }
};
seedDefaults();

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  login({ email, password, role }) {
    const users = getStore(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) throw { response: { data: { message: 'Invalid credentials' }, status: 401 } };
    const token = 'local_token_' + user._id;
    const { password: _, ...safeUser } = user;
    return { token, user: { ...safeUser, id: user._id } };
  },

  register({ name, email, password, role, branch }) {
    const users = getStore(KEYS.USERS);
    if (users.find(u => u.email === email && u.role === role)) {
      throw { response: { data: { message: 'User already exists with this email and role' }, status: 400 } };
    }
    const newUser = { _id: generateId(), name, email, password, role, branch, createdAt: new Date().toISOString() };
    users.push(newUser);
    setStore(KEYS.USERS, users);
    const token = 'local_token_' + newUser._id;
    const { password: _, ...safeUser } = newUser;
    return { token, user: { ...safeUser, id: newUser._id } };
  },
};

// ── Events ───────────────────────────────────────────────
export const eventsAPI = {
  getAll() {
    const events = getStore(KEYS.EVENTS);
    const enrollments = getStore(KEYS.ENROLLMENTS);
    return events.map(event => ({
      ...event,
      enrollmentCount: enrollments.filter(e => e.eventId === event._id).length,
      availableSlots: event.maxParticipants - enrollments.filter(e => e.eventId === event._id).length,
    }));
  },

  getById(id) {
    const events = getStore(KEYS.EVENTS);
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const event = events.find(e => e._id === id);
    if (!event) throw { response: { data: { message: 'Event not found' }, status: 404 } };
    return {
      ...event,
      enrollmentCount: enrollments.filter(e => e.eventId === event._id).length,
      availableSlots: event.maxParticipants - enrollments.filter(e => e.eventId === event._id).length,
    };
  },

  getParticipants(eventId) {
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const users = getStore(KEYS.USERS);
    return enrollments
      .filter(e => e.eventId === eventId)
      .map(e => {
        const user = users.find(u => u._id === e.userId);
        return {
          userId: e.userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          branch: user?.branch || '',
          attendanceStatus: e.attendanceStatus || 'pending',
          enrolledAt: e.enrolledAt,
        };
      });
  },

  create(data) {
    const events = getStore(KEYS.EVENTS);
    const newEvent = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    setStore(KEYS.EVENTS, events);
    return newEvent;
  },

  update(id, data) {
    const events = getStore(KEYS.EVENTS);
    const idx = events.findIndex(e => e._id === id);
    if (idx === -1) throw { response: { data: { message: 'Event not found' }, status: 404 } };
    events[idx] = { ...events[idx], ...data };
    setStore(KEYS.EVENTS, events);
    return events[idx];
  },

  delete(id) {
    let events = getStore(KEYS.EVENTS);
    events = events.filter(e => e._id !== id);
    setStore(KEYS.EVENTS, events);
    // Also remove enrollments for this event
    let enrollments = getStore(KEYS.ENROLLMENTS);
    enrollments = enrollments.filter(e => e.eventId !== id);
    setStore(KEYS.ENROLLMENTS, enrollments);
    return { message: 'Event deleted' };
  },

  getAnalyticsSummary() {
    const events = getStore(KEYS.EVENTS);
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now).length;

    const eventStats = events.map(event => {
      const eventEnrollments = enrollments.filter(e => e.eventId === event._id);
      return {
        eventId: event._id,
        eventName: event.name,
        branch: event.branch,
        date: event.date,
        maxParticipants: event.maxParticipants,
        totalEnrolled: eventEnrollments.length,
        presentCount: eventEnrollments.filter(e => e.attendanceStatus === 'present').length,
        absentCount: eventEnrollments.filter(e => e.attendanceStatus === 'absent').length,
      };
    });

    return {
      totalEvents: events.length,
      totalParticipants: enrollments.length,
      upcomingEvents,
      eventStats,
    };
  },
};

// ── Enrollments ──────────────────────────────────────────
export const enrollmentsAPI = {
  getMyEnrollments(userId) {
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const events = getStore(KEYS.EVENTS);
    return enrollments
      .filter(e => e.userId === userId)
      .map(e => {
        const event = events.find(ev => ev._id === e.eventId);
        return {
          enrollmentId: e._id,
          attendanceStatus: e.attendanceStatus || 'pending',
          enrolledAt: e.enrolledAt,
          event: event ? {
            id: event._id,
            _id: event._id,
            name: event.name,
            description: event.description,
            date: event.date,
            venue: event.venue,
            branch: event.branch,
            maxParticipants: event.maxParticipants,
          } : { id: e.eventId, name: 'Deleted Event', date: '', venue: '', branch: '' },
        };
      });
  },

  enroll(userId, eventId) {
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const events = getStore(KEYS.EVENTS);

    const event = events.find(e => e._id === eventId);
    if (!event) throw { response: { data: { message: 'Event not found' }, status: 404 } };

    const existing = enrollments.find(e => e.userId === userId && e.eventId === eventId);
    if (existing) throw { response: { data: { message: 'Already enrolled in this event' }, status: 400 } };

    const eventEnrollments = enrollments.filter(e => e.eventId === eventId);
    if (eventEnrollments.length >= event.maxParticipants) {
      throw { response: { data: { message: 'Event is full' }, status: 400 } };
    }

    const newEnrollment = {
      _id: generateId(),
      userId,
      eventId,
      attendanceStatus: 'pending',
      enrolledAt: new Date().toISOString(),
    };
    enrollments.push(newEnrollment);
    setStore(KEYS.ENROLLMENTS, enrollments);
    return newEnrollment;
  },

  unenroll(userId, eventId) {
    let enrollments = getStore(KEYS.ENROLLMENTS);
    const existing = enrollments.find(e => e.userId === userId && e.eventId === eventId);
    if (!existing) throw { response: { data: { message: 'Not enrolled in this event' }, status: 400 } };
    enrollments = enrollments.filter(e => !(e.userId === userId && e.eventId === eventId));
    setStore(KEYS.ENROLLMENTS, enrollments);
    return { message: 'Unenrolled successfully' };
  },

  markAttendance(userId, eventId) {
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const enrollment = enrollments.find(e => e.userId === userId && e.eventId === eventId);
    if (!enrollment) throw { response: { data: { message: 'Not enrolled in this event' }, status: 400 } };
    enrollment.attendanceStatus = 'present';
    setStore(KEYS.ENROLLMENTS, enrollments);
    return enrollment;
  },

  verifyAttendance(eventId, userId, status) {
    const enrollments = getStore(KEYS.ENROLLMENTS);
    const enrollment = enrollments.find(e => e.userId === userId && e.eventId === eventId);
    if (!enrollment) throw { response: { data: { message: 'Enrollment not found' }, status: 404 } };
    enrollment.attendanceStatus = status;
    setStore(KEYS.ENROLLMENTS, enrollments);
    return enrollment;
  },
};
