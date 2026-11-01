import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';
import { EventItem, GuestItem, ExpenseItem, TaskItem } from '../../types';

interface EventListViewProps {
  events: EventItem[];
  activeEventId: string | null;
  guests: GuestItem[];
  expenses: ExpenseItem[];
  tasks: TaskItem[];
  onSelectEvent: (eventId: string) => void;
  onOpenCreate: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (eventId: string) => void;
  onDuplicateEvent: (event: EventItem) => void;
  onResetDemo: () => void;
}

export const EventListView: React.FC<EventListViewProps> = ({
  events,
  activeEventId,
  guests,
  expenses,
  tasks,
  onSelectEvent,
  onOpenCreate,
  onEditEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onResetDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return null;
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Celebration Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse and manage all your scheduled gatherings, weddings, galas, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New Celebration</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, venue, or address..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="all">All Categories</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate Gala">Corporate Gala</option>
            <option value="College Festival">College Festival</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Private Dinner">Private Dinner</option>
            <option value="Conference">Conference</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Community">Community</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-lg font-bold text-stone-800">
            {events.length === 0 ? 'No Celebrations Created Yet' : 'No Matching Events'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {events.length === 0
              ? 'Get started by creating your first celebration or load a starter template to explore the planner.'
              : 'Try clearing your search query or switching your category filter.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 shadow-sm"
            >
              + Create First Celebration
            </button>
            {events.length === 0 && (
              <button
                onClick={onResetDemo}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Load Starter Template
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const isActive = evt.id === activeEventId;
            const daysDiff = getDaysDiff(evt.date);
            const evtGuests = guests.filter((g) => g.eventId === evt.id);
            const confirmedCount = evtGuests.filter((g) => g.rsvpStatus === 'confirmed').length;
            const evtExpenses = expenses.filter((e) => e.eventId === evt.id);
            const totalSpent = evtExpenses.reduce((sum, e) => sum + (e.actualAmount || e.plannedAmount), 0);
            const evtTasks = tasks.filter((t) => t.eventId === evt.id);
            const completedTasks = evtTasks.filter((t) => t.completed).length;
            const taskProgress = evtTasks.length > 0 ? Math.round((completedTasks / evtTasks.length) * 100) : 0;
            const remainingBudget = evt.targetBudget - totalSpent;

            return (
              <div
                key={evt.id}
                className={`group bg-white rounded-2xl border transition-all duration-150 p-5 flex flex-col justify-between ${
                  isActive
                    ? 'border-stone-900 shadow-md ring-1 ring-stone-900/10'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top Bar with Category & Active indicator */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">{evt.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{evt.date ? new Date(evt.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}</span>
                      {daysDiff !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className={daysDiff < 0 ? 'text-stone-400' : daysDiff <= 14 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-medium'}>
                            {daysDiff < 0 ? 'Past Event' : daysDiff === 0 ? 'Today!' : `${daysDiff} days left`}
                          </span>
                        </>
                      )}
                    </div>

                    {isActive && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Active Workspace
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-serif-display text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                    {evt.title}
                  </h3>
                  {evt.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 mb-3">
                      {evt.description}
                    </p>
                  )}

                  {/* Venue / Location */}
                  {evt.location && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}

                  {/* Key Metrics strip */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs mb-4">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-stone-400">Budget Spent</div>
                      <div className="font-semibold text-stone-800 mt-0.5">
                        ${totalSpent.toLocaleString()}
                        <span className="text-[10px] text-stone-400 font-normal"> / ${evt.targetBudget.toLocaleString()}</span>
                      </div>
                      <div className={`text-[10px] ${remainingBudget < 0 ? 'text-red-600 font-medium' : 'text-stone-500'}`}>
                        {remainingBudget >= 0 ? `$${remainingBudget.toLocaleString()} left` : `Over by $${Math.abs(remainingBudget).toLocaleString()}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-stone-400">RSVPs</div>
                      <div className="font-semibold text-stone-800 mt-0.5">
                        {confirmedCount} Confirmed
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {evtGuests.length} Total Invited
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-stone-400">Checklist</div>
                      <div className="font-semibold text-stone-800 mt-0.5">
                        {completedTasks}/{evtTasks.length} ({taskProgress}%)
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-stone-900 h-full rounded-full transition-all"
                          style={{ width: `${taskProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEvent(evt)}
                      title="Edit Event Details"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateEvent(evt)}
                      title="Duplicate Event"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(evt.id)}
                      title="Delete Event"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectEvent(evt.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <span>{isActive ? 'Open Dashboard' : 'Select Event'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Confirm Delete Celebration
            </h3>
            <p className="text-xs text-stone-600 mt-2">
              Are you sure you want to delete this celebration? All associated guest records, logged expenses, and timeline tasks for this event will also be permanently removed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteEvent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Delete Celebration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
