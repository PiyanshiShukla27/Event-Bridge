import { useState, useEffect } from 'react';
import API from '../../api/axios';
import EventCard from '../../components/EventCard';
import BranchFilter from '../../components/BranchFilter';
import { Search, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, enrollRes] = await Promise.all([API.get('/events'), API.get('/enrollments/my')]);
        setEvents(eventsRes.data);
        setMyEnrollments(enrollRes.data.map(e => e.event.id));
      } catch (err) { toast.error('Failed to load events'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleEnroll = async (eventId) => {
    setEnrollingId(eventId);
    try {
      await API.post(`/enrollments/${eventId}`);
      toast.success('Enrolled successfully! 🎉');
      setMyEnrollments([...myEnrollments, eventId]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll'); }
    finally { setEnrollingId(null); }
  };

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = selectedBranch === 'All' || e.branch === selectedBranch || e.branch === 'All';
    return matchSearch && matchBranch;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Browse Events</h1>
        <p className="text-neutral-500 text-sm mt-1">{filtered.length} events available</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="input-field pl-12" />
      </div>

      <BranchFilter selected={selectedBranch} onSelect={setSelectedBranch} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => {
            const isEnrolled = myEnrollments.includes(event._id);
            const isPast = new Date(event.date) < new Date();
            return (
              <EventCard key={event._id} event={event} actions={
                isEnrolled ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                  </span>
                ) : !isPast ? (
                  <button onClick={() => handleEnroll(event._id)} disabled={enrollingId === event._id}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm">
                    {enrollingId === event._id ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enroll Now'}
                  </button>
                ) : (
                  <span className="text-xs text-neutral-400">Event has ended</span>
                )
              } />
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">No events found</h3>
          <p className="text-neutral-400">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
};

export default BrowseEvents;
