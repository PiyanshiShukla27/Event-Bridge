import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BarChart3, PieChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try { const res = await API.get('/events/analytics/summary'); setStats(res.data); }
      catch (err) { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }
  if (!stats) return <div className="text-center py-12"><p className="text-neutral-400">No analytics data available</p></div>;

  const barData = {
    labels: stats.eventStats?.map(e => e.eventName?.length > 18 ? e.eventName.slice(0, 18) + '…' : e.eventName) || [],
    datasets: [{
      label: 'Enrolled',
      data: stats.eventStats?.map(e => e.totalEnrolled) || [],
      backgroundColor: '#5c7cfa',
      borderRadius: 8,
      maxBarThickness: 50,
    }]
  };

  const branchCounts = {};
  stats.eventStats?.forEach(e => { branchCounts[e.branch] = (branchCounts[e.branch] || 0) + e.totalEnrolled; });

  const branchColors = ['#5c7cfa', '#38d9a9', '#fab005', '#ff6b6b', '#845ef7', '#20c997', '#fd7e14', '#339af0'];

  const doughnutData = {
    labels: Object.keys(branchCounts),
    datasets: [{
      data: Object.values(branchCounts),
      backgroundColor: branchColors.slice(0, Object.keys(branchCounts).length),
      borderWidth: 0,
    }]
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c1917', titleColor: '#fff', bodyColor: '#e7e5e4', cornerRadius: 10, padding: 12 } },
    scales: { x: { grid: { display: false }, ticks: { color: '#78716c', font: { size: 11 } } }, y: { grid: { color: '#f5f5f4' }, ticks: { color: '#78716c', font: { size: 11 } } } }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 16, color: '#44403c', font: { size: 12 } } }, tooltip: { backgroundColor: '#1c1917', titleColor: '#fff', bodyColor: '#e7e5e4', cornerRadius: 10, padding: 12 } }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Event participation insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: stats.totalEvents, color: 'text-brand-600' },
          { label: 'Total Participants', value: stats.totalParticipants, color: 'text-emerald-600' },
          { label: 'Upcoming Events', value: stats.upcomingEvents, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-5 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value || 0}</p>
            <p className="text-sm text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-neutral-900">Participants per Event</h2>
          </div>
          <div className="h-72"><Bar data={barData} options={barOptions} /></div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-neutral-900">Branch Distribution</h2>
          </div>
          <div className="h-72"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
