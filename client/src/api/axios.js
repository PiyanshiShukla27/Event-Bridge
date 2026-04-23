/**
 * LocalStorage-based API Mock
 * Provides the same interface as the original axios-based API (API.get, API.post, etc.)
 * but routes all calls to localStorage instead of a backend server.
 *
 * When you're ready to connect a real backend, replace this file with the original axios.js:
 *   import axios from 'axios';
 *   const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', ... });
 */

import { authAPI, eventsAPI, enrollmentsAPI } from './localStorageDB';

// Get the current logged-in user's ID from localStorage
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('eventbridge_user'));
    return user?.id || user?._id || null;
  } catch { return null; }
};

// Simulate async behavior to keep the same Promise-based interface
const resolve = (data) => Promise.resolve({ data });
const reject = (error) => Promise.reject(error);

// Route-based request handler
const handleRequest = (method, url, data = {}) => {
  try {
    const userId = getCurrentUserId();

    // ── Auth Routes ───────────────────────────────────
    if (url === '/auth/login' && method === 'POST') {
      return resolve(authAPI.login(data));
    }
    if (url === '/auth/register' && method === 'POST') {
      return resolve(authAPI.register(data));
    }

    // ── Events Routes ─────────────────────────────────
    if (url === '/events/analytics/summary' && method === 'GET') {
      return resolve(eventsAPI.getAnalyticsSummary());
    }
    if (url === '/events' && method === 'GET') {
      return resolve(eventsAPI.getAll());
    }
    if (url === '/events' && method === 'POST') {
      return resolve(eventsAPI.create(data));
    }

    // GET /events/:id/participants
    const participantsMatch = url.match(/^\/events\/([^/]+)\/participants$/);
    if (participantsMatch && method === 'GET') {
      return resolve(eventsAPI.getParticipants(participantsMatch[1]));
    }

    // GET/PUT/DELETE /events/:id
    const eventMatch = url.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      const eventId = eventMatch[1];
      if (method === 'GET') return resolve(eventsAPI.getById(eventId));
      if (method === 'PUT') return resolve(eventsAPI.update(eventId, data));
      if (method === 'DELETE') return resolve(eventsAPI.delete(eventId));
    }

    // ── Enrollment Routes ─────────────────────────────
    if (url === '/enrollments/my' && method === 'GET') {
      return resolve(enrollmentsAPI.getMyEnrollments(userId));
    }

    // PUT /enrollments/:eventId/verify  { userId, status }
    const verifyMatch = url.match(/^\/enrollments\/([^/]+)\/verify$/);
    if (verifyMatch && method === 'PUT') {
      return resolve(enrollmentsAPI.verifyAttendance(verifyMatch[1], data.userId, data.status));
    }

    // PUT /enrollments/:eventId/attendance
    const attendanceMatch = url.match(/^\/enrollments\/([^/]+)\/attendance$/);
    if (attendanceMatch && method === 'PUT') {
      return resolve(enrollmentsAPI.markAttendance(userId, attendanceMatch[1]));
    }

    // POST /enrollments/:eventId  (enroll)
    const enrollMatch = url.match(/^\/enrollments\/([^/]+)$/);
    if (enrollMatch && method === 'POST') {
      return resolve(enrollmentsAPI.enroll(userId, enrollMatch[1]));
    }

    // DELETE /enrollments/:eventId  (unenroll)
    const unenrollMatch = url.match(/^\/enrollments\/([^/]+)$/);
    if (unenrollMatch && method === 'DELETE') {
      return resolve(enrollmentsAPI.unenroll(userId, unenrollMatch[1]));
    }

    // ── Health ────────────────────────────────────────
    if (url === '/health') {
      return resolve({ status: 'ok', message: 'EventBridge running in local mode (localStorage)' });
    }

    // Fallback
    console.warn(`[LocalAPI] Unhandled route: ${method} ${url}`);
    return reject({ response: { data: { message: 'Route not found' }, status: 404 } });

  } catch (error) {
    return reject(error);
  }
};

// Mock API object — same interface as axios instance
const API = {
  get: (url, config) => handleRequest('GET', url),
  post: (url, data, config) => handleRequest('POST', url, data),
  put: (url, data, config) => handleRequest('PUT', url, data),
  delete: (url, config) => handleRequest('DELETE', url),

  // Interceptors stub (not needed for local mode, but prevents crashes if referenced)
  interceptors: {
    request: { use: () => {}, eject: () => {} },
    response: { use: () => {}, eject: () => {} },
  },
};

export default API;
