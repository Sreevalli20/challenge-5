import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { EventCategory, EventItem } from '../../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: EventItem | null;
}

const CATEGORIES: EventCategory[] = [
  'Wedding',
  'Birthday',
  'Corporate Gala',
  'College Festival',
  'Anniversary',
  'Private Dinner',
  'Conference',
  'Baby Shower',
  'Community',
  'Other',
];

const TEMPLATES = [
  {
    title: '30th Milestone Birthday Bash',
    category: 'Birthday' as EventCategory,
    location: 'Skyline Terrace Lounge & Bar',
    targetBudget: 4500,
    time: '19:00',
    endTime: '01:00',
    description: 'An intimate rooftop cocktail party with DJ, signature drinks, tapas, and photo booth.',
  },
  {
    title: 'Autumn Garden Wedding & Reception',
    category: 'Wedding' as EventCategory,
    location: 'Meadowood Botanical Estate',
    targetBudget: 28000,
    time: '16:00',
    endTime: '23:00',
    description: 'Outdoor ceremony under oak trees followed by marquee dinner, live 6-piece band, and dancing.',
  },
  {
    title: 'Annual Tech Innovation Gala & Awards',
    category: 'Corporate Gala' as EventCategory,
    location: 'The Grand Metropolitan Ballroom',
    targetBudget: 35000,
    time: '18:30',
    endTime: '22:30',
    description: 'Black-tie gala honoring industry leaders with keynote speeches, 3-course banquet, and networking lounge.',
  },
  {
    title: 'Campus Culture & Music Festival',
    category: 'College Festival' as EventCategory,
    location: 'University Central Quad & Amphitheater',
    targetBudget: 15000,
    time: '12:00',
    endTime: '22:00',
    description: 'Student festival featuring indie music bands, food trucks, art installations, and club showcases.',
  },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<EventCategory>(initialData?.category || 'Anniversary');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '18:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '23:00');
  const [location, setLocation] = useState(initialData?.location || '');
  const [targetBudget, setTargetBudget] = useState(initialData?.targetBudget ? String(initialData.targetBudget) : '10000');
  const [description, setDescription] = useState(initialData?.description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }
    const budgetNum = parseFloat(targetBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setError('Please provide a valid budget amount');
      return;
    }

    onSave({
      title: title.trim(),
      category,
      date,
      time,
      endTime,
      location: location.trim(),
      targetBudget: budgetNum,
      description: description.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setLocation(tpl.location);
    setTargetBudget(String(tpl.targetBudget));
    setTime(tpl.time);
    setEndTime(tpl.endTime);
    setDescription(tpl.description);
    // Set date to 30 days from now as a sensible default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setDate(futureDate.toISOString().slice(0, 10));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              {initialData ? 'Edit Celebration' : 'Create New Celebration'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set up your event fundamentals, timeline dates, and initial budget.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preload Templates for New Events */}
        {!initialData && (
          <div className="px-6 pt-4 pb-2 bg-amber-50/40 border-b border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Quick-Start Templates (One-click fill):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 text-xs rounded-md bg-white border border-amber-200 text-stone-800 hover:border-amber-400 hover:bg-amber-100/50 transition-colors font-medium text-left"
                >
                  {tpl.category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sarah's 30th Birthday Soirée"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Target Budget ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="10000"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Venue / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., The Glass Pavilion, 450 Highland Ave"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Description & Theme
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the celebration vision, guest experience, or key milestones..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Host Notes & Special Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Accessibility notes, VIP arrivals, special delivery constraints..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-sm transition-all"
            >
              {initialData ? 'Update Celebration' : 'Create Celebration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
