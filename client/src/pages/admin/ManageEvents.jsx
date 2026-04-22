import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import EventCard from '../../components/EventCard';
import { Search, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await API.get('/events'); setEvents(res.data); }
    catch (err) { toast.error('Failed to fetch events'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) return;
    try {
      await API.delete(`/events/${eventId}`);
      toast.success('Event deleted');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const openEditModal = (event) => {
    const d = new Date(event.date);
    const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    setEditModal({ ...event, editDate: dateStr, editTime: timeStr });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const combinedDate = new Date(`${editModal.editDate}T${editModal.editTime}:00`);
      const payload = { name: editModal.name, description: editModal.description, date: combinedDate.toISOString(),
        venue: editModal.venue, branch: editModal.branch, maxParticipants: editModal.maxParticipants };
      await API.put(`/events/${editModal._id}`, payload);
      toast.success('Event updated');
      setEditModal(null);
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Manage Events</h1>
          <p className="text-neutral-500 text-sm mt-1">{events.length} events total</p>
        </div>
        <Link to="/admin/create-event" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="input-field pl-12" />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} actions={
              <>
                <Link to={`/admin/events/${event._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors border border-brand-100">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
                <button onClick={() => openEditModal(event)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(event._id, event.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </>
            } />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">{search ? 'No events match' : 'No events yet'}</h3>
          <p className="text-neutral-400 mb-4">{search ? 'Try a different search term' : 'Create your first event to get started'}</p>
          {!search && <Link to="/admin/create-event" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" />Create Event</Link>}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditModal(null)} />
          <div className="relative glass-card p-8 w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Edit Event</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="input-label">Event Name</label>
                <input type="text" value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea value={editModal.description} onChange={(e) => setEditModal({ ...editModal, description: e.target.value })} className="input-field h-24 resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Date</label>
                  <input type="date" value={editModal.editDate} onChange={(e) => setEditModal({ ...editModal, editDate: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Time</label>
                  <input type="time" value={editModal.editTime} onChange={(e) => setEditModal({ ...editModal, editTime: e.target.value })} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="input-label">Venue</label>
                <input type="text" value={editModal.venue} onChange={(e) => setEditModal({ ...editModal, venue: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Branch</label>
                  <select value={editModal.branch} onChange={(e) => setEditModal({ ...editModal, branch: e.target.value })} className="input-field appearance-none cursor-pointer" required>
                    {['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'All'].map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Max Participants</label>
                  <input type="number" value={editModal.maxParticipants} onChange={(e) => setEditModal({ ...editModal, maxParticipants: parseInt(e.target.value) || 1 })} min="1" className="input-field" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
