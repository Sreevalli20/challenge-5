import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Edit3,
  Check,
  X,
  PieChart,
} from 'lucide-react';
import { EventItem, ExpenseCategory, ExpenseItem, ExpenseStatus, GuestItem } from '../../types';
import { exportExpensesToCSV } from '../../lib/storage';

interface BudgetTrackerProps {
  event: EventItem | null;
  expenses: ExpenseItem[];
  guests: GuestItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
  onUpdateEventBudget?: (newBudget: number) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Venue & Rental',
  'Catering & Bar',
  'Photography & Video',
  'Decor & Florals',
  'Music & Entertainment',
  'Invitations & Favors',
  'Attire & Styling',
  'Staff & Security',
  'Transportation',
  'Miscellaneous',
];

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  event,
  expenses,
  guests,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateEventBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Define overall budget state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [customBudgetValue, setCustomBudgetValue] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Catering & Bar');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [status, setStatus] = useState<ExpenseStatus>('pending');
  const [vendorName, setVendorName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <DollarSign className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h3 className="font-serif-display text-lg font-bold text-stone-800">
          No Celebration Selected
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Select an active celebration from the navigation to manage its financial ledger and budget.
        </p>
      </div>
    );
  }

  // Real-time calculations
  const totalBudget = event.targetBudget || 0;
  const totalActual = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const totalPlanned = expenses.reduce((sum, e) => sum + (e.plannedAmount || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const budgetSpentPct = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0;
  const isOverBudget = remainingBudget < 0;

  const paidAmount = expenses
    .filter((e) => e.status === 'paid' || e.status === 'deposit_paid')
    .reduce((sum, e) => sum + (e.actualAmount || 0), 0);

  const pendingAmount = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + (e.actualAmount || 0), 0);

  // Attending headcount
  const attendingGuests = guests.filter(
    (g) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed'
  );
  const totalAttendingHeadcount = attendingGuests.reduce(
    (sum, g) => sum + 1 + (g.plusOnes || 0),
    0
  );
  const costPerGuest = totalAttendingHeadcount > 0 ? Math.round(totalActual / totalAttendingHeadcount) : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.actualAmount || e.plannedAmount || 0);
  });

  // Filtered expense list
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Budget definition handlers
  const handleStartEditBudget = () => {
    setCustomBudgetValue(String(event.targetBudget || ''));
    setIsEditingBudget(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customBudgetValue);
    if (!isNaN(parsed) && parsed >= 0 && onUpdateEventBudget) {
      onUpdateEventBudget(parsed);
      setIsEditingBudget(false);
    }
  };

  // Expense modal handlers
  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('Catering & Bar');
    setPlannedAmount('');
    setActualAmount('');
    setStatus('pending');
    setVendorName('');
    // Default date to today
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingExpense(item);
    setTitle(item.title);
    setCategory(item.category);
    setPlannedAmount(String(item.plannedAmount || ''));
    setActualAmount(String(item.actualAmount || ''));
    setStatus(item.status);
    setVendorName(item.vendorName || '');
    setPaymentDate(item.paymentDate || '');
    setNotes(item.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Expense description is required');
      return;
    }
    const plannedNum = parseFloat(plannedAmount) || 0;
    const actualNum = parseFloat(actualAmount) || plannedNum;

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        title: title.trim(),
        category,
        plannedAmount: plannedNum,
        actualAmount: actualNum,
        status,
        vendorName: vendorName.trim(),
        paymentDate,
        notes: notes.trim(),
      });
    } else {
      onAddExpense({
        eventId: event.id,
        title: title.trim(),
        category,
        plannedAmount: plannedNum,
        actualAmount: actualNum,
        status,
        vendorName: vendorName.trim(),
        paymentDate,
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleStatusChange = (item: ExpenseItem, newStatus: ExpenseStatus) => {
    onUpdateExpense({
      ...item,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Comprehensive Budget Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Define your overall event budget, log line-item expenses, and track remaining funds in real-time for {event.title}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={() => exportExpensesToCSV(expenses, event.title)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Over-Budget Alert Banner */}
      {isOverBudget && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 flex items-start gap-3 text-xs text-red-800 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm">Budget Exceeded Warning</div>
            <div className="mt-0.5 text-red-700">
              Total committed expenses (${totalActual.toLocaleString()}) exceed your allocated event budget (${totalBudget.toLocaleString()}) by <span className="font-bold">${Math.abs(remainingBudget).toLocaleString()}</span>. Consider increasing your overall budget or adjusting vendor commitments.
            </div>
          </div>
          <button
            onClick={handleStartEditBudget}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shrink-0"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Real-Time Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Overall Budget (with inline edit) */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Overall Event Budget</span>
            <button
              onClick={handleStartEditBudget}
              title="Edit overall budget"
              className="p-1 rounded text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="mt-1 flex items-center gap-1.5">
              <div className="relative flex-1">
                <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  autoFocus
                  required
                  value={customBudgetValue}
                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-sm font-bold border border-stone-300 rounded focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <button
                type="submit"
                className="p-1.5 bg-stone-900 text-white rounded hover:bg-stone-800"
                title="Save Budget"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="p-1.5 text-stone-500 hover:bg-stone-100 rounded"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <>
              <div className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                ${totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
                <span>Allocated limit</span>
                <button
                  onClick={handleStartEditBudget}
                  className="text-amber-800 font-semibold hover:underline text-[11px]"
                >
                  Edit Budget
                </button>
              </div>
            </>
          )}
        </div>

        {/* Total Expenses / Committed */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Expenses</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
            ${totalActual.toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            ${paidAmount.toLocaleString()} paid · ${pendingAmount.toLocaleString()} pending
          </div>
        </div>

        {/* Remaining Budget (Prominently Displayed) */}
        <div
          className={`p-5 rounded-2xl border shadow-xs transition-all ${
            isOverBudget
              ? 'bg-red-50/70 border-red-200'
              : remainingBudget < totalBudget * 0.15
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span
              className={`font-semibold uppercase tracking-wider ${
                isOverBudget
                  ? 'text-red-700'
                  : remainingBudget < totalBudget * 0.15
                  ? 'text-amber-700'
                  : 'text-emerald-800'
              }`}
            >
              Remaining Budget
            </span>
            {isOverBudget ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div
            className={`font-serif-display text-2xl sm:text-3xl font-bold ${
              isOverBudget ? 'text-red-700' : 'text-emerald-800'
            }`}
          >
            {isOverBudget ? `-$${Math.abs(remainingBudget).toLocaleString()}` : `$${remainingBudget.toLocaleString()}`}
          </div>
          <div
            className={`text-xs mt-1 font-medium ${
              isOverBudget ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget
              ? 'Over allocated budget'
              : `${Math.round((remainingBudget / (totalBudget || 1)) * 100)}% available buffer`}
          </div>
        </div>

        {/* Cost per Guest */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Cost per Attendee</span>
            <CreditCard className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
            ${costPerGuest}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Based on {totalAttendingHeadcount} confirmed attendees
          </div>
        </div>
      </div>

      {/* Visual Budget Consumption Progress Bar */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
          <span className="font-semibold text-stone-800">
            Budget Utilization: {budgetSpentPct}% of ${totalBudget.toLocaleString()}
          </span>
          <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-stone-500 font-medium'}>
            {isOverBudget
              ? `Exceeded by $${Math.abs(remainingBudget).toLocaleString()}`
              : `$${remainingBudget.toLocaleString()} Remaining`}
          </span>
        </div>

        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, (totalActual / (totalBudget || 1)) * 100)}%` }}
            className={`h-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-red-500'
                : budgetSpentPct > 85
                ? 'bg-amber-500'
                : 'bg-stone-900'
            }`}
          />
        </div>

        {/* Category Breakdown Chips */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="text-[11px] uppercase font-semibold text-stone-400">
              Expenditure by Category:
            </span>
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>{cat}:</span>
                <span className="font-semibold text-stone-900">${amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by line item, vendor, or invoice note..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs overflow-x-auto">
          {(['all', 'paid', 'deposit_paid', 'pending'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'deposit_paid' ? 'Deposit' : st === 'paid' ? 'Paid' : st === 'pending' ? 'Pending' : 'All'}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Ledger Table */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <DollarSign className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="font-serif-display text-lg font-bold text-stone-800">
            {expenses.length === 0 ? 'No Expenses Recorded Yet' : 'No Matching Expenses Found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            {expenses.length === 0
              ? 'Add vendor contracts, venue deposits, catering quotes, and logistics to build your real-time budget.'
              : 'Try clearing your filters or searching another keyword.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
          >
            + Add First Expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Line Item & Notes</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-right">Planned ($)</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.map((exp) => {
                  const varDiff = (exp.plannedAmount || 0) - (exp.actualAmount || 0);
                  return (
                    <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 text-sm">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{exp.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-stone-700 font-medium">
                        {exp.category}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        {exp.vendorName || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-stone-500">
                        ${exp.plannedAmount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-stone-900 text-sm">
                        ${exp.actualAmount.toLocaleString()}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-semibold ${varDiff < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {varDiff > 0 ? `+$${varDiff.toLocaleString()}` : varDiff < 0 ? `-$${Math.abs(varDiff).toLocaleString()}` : '$0'}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                        {exp.paymentDate || '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={exp.status}
                          onChange={(e) => handleStatusChange(exp, e.target.value as ExpenseStatus)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                            exp.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : exp.status === 'deposit_paid'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="paid">Paid in Full</option>
                          <option value="deposit_paid">Deposit Paid</option>
                          <option value="pending">Pending Payment</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-stone-400 hover:text-stone-800 mr-1"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                {editingExpense ? 'Edit Expense Item' : 'Add Individual Expense'}
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
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Farm-to-Table Dinner Service & Bar"
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
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
                    Vendor / Provider Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Artisan Culinary Collective"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Actual / Quoted Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    placeholder="3800"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Planned / Estimated ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={plannedAmount}
                    onChange={(e) => setPlannedAmount(e.target.value)}
                    placeholder="3500"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid">Paid in Full</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Payment / Invoice Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Contract Terms, Receipt & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, cancellation policy, deposit due date, receipt number..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
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
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
