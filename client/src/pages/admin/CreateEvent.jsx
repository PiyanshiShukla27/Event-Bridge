import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { CalendarPlus, FileText, Calendar, Clock, MapPin, Tag, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BioTech', 'All'];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', eventDate: '', eventTime: '10:00',
    venue: '', branch: 'All', maxParticipants: 50
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'maxParticipants' ? parseInt(value) || '' : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventDate) { toast.error('Please select an event date'); return; }
    setLoading(true);
    try {
      const combinedDate = new Date(`${formData.eventDate}T${formData.eventTime || '10:00'}:00`);
      const payload = {
        name: formData.name, description: formData.description, date: combinedDate.toISOString(),
        venue: formData.venue, branch: formData.branch, maxParticipants: formData.maxParticipants
      };
      await API.post('/events', payload);
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <CalendarPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Create New Event</h1>
            <p className="text-neutral-500 text-sm">Fill in the details to create a new event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="input-label">Event Name</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="e.g., Annual Hackathon 2024" className="input-field pl-12" required />
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Describe your event, its objectives, and what participants can expect..."
              className="input-field h-32 resize-none" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Event Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="input-field pl-12" required />
              </div>
            </div>
            <div>
              <label className="input-label">Event Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className="input-field pl-12" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Venue</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="text" name="venue" value={formData.venue} onChange={handleChange}
                  placeholder="e.g., Auditorium Hall A" className="input-field pl-12" required />
              </div>
            </div>
            <div>
              <label className="input-label">Branch / Department</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select name="branch" value={formData.branch} onChange={handleChange} className="input-field pl-12 appearance-none cursor-pointer" required>
                  {BRANCHES.map((b) => (<option key={b} value={b}>{b === 'All' ? 'All Departments' : b}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Max Participants</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange}
                min="1" className="input-field pl-12" required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                <><CalendarPlus className="w-4 h-4" /> Create Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
