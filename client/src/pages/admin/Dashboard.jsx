import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { Calendar, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const res = await API.get('/events/analytics/summary'); setStats(res.data); }
    catch (err) { console.error('Failed to fetch stats:', err); }
    finally { setLoading(false); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, bg: 'bg-brand-50', iconBg: 'bg-brand-600', iconColor: 'text-white' },
    { label: 'Total Enrollments', value: stats?.totalParticipants || 0, icon: Users, bg: 'bg-emerald-50', iconBg: 'bg-emerald-600', iconColor: 'text-white' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: TrendingUp, bg: 'bg-amber-50', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Welcome back, <span className="text-brand-700">{user?.name}</span> 👋
        </h1>
        <p className="text-neutral-500">Here's what's happening with your events today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconBg }) => (
          <div key={label} className="glass-card p-6 group hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-0.5">{value}</p>
            <p className="text-sm text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { to: '/admin/create-event', label: 'Create New Event', desc: 'Set up a new event for your department', icon: Calendar, iconBg: 'bg-brand-100', iconColor: 'text-brand-600' },
              { to: '/admin/events', label: 'Manage Events', desc: 'View, edit, and manage all your events', icon: Users, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { to: '/admin/analytics', label: 'View Analytics', desc: 'Charts and insights about participation', icon: TrendingUp, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
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
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Events</h2>
          {stats?.eventStats?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.eventStats.slice(0, 5).map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate text-sm">{event.eventName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />{formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Users className="w-3 h-3" />{event.totalEnrolled}/{event.maxParticipants}
                      </span>
                    </div>
                  </div>
                  <Link to={`/admin/events/${event.eventId}`} className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-400 mb-3">No events yet</p>
              <Link to="/admin/create-event" className="btn-primary text-sm py-2 px-4">Create Your First Event</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
