import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { EventItem, GuestItem, ExpenseItem, TaskItem } from '../../types';
import {
  exportAllDataAsJSON,
  importAllDataFromJSON,
  exportGuestsToCSV,
  exportExpensesToCSV,
  downloadFile,
} from '../../lib/storage';

interface EventReportViewProps {
  event: EventItem | null;
  guests: GuestItem[];
  expenses: ExpenseItem[];
  tasks: TaskItem[];
  onResetDemo: () => void;
  onClearAll: () => void;
  onRefreshData: () => void;
}

export const EventReportView: React.FC<EventReportViewProps> = ({
  event,
  guests,
  expenses,
  tasks,
  onResetDemo,
  onClearAll,
  onRefreshData,
}) => {
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h3 className="font-serif-display text-lg font-bold text-stone-800">
          No Celebration Selected
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Select an active celebration to generate dossiers and analytics.
        </p>
      </div>
    );
  }

  // Real calculations
  const totalBudget = event.targetBudget || 0;
  const totalActual = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const totalPlanned = expenses.reduce((sum, e) => sum + (e.plannedAmount || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const budgetUtilization = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed');
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');
  const confirmedHeadcount = confirmedGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

  const completedTasks = tasks.filter((t) => t.completed).length;

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataAsJSON();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(`CELEBRATE_Backup_${dateStr}.json`, jsonStr, 'application/json');
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importAllDataFromJSON(importText);
    if (ok) {
      setImportStatus('Data successfully restored!');
      onRefreshData();
      setTimeout(() => {
        setImportStatus(null);
        setShowImportBox(false);
        setImportText('');
      }, 2000);
    } else {
      setImportStatus('Error: Invalid JSON format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200 no-print">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Executive Event Dossier & Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Consolidated operational briefing, catering requirements, and data backup for {event.title}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Dossier (PDF)</span>
          </button>

          <button
            onClick={() => exportGuestsToCSV(guests, event.title)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Guests CSV</span>
          </button>

          <button
            onClick={() => exportExpensesToCSV(expenses, event.title)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Budget CSV</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Dossier */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-widest mb-1">
              CELEBRATE · Official Operational Dossier
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
              <span>{event.category}</span>
              <span aria-hidden="true">·</span>
              <span>Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-600 space-y-0.5">
            <div><strong>Date:</strong> {event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'full' }) : 'TBD'}</div>
            <div><strong>Time:</strong> {event.time || 'TBD'} {event.endTime ? `– ${event.endTime}` : ''}</div>
            <div><strong>Venue:</strong> {event.location || 'To Be Announced'}</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            01. Executive Performance Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <div className="text-stone-400 text-[11px]">Total Budget Target</div>
              <div className="font-serif-display text-xl font-bold text-stone-900 mt-0.5">
                ${totalBudget.toLocaleString()}
              </div>
              <div className="text-stone-500 text-[10px]">${totalActual.toLocaleString()} committed ({budgetUtilization}%)</div>
            </div>

            <div>
              <div className="text-stone-400 text-[11px]">Net Available Balance</div>
              <div className={`font-serif-display text-xl font-bold mt-0.5 ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                ${remainingBudget.toLocaleString()}
              </div>
              <div className="text-stone-500 text-[10px]">{remainingBudget < 0 ? 'Over budget' : 'Under budget'}</div>
            </div>

            <div>
              <div className="text-stone-400 text-[11px]">Confirmed Attendees</div>
              <div className="font-serif-display text-xl font-bold text-stone-900 mt-0.5">
                {confirmedHeadcount} Guests
              </div>
              <div className="text-stone-500 text-[10px]">{confirmedGuests.length} primary + {confirmedHeadcount - confirmedGuests.length} +1s</div>
            </div>

            <div>
              <div className="text-stone-400 text-[11px]">Checklist Progress</div>
              <div className="font-serif-display text-xl font-bold text-stone-900 mt-0.5">
                {completedTasks}/{tasks.length} Done
              </div>
              <div className="text-stone-500 text-[10px]">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed Catering & Dietary Manifest */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              02. Catering & Seating Manifest ({confirmedGuests.length} Confirmed)
            </h3>
            <span className="text-xs text-stone-500 font-medium">Headcount: {confirmedHeadcount}</span>
          </div>

          {confirmedGuests.length === 0 ? (
            <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
              No confirmed guests recorded at this time.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-500">
                    <th className="py-2.5 px-3">Guest Name</th>
                    <th className="py-2.5 px-3">Group</th>
                    <th className="py-2.5 px-3">+1s</th>
                    <th className="py-2.5 px-3">Table Seating</th>
                    <th className="py-2.5 px-3">Dietary Requirements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {confirmedGuests.map((g) => (
                    <tr key={g.id}>
                      <td className="py-2 px-3 font-semibold text-stone-900">{g.name}</td>
                      <td className="py-2 px-3 text-stone-600">{g.group}</td>
                      <td className="py-2 px-3 text-stone-800 font-medium">+{g.plusOnes || 0}</td>
                      <td className="py-2 px-3 text-stone-600">{g.tableNumber || 'Unassigned'}</td>
                      <td className="py-2 px-3 text-amber-900 font-medium">
                        {g.dietaryRestrictions || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Financial Commitments Audit */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              03. Financial Ledger & Vendor Commitments
            </h3>
            <span className="text-xs text-stone-500 font-medium">Total: ${totalActual.toLocaleString()}</span>
          </div>

          {expenses.length === 0 ? (
            <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-500">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3 text-right">Planned</th>
                    <th className="py-2.5 px-3 text-right">Actual</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2 px-3 font-medium text-stone-900">{exp.title}</td>
                      <td className="py-2 px-3 text-stone-600">{exp.category}</td>
                      <td className="py-2 px-3 text-stone-600">{exp.vendorName || '—'}</td>
                      <td className="py-2 px-3 text-right text-stone-600">${exp.plannedAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900">${exp.actualAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-stone-600 capitalize">{exp.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Master Milestones Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              04. Timeline Milestones & Task Status
            </h3>
            <span className="text-xs text-stone-500 font-medium">{completedTasks} / {tasks.length} Completed</span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
              No tasks recorded yet.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-500">
                    <th className="py-2.5 px-3 w-8">Done</th>
                    <th className="py-2.5 px-3">Task Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tasks.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 px-3">
                        {t.completed ? (
                          <span className="text-emerald-700 font-bold">✓</span>
                        ) : (
                          <span className="text-stone-300">○</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 font-medium ${t.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {t.title}
                      </td>
                      <td className="py-2 px-3 text-stone-600">{t.category}</td>
                      <td className="py-2 px-3 capitalize text-stone-600">{t.priority}</td>
                      <td className="py-2 px-3 text-stone-600">{t.dueDate || '—'}</td>
                      <td className="py-2 px-3 text-stone-600">{t.assignee || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Host Notes & Special Instructions */}
        {event.notes && (
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              05. Host Notes & Directives
            </h3>
            <p className="text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200 leading-relaxed">
              {event.notes}
            </p>
          </div>
        )}
      </div>

      {/* Advanced Data Management Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 no-print">
        <h3 className="font-serif-display text-lg font-bold text-stone-900">
          Data Management & Archival
        </h3>
        <p className="text-xs text-stone-500">
          CELEBRATE stores all records securely in your browser's persistent storage without requiring sign-up or accounts. You can backup your entire portfolio to a file, restore from backup, or load the starter template anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Restore Backup (JSON)</span>
          </button>

          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Load Starter Celebration</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Import JSON Box */}
        {showImportBox && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 mt-3">
            <label className="block text-xs font-semibold text-stone-700">
              Paste CELEBRATE JSON Backup:
            </label>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"version": "2.0", "events": [...]}'
              className="w-full p-2.5 text-xs font-mono rounded-lg border border-stone-300 bg-white"
            />
            {importStatus && (
              <div className="text-xs font-semibold text-amber-800">
                {importStatus}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800"
              >
                Restore Now
              </button>
            </div>
          </div>
        )}

        {/* Clear Confirmation */}
        {showClearConfirm && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 mt-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Are you sure you want to erase all events and records?</span>
            </div>
            <p className="text-xs text-red-700">
              This will completely wipe local event data, guests, expenses, and timeline tasks.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Wipe Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
