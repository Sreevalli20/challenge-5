import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { EventItem, TaskCategory, TaskItem, TaskPriority } from '../../types';

interface TaskManagerProps {
  event: EventItem | null;
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddMultipleTasks: (tasks: Omit<TaskItem, 'id' | 'createdAt'>[]) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Planning',
  'Vendor Booking',
  'Guests & Invitations',
  'Design & Decor',
  'Logistics & Setup',
  'Day-of Execution',
];

export const TaskManager: React.FC<TaskManagerProps> = ({
  event,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onAddMultipleTasks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Planning');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <CheckSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h3 className="font-serif-display text-lg font-bold text-stone-800">
          No Celebration Selected
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Select a celebration to view and manage timeline tasks.
        </p>
      </div>
    );
  }

  // Calculate relative due dates
  const getDueInfo = (dateStr: string) => {
    if (!dateStr) return { text: 'No due date', status: 'normal' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, status: 'overdue' };
    }
    if (diffDays === 0) {
      return { text: 'Due today', status: 'urgent' };
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', status: 'urgent' };
    }
    if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, status: 'soon' };
    }
    return { text: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), status: 'normal' };
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignee || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? !t.completed : t.completed);
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Analytics
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((t) => !t.completed && getDueInfo(t.dueDate).status === 'overdue').length;
  const highPriorityIncomplete = tasks.filter((t) => !t.completed && t.priority === 'high').length;

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('Planning');
    // Default due date to event date or 7 days from now
    setDueDate(event.date || '');
    setPriority('medium');
    setAssignee('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setDueDate(task.dueDate || '');
    setPriority(task.priority);
    setAssignee(task.assignee || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        category,
        dueDate,
        priority,
        assignee: assignee.trim(),
      });
    } else {
      onAddTask({
        eventId: event.id,
        title: title.trim(),
        description: description.trim(),
        category,
        dueDate,
        completed: false,
        priority,
        assignee: assignee.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Auto-populate checklist tailored to category
  const handleGenerateStandardChecklist = () => {
    const baseDate = event.date ? new Date(event.date + 'T00:00:00') : new Date();

    const formatDateOffset = (daysOffset: number) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - daysOffset);
      return d.toISOString().slice(0, 10);
    };

    const templateTasks: Omit<TaskItem, 'id' | 'createdAt'>[] = [
      {
        eventId: event.id,
        title: 'Lock Venue & Deposit Agreement',
        description: 'Verify sound limits, load-in hours, and liability insurance requirements.',
        category: 'Vendor Booking',
        dueDate: formatDateOffset(45),
        completed: false,
        priority: 'high',
        assignee: 'Host / Lead Planner',
      },
      {
        eventId: event.id,
        title: 'Send Digital & Formal Invitations',
        description: 'Dispatch invitations with RSVP deadline set for 2 weeks prior to event.',
        category: 'Guests & Invitations',
        dueDate: formatDateOffset(30),
        completed: false,
        priority: 'high',
        assignee: 'Host',
      },
      {
        eventId: event.id,
        title: 'Catering Menu Tasting & Dietary Confirmation',
        description: 'Finalize bar packages, pass hors d’oeuvres, and dietary meal options.',
        category: 'Vendor Booking',
        dueDate: formatDateOffset(20),
        completed: false,
        priority: 'medium',
        assignee: 'Catering Coordinator',
      },
      {
        eventId: event.id,
        title: 'Finalize Entertainment Playlist & Run of Show',
        description: 'Share song cues with DJ/band and draft minute-by-minute order of events.',
        category: 'Planning',
        dueDate: formatDateOffset(14),
        completed: false,
        priority: 'medium',
        assignee: 'MC / Entertainment Lead',
      },
      {
        eventId: event.id,
        title: 'Confirm Final Headcount with Caterer & Rentals',
        description: 'Submit definitive guest numbers and table counts to kitchen and rental house.',
        category: 'Logistics & Setup',
        dueDate: formatDateOffset(10),
        completed: false,
        priority: 'high',
        assignee: 'Lead Planner',
      },
      {
        eventId: event.id,
        title: 'Day-of Emergency Kit & Vendor Contact Sheet',
        description: 'Pack tech adapters, safety pins, printed guest manifests, and vendor phone numbers.',
        category: 'Day-of Execution',
        dueDate: formatDateOffset(2),
        completed: false,
        priority: 'medium',
        assignee: 'Event Day Coordinator',
      },
    ];

    onAddMultipleTasks(templateTasks);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Timeline & Task Checklist
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Organize planning milestones, deadlines, and responsibilities for {event.title}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateStandardChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900 text-xs font-semibold shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate Standard Checklist</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Completion Rate</div>
          <div className="font-serif-display text-2xl font-bold text-stone-900 mt-1">
            {progressPct}%
          </div>
          <div className="text-[11px] text-stone-500">
            {completedCount} of {tasks.length} tasks finished
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Remaining Tasks</div>
          <div className="font-serif-display text-2xl font-bold text-stone-900 mt-1">
            {tasks.length - completedCount}
          </div>
          <div className="text-[11px] text-stone-500">
            Active milestones
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Overdue Items</div>
          <div className={`font-serif-display text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-stone-500">
            Past due date
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">High Priority</div>
          <div className={`font-serif-display text-2xl font-bold mt-1 ${highPriorityIncomplete > 0 ? 'text-amber-700' : 'text-stone-900'}`}>
            {highPriorityIncomplete}
          </div>
          <div className="text-[11px] text-stone-500">
            Incomplete critical items
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by name, assignee, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs overflow-x-auto">
          {(['all', 'active', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <CheckSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="font-serif-display text-lg font-bold text-stone-800">
            {tasks.length === 0 ? 'No Tasks Created Yet' : 'No Matching Tasks Found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            {tasks.length === 0
              ? 'Create custom tasks or generate a full standard event checklist with one click.'
              : 'Try clearing your filters or searching another keyword.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
            >
              + Add Custom Task
            </button>
            {tasks.length === 0 && (
              <button
                onClick={handleGenerateStandardChecklist}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              >
                Auto-Generate Checklist
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((t) => {
            const dueInfo = getDueInfo(t.dueDate);
            return (
              <div
                key={t.id}
                className={`flex items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  t.completed
                    ? 'bg-stone-50/70 border-stone-200 opacity-75'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-4">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => onToggleComplete(t.id)}
                    className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold truncate ${
                        t.completed ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {t.title}
                    </div>

                    {t.description && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                        {t.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500 mt-1">
                      <span className="font-medium text-stone-700">{t.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          t.priority === 'high'
                            ? 'text-red-700 font-semibold'
                            : t.priority === 'medium'
                            ? 'text-amber-700'
                            : 'text-stone-500'
                        }
                      >
                        {t.priority === 'high' ? 'High Priority' : t.priority === 'medium' ? 'Medium' : 'Low'}
                      </span>
                      {t.assignee && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Assigned: {t.assignee}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {t.dueDate && (
                    <div className="text-right text-xs">
                      <div className="text-stone-700 font-medium">
                        {new Date(t.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {!t.completed && (
                        <div
                          className={`text-[10px] font-semibold ${
                            dueInfo.status === 'overdue'
                              ? 'text-red-600'
                              : dueInfo.status === 'urgent'
                              ? 'text-amber-700'
                              : 'text-stone-400'
                          }`}
                        >
                          {dueInfo.text}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 text-stone-400 hover:text-stone-800"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                {editingTask ? 'Edit Task' : 'Add Planning Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-2 text-xs rounded bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Book Acoustic Jazz Trio & Sign Contract"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description / Action Steps
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key instructions, specific song cues, contact details, file links..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Assignee / Responsible Party
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. Arthur V. or Event Coordinator"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
