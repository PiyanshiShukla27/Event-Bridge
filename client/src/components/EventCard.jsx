import { Calendar, MapPin, Users, Tag } from 'lucide-react';

const EventCard = ({ event, actions, showSlots = true, className = '' }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Date TBD';
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPast = new Date(event.date) < new Date();
  const slotsAvailable = event.availableSlots ?? (event.maxParticipants - (event.enrollmentCount || 0));
  const slotsPercent = event.maxParticipants ? ((event.enrollmentCount || 0) / event.maxParticipants) * 100 : 0;

  const branchColors = {
    CSE: 'bg-blue-50 text-blue-700 border-blue-200',
    IT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    ECE: 'bg-amber-50 text-amber-700 border-amber-200',
    EE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ME: 'bg-orange-50 text-orange-700 border-orange-200',
    CE: 'bg-green-50 text-green-700 border-green-200',
    BioTech: 'bg-purple-50 text-purple-700 border-purple-200',
    All: 'bg-brand-50 text-brand-700 border-brand-200',
  };

  return (
    <div className={`glass-card-hover p-5 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate mb-1.5">{event.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${branchColors[event.branch] || branchColors.All}`}>
            <Tag className="w-3 h-3 mr-1" />
            {event.branch}
          </span>
        </div>
        {isPast && (
          <span className="badge bg-neutral-100 text-neutral-500 border border-neutral-200 flex-shrink-0">
            Past
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
        {event.description}
      </p>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{event.venue}</span>
        </div>
        {showSlots && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Users className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{slotsAvailable} / {event.maxParticipants} slots available</span>
          </div>
        )}
      </div>

      {/* Slots Progress Bar */}
      {showSlots && (
        <div className="mb-4">
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                slotsPercent >= 90 ? 'bg-red-400' : slotsPercent >= 60 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(slotsPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100">
          {actions}
        </div>
      )}
    </div>
  );
};

export default EventCard;
