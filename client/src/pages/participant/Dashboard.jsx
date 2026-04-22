import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { Calendar, BookOpen, CheckCircle, ArrowRight, Clock, MapPin } from 'lucide-react';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await API.get('/enrollments/my'); setEnrollments(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  const upcoming = enrollments.filter(e => new Date(e.event.date) >= new Date());
  const attended = enrollments.filter(e => e.attendanceStatus === 'present');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Hey, <span className="text-brand-700">{user?.name}</span> 👋
        </h1>
        <p className="text-neutral-500">Here's your event activity overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Enrolled Events', value: enrollments.length, icon: BookOpen, iconBg: 'bg-brand-600' },
          { label: 'Upcoming Events', value: upcoming.length, icon: Calendar, iconBg: 'bg-amber-500' },
          { label: 'Events Attended', value: attended.length, icon: CheckCircle, iconBg: 'bg-emerald-600' },
        ].map(({ label, value, icon: Icon, iconBg }) => (
          <div key={label} className="glass-card p-6 group hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-sm mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-0.5">{value}</p>
            <p className="text-sm text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { to: '/participant/browse', label: 'Browse Events', desc: 'Discover and enroll in new events', icon: Calendar, iconBg: 'bg-brand-100', iconColor: 'text-brand-600' },
              { to: '/participant/my-events', label: 'My Events', desc: 'View enrollments and certificates', icon: BookOpen, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            ].map(({ to, label, desc, icon: Icon, iconBg, iconColor }) => (
              <Link key={to} to={to}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-all duration-150 group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 text-sm">{label}</p>
                    <p className="text-xs text-neutral-400">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Upcoming Events</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-2.5">
              {upcoming.slice(0, 5).map(e => (
                <div key={e.enrollmentId} className="p-3 bg-neutral-50 rounded-xl">
                  <p className="font-medium text-neutral-800 text-sm mb-1">{e.event.name}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(e.event.date)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.event.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-400 mb-3">No upcoming events</p>
              <Link to="/participant/browse" className="btn-primary text-sm py-2 px-4">Browse Events</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
