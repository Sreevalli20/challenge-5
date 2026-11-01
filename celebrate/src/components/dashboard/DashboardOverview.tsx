import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Mail,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarCheck,
  Send,
  Utensils,
} from 'lucide-react';
import { EventItem, GuestItem, ExpenseItem, TaskItem } from '../../types';

interface DashboardOverviewProps {
  event: EventItem | null;
  guests: GuestItem[];
  expenses: ExpenseItem[];
  tasks: TaskItem[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateGuest: () => void;
  onOpenCreateExpense: () => void;
  onOpenCreateTask: () => void;
  onOpenEditEvent: () => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  event,
  guests,
  expenses,
  tasks,
  onNavigateTab,
  onOpenCreateGuest,
  onOpenCreateExpense,
  onOpenCreateTask,
  onOpenEditEvent,
  onToggleTaskComplete,
}) => {
  if (!event) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm" role="alert">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="font-serif-display text-xl font-bold text-stone-900">
          No Active Celebration Selected
        </h2>
        <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
          Select an existing celebration from the top navigation or create a new celebration to start planning.
        </p>
        <button
          onClick={() => onNavigateTab('events')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
        >
          View All Celebrations
        </button>
      </div>
    );
  }

  // Real calculations
  const totalBudget = event.targetBudget || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetSpentPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const isOverBudget = remainingBudget < 0;

  const paidAmount = expenses
    .filter((e) => e.status === 'paid' || e.status === 'deposit_paid')
    .reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const pendingAmount = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + (e.actualAmount || 0), 0);

  // Guests & RSVPs
  const totalGuestsInvited = guests.length;
  const acceptedGuests = guests.filter(
    (g) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed'
  );
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');

  // Confirmed headcount including plus-ones
  const confirmedHeadcount = acceptedGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  const rsvpRate = totalGuestsInvited > 0 ? Math.round((acceptedGuests.length / totalGuestsInvited) * 100) : 0;
  const invitationsSentCount = guests.filter(
    (g) => g.invitationSent || g.invitationStatus === 'sent' || g.invitationStatus === 'accepted' || g.invitationStatus === 'declined'
  ).length;

  // Tasks & Progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Key Event Dates calculation
  const getDaysLeft = () => {
    if (!event.date) return null;
    const evtDate = new Date(event.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = evtDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysLeft();

  // Upcoming Tasks sorted chronologically
  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 5);

  const getTaskDueLabel = (dateStr: string) => {
    if (!dateStr) return { label: 'No deadline', color: 'text-stone-400' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600 font-bold' };
    if (diffDays === 0) return { label: 'Due today', color: 'text-amber-700 font-bold' };
    if (diffDays === 1) return { label: 'Due tomorrow', color: 'text-amber-700 font-semibold' };
    if (diffDays <= 7) return { label: `Due in ${diffDays} days`, color: 'text-stone-700 font-medium' };
    return { label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), color: 'text-stone-500' };
  };

  // Recent expenses
  const recentExpenses = [...expenses].reverse().slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. KEY EVENT DATES & EXECUTIVE HERO HEADER */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Decorative backdrop aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
              <span className="font-semibold text-amber-400 uppercase tracking-wider">
                {event.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {event.date
                  ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Date TBD'}
              </span>
              {event.time && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {event.time} {event.endTime ? `– ${event.endTime}` : ''}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {event.title}
            </h1>

            {event.location && (
              <div className="flex items-center gap-2 text-xs text-stone-300 pt-0.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Countdown & Key Date Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
            {daysLeft !== null && (
              <div className="text-left md:text-right">
                <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Event Countdown
                </div>
                <div className="font-serif-display text-3xl sm:text-4xl font-bold text-amber-400">
                  {daysLeft < 0
                    ? 'Completed'
                    : daysLeft === 0
                    ? 'Happening Today!'
                    : `${daysLeft} Days Remaining`}
                </div>
              </div>
            )}

            <button
              onClick={onOpenEditEvent}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white border border-stone-700 transition-colors"
            >
              Edit Event Dates & Setup
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="relative z-10 mt-6 pt-6 border-t border-stone-800 flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateExpense}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={onOpenCreateGuest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Guest</span>
          </button>
          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => onNavigateTab('invitations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            <span>Digital Invitations</span>
          </button>
          <button
            onClick={() => onNavigateTab('assistant')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Event Consultant</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME CORE METRICS: BUDGET, GUESTS & TASKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CURRENT BUDGET STATUS (Spent vs Remaining) */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-stone-400">Budget Status</span>
              <DollarSign className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Spent</div>
                <div className="font-serif-display text-2xl font-bold text-stone-900">
                  ${totalSpent.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Allocated</div>
                <div className="font-semibold text-stone-600 text-sm">
                  ${totalBudget.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Visual spent vs remaining progress bar */}
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget
                    ? 'bg-red-500'
                    : budgetSpentPct > 85
                    ? 'bg-amber-500'
                    : 'bg-stone-900'
                }`}
                style={{ width: `${budgetSpentPct}%` }}
              ></div>
            </div>

            {/* Remaining Budget display */}
            <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Remaining Budget:</span>
              <span
                className={`font-bold ${
                  isOverBudget ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {isOverBudget ? `-$${Math.abs(remainingBudget).toLocaleString()} (Over)` : `$${remainingBudget.toLocaleString()} Available`}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 mt-3">
            <span>{paidAmount > 0 ? `$${paidAmount.toLocaleString()} paid` : 'No payments settled'}</span>
            <span className="text-stone-900 font-semibold group-hover:underline">Open Ledger →</span>
          </div>
        </div>

        {/* TOTAL NUMBER OF GUESTS & RSVPS */}
        <div
          onClick={() => onNavigateTab('guests')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-stone-400">Total Guests & RSVPs</span>
              <Users className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Attending Headcount</div>
                <div className="font-serif-display text-2xl font-bold text-stone-900">
                  {confirmedHeadcount} Guests
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Invited</div>
                <div className="font-semibold text-stone-600 text-sm">
                  {totalGuestsInvited} Total
                </div>
              </div>
            </div>

            {/* RSVP distribution bar */}
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-3 overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${totalGuestsInvited > 0 ? (acceptedGuests.length / totalGuestsInvited) * 100 : 0}%` }}
                className="bg-emerald-600 h-full"
                title={`${acceptedGuests.length} Accepted`}
              />
              <div
                style={{ width: `${totalGuestsInvited > 0 ? (pendingGuests.length / totalGuestsInvited) * 100 : 0}%` }}
                className="bg-amber-500 h-full"
                title={`${pendingGuests.length} Pending`}
              />
              <div
                style={{ width: `${totalGuestsInvited > 0 ? (declinedGuests.length / totalGuestsInvited) * 100 : 0}%` }}
                className="bg-stone-300 h-full"
                title={`${declinedGuests.length} Declined`}
              />
            </div>

            {/* RSVP stats grid */}
            <div className="grid grid-cols-3 gap-1 mt-3 pt-2 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <div className="font-bold">{acceptedGuests.length}</div>
                <div className="text-[10px]">Accepted</div>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                <div className="font-bold">{pendingGuests.length}</div>
                <div className="text-[10px]">Pending</div>
              </div>
              <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                <div className="font-bold">{declinedGuests.length}</div>
                <div className="text-[10px]">Declined</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 mt-3">
            <span>{invitationsSentCount} invitations delivered</span>
            <span className="text-stone-900 font-semibold group-hover:underline">Manage Guests →</span>
          </div>
        </div>

        {/* TIMELINE TASKS & CHECKLIST */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-stone-400">Milestone Progress</span>
              <CheckSquare className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Tasks Completed</div>
                <div className="font-serif-display text-2xl font-bold text-stone-900">
                  {completedTasks} / {totalTasks}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Remaining</div>
                <div className="font-semibold text-stone-600 text-sm">
                  {totalTasks - completedTasks} Open
                </div>
              </div>
            </div>

            {/* Checklist progress bar */}
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${taskProgressPct}%` }}
              ></div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Execution Health:</span>
              <span className="font-bold text-stone-900">{taskProgressPct}% Complete</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 mt-3">
            <span>{tasks.filter((t) => !t.completed && t.priority === 'high').length} high priority items</span>
            <span className="text-stone-900 font-semibold group-hover:underline">All Tasks →</span>
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN INTERACTIVE SECTIONS: UPCOMING TASKS & RECENT EXPENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUMMARY OF UPCOMING TASKS */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-stone-900">
                  Summary of Upcoming Tasks
                </h3>
                <p className="text-xs text-stone-500">Upcoming planning deadlines in chronological order</p>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900"
              >
                View all ({totalTasks})
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-stone-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-800">No Pending Tasks</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  All milestones are completed. Add a new task anytime.
                </p>
                <button
                  onClick={onOpenCreateTask}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                >
                  + Add Next Milestone
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((t) => {
                  const dueInfo = getTaskDueLabel(t.dueDate);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-100 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-3">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => onToggleTaskComplete(t.id)}
                          className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-stone-900 truncate">
                            {t.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span>{t.category}</span>
                            {t.assignee && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{t.assignee}</span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                t.priority === 'high'
                                  ? 'text-red-700 font-semibold'
                                  : t.priority === 'medium'
                                  ? 'text-amber-700 font-medium'
                                  : 'text-stone-500'
                              }
                            >
                              {t.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`text-right text-xs shrink-0 ${dueInfo.color}`}>
                        {dueInfo.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={onOpenCreateTask}
              className="text-xs font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Manage Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CURRENT EXPENSES & BUDGET COMMITMENTS */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-stone-900">
                  Recent Budget Expenses
                </h3>
                <p className="text-xs text-stone-500">Recent commitments recorded in your event ledger</p>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900"
              >
                View all ({expenses.length})
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center text-stone-500">
                <DollarSign className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-800">No Expenses Recorded</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Track vendor invoices, venue deposits, and rentals to monitor remaining funds.
                </p>
                <button
                  onClick={onOpenCreateExpense}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                >
                  + Log First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="min-w-0 mr-3">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {exp.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span>{exp.category}</span>
                        {exp.vendorName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{exp.vendorName}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            exp.status === 'paid'
                              ? 'text-emerald-700 font-semibold'
                              : exp.status === 'deposit_paid'
                              ? 'text-blue-700 font-semibold'
                              : 'text-amber-700 font-semibold'
                          }
                        >
                          {exp.status === 'paid' ? 'Paid' : exp.status === 'deposit_paid' ? 'Deposit' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-stone-900">
                        ${exp.actualAmount.toLocaleString()}
                      </div>
                      {exp.paymentDate && (
                        <div className="text-[10px] text-stone-400">
                          {exp.paymentDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={onOpenCreateExpense}
              className="text-xs font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Full Budget Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
