import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import CertificateGenerator from '../../components/CertificateGenerator';
import { BookOpen, Calendar, MapPin, Clock, CheckCircle, XCircle, Hand, Tag, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [certData, setCertData] = useState(null);

  useEffect(() => { fetchMyEvents(); }, []);

  const fetchMyEvents = async () => {
    try { const res = await API.get('/enrollments/my'); setEnrollments(res.data); }
    catch (err) { toast.error('Failed to fetch enrollments'); }
    finally { setLoading(false); }
  };

  const handleMarkAttendance = async (eventId) => {
    setMarkingId(eventId);
    try {
      await API.put(`/enrollments/${eventId}/attendance`);
      toast.success('Attendance marked! ✅');
      setEnrollments(enrollments.map(e => e.event.id === eventId ? { ...e, attendanceStatus: 'present' } : e));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to mark attendance'); }
    finally { setMarkingId(null); }
  };

  const handleUnenroll = async (eventId, eventName) => {
    if (!window.confirm(`Unenroll from "${eventName}"?`)) return;
    try {
      await API.delete(`/enrollments/${eventId}`);
      toast.success('Unenrolled successfully');
      setEnrollments(enrollments.filter(e => e.event.id !== eventId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to unenroll'); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present': return <span className="badge-present"><CheckCircle className="w-3 h-3 mr-1" />Present</span>;
      case 'absent': return <span className="badge-absent"><XCircle className="w-3 h-3 mr-1" />Absent</span>;
      default: return <span className="badge-pending"><Clock className="w-3 h-3 mr-1" />Pending</span>;
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'upcoming') return new Date(e.event.date) >= new Date();
    if (filter === 'past') return new Date(e.event.date) < new Date();
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
          <p className="text-neutral-500 text-sm mt-1">{enrollments.length} events enrolled</p>
        </div>
        <Link to="/participant/browse" className="btn-primary w-fit text-sm py-2 px-4">Browse More Events</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit border border-neutral-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' }
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key ? 'bg-white text-brand-700 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((enrollment) => {
            const isPast = new Date(enrollment.event.date) < new Date();
            return (
              <div key={enrollment.enrollmentId} className="glass-card-hover p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-neutral-900">{enrollment.event.name}</h3>
                      {getStatusBadge(enrollment.attendanceStatus)}
                      {isPast && <span className="badge bg-neutral-100 text-neutral-500 border border-neutral-200">Past</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-500" />{formatDate(enrollment.event.date)}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" />{enrollment.event.venue}</span>
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-amber-500" />{enrollment.event.branch}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {enrollment.attendanceStatus === 'present' && (
                      <button
                        onClick={() => setCertData({
                          participantName: user?.name || 'Participant',
                          eventName: enrollment.event.name,
                          eventDate: enrollment.event.date,
                          eventVenue: enrollment.event.venue,
                          branch: enrollment.event.branch
                        })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all"
                      >
                        <Award className="w-4 h-4" /> Get Certificate
                      </button>
                    )}
                    {enrollment.attendanceStatus !== 'present' && !isPast && (
                      <button onClick={() => handleMarkAttendance(enrollment.event.id)} disabled={markingId === enrollment.event.id}
                        className="btn-success text-sm py-2 px-4 flex items-center gap-1.5">
                        {markingId === enrollment.event.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Hand className="w-4 h-4" />}
                        Mark Attendance
                      </button>
                    )}
                    {!isPast && (
                      <button onClick={() => handleUnenroll(enrollment.event.id, enrollment.event.name)}
                        className="btn-secondary text-sm py-2 px-4 text-red-500 hover:bg-red-50 hover:border-red-200">
                        Unenroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            {filter !== 'all' ? `No ${filter} events` : 'No enrolled events'}
          </h3>
          <p className="text-neutral-400 mb-4">{filter !== 'all' ? 'Try a different filter' : 'Start by browsing available events'}</p>
          {filter === 'all' && <Link to="/participant/browse" className="btn-primary inline-flex items-center gap-2 text-sm">Browse Events</Link>}
        </div>
      )}

      {/* Certificate Modal */}
      {certData && (
        <CertificateGenerator participantName={certData.participantName} eventName={certData.eventName}
          eventDate={certData.eventDate} eventVenue={certData.eventVenue} branch={certData.branch}
          onClose={() => setCertData(null)} />
      )}
    </div>
  );
};

export default MyEvents;
