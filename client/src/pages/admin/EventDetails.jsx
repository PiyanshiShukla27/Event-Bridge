import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { ArrowLeft, Users, Calendar, MapPin, CheckCircle, XCircle, Clock, Tag, User } from 'lucide-react';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, partRes] = await Promise.all([API.get(`/events/${id}`), API.get(`/events/${id}/participants`)]);
      setEvent(eventRes.data); setParticipants(partRes.data);
    } catch (err) { toast.error('Failed to fetch event details'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (userId, status) => {
    try {
      await API.put(`/enrollments/${id}/verify`, { userId, status });
      toast.success('Attendance updated');
      setParticipants(participants.map(p => p.userId === userId ? { ...p, attendanceStatus: status } : p));
    } catch (err) { toast.error('Failed to update attendance'); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present': return <span className="badge-present"><CheckCircle className="w-3 h-3 mr-1" />Present</span>;
      case 'absent': return <span className="badge-absent"><XCircle className="w-3 h-3 mr-1" />Absent</span>;
      default: return <span className="badge-pending"><Clock className="w-3 h-3 mr-1" />Pending</span>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }
  if (!event) return <div className="text-center py-12"><p className="text-neutral-400">Event not found</p></div>;

  const presentCount = participants.filter(p => p.attendanceStatus === 'present').length;
  const absentCount = participants.filter(p => p.attendanceStatus === 'absent').length;
  const pendingCount = participants.filter(p => p.attendanceStatus === 'pending').length;

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      {/* Event Info */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">{event.name}</h1>
            <p className="text-neutral-500 mb-4 max-w-2xl leading-relaxed">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-500" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" />{event.venue}</span>
              <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-amber-500" />{event.branch}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" />{participants.length}/{event.maxParticipants} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
          <p className="text-xs text-neutral-500 mt-1">Present</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-neutral-500 mt-1">Absent</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          <p className="text-xs text-neutral-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Participants ({participants.length})</h2>
        </div>
        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Participant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Branch</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {participants.map((p) => (
                  <tr key={p.userId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">
                          {p.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 text-sm">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{p.branch}</td>
                    <td className="px-6 py-4">{getStatusBadge(p.attendanceStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleVerify(p.userId, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${p.attendanceStatus === 'present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 border border-neutral-200'}`}>
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />Present
                        </button>
                        <button onClick={() => handleVerify(p.userId, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${p.attendanceStatus === 'absent' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-600 border border-neutral-200'}`}>
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <User className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-400">No participants enrolled yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
