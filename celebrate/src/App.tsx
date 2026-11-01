import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EventListView } from './components/events/EventListView';
import { CreateEventModal } from './components/events/CreateEventModal';
import { GuestManager } from './components/guests/GuestManager';
import { BudgetTracker } from './components/budget/BudgetTracker';
import { TaskManager } from './components/tasks/TaskManager';
import { VendorDirectory } from './components/vendors/VendorDirectory';
import { InvitationStudio } from './components/invitations/InvitationStudio';
import { EventReportView } from './components/reports/EventReportView';
import { EventAssistant } from './components/assistant/EventAssistant';

import {
  getEvents,
  saveEvents,
  getActiveEventId,
  setActiveEventId,
  getGuests,
  saveGuests,
  getExpenses,
  saveExpenses,
  getTasks,
  saveTasks,
  getCustomVendors,
  saveCustomVendors,
  getInvitation,
  saveInvitation,
  resetToDemo,
  clearAllData,
} from './lib/storage';

import {
  EventItem,
  GuestItem,
  ExpenseItem,
  TaskItem,
  VendorItem,
  InvitationConfig,
} from './types';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventIdState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [customVendors, setCustomVendorsState] = useState<VendorItem[]>([]);
  const [invitation, setInvitation] = useState<InvitationConfig | null>(null);

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load
  const loadAllData = () => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
    const activeId = getActiveEventId();
    setActiveEventIdState(activeId);

    const loadedGuests = getGuests();
    setGuests(loadedGuests);

    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);

    const loadedTasks = getTasks();
    setTasks(loadedTasks);

    const loadedCustomVendors = getCustomVendors();
    setCustomVendorsState(loadedCustomVendors);

    if (activeId) {
      setInvitation(getInvitation(activeId));
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync invitation when active event changes
  useEffect(() => {
    if (activeEventId) {
      setInvitation(getInvitation(activeEventId));
    } else {
      setInvitation(null);
    }
  }, [activeEventId]);

  const activeEvent = events.find((e) => e.id === activeEventId) || null;
  const activeGuests = activeEvent ? guests.filter((g) => g.eventId === activeEvent.id) : [];
  const activeExpenses = activeEvent ? expenses.filter((e) => e.eventId === activeEvent.id) : [];
  const activeTasks = activeEvent ? tasks.filter((t) => t.eventId === activeEvent.id) : [];

  // EVENT CRUD
  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    setActiveEventIdState(id);
  };

  const handleSaveEvent = (eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      const updatedEvents = events.map((e) =>
        e.id === editingEvent.id
          ? {
              ...e,
              ...eventData,
              updatedAt: new Date().toISOString(),
            }
          : e
      );
      saveEvents(updatedEvents);
      setEvents(updatedEvents);
      setEditingEvent(null);
      showToast('Celebration updated successfully');
    } else {
      const newEvent: EventItem = {
        id: `evt-${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedEvents = [newEvent, ...events];
      saveEvents(updatedEvents);
      setEvents(updatedEvents);
      handleSelectEvent(newEvent.id);
      setActiveTab('dashboard');
      showToast('New celebration created!');
    }
  };

  const handleEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    setIsCreateModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    saveEvents(updatedEvents);
    setEvents(updatedEvents);

    // Also remove associated guests, expenses, tasks
    const updatedGuests = guests.filter((g) => g.eventId !== eventId);
    saveGuests(updatedGuests);
    setGuests(updatedGuests);

    const updatedExpenses = expenses.filter((e) => e.eventId !== eventId);
    saveExpenses(updatedExpenses);
    setExpenses(updatedExpenses);

    const updatedTasks = tasks.filter((t) => t.eventId !== eventId);
    saveTasks(updatedTasks);
    setTasks(updatedTasks);

    const newActiveId = getActiveEventId();
    setActiveEventIdState(newActiveId);
    showToast('Celebration deleted');
  };

  const handleDuplicateEvent = (evt: EventItem) => {
    const duplicated: EventItem = {
      ...evt,
      id: `evt-${Date.now()}`,
      title: `${evt.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedEvents = [duplicated, ...events];
    saveEvents(updatedEvents);
    setEvents(updatedEvents);
    handleSelectEvent(duplicated.id);
    showToast('Celebration duplicated!');
  };

  // GUEST CRUD
  const handleAddGuest = (guestData: Omit<GuestItem, 'id' | 'updatedAt'>) => {
    const newGuest: GuestItem = {
      id: `gst-${Date.now()}`,
      ...guestData,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newGuest, ...guests];
    saveGuests(updated);
    setGuests(updated);
    showToast(`Added ${newGuest.name} to guest list`);
  };

  const handleUpdateGuest = (updatedGuest: GuestItem) => {
    const updated = guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g));
    saveGuests(updated);
    setGuests(updated);
  };

  const handleDeleteGuest = (guestId: string) => {
    const updated = guests.filter((g) => g.id !== guestId);
    saveGuests(updated);
    setGuests(updated);
    showToast('Guest removed');
  };

  // EXPENSE CRUD
  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    saveExpenses(updated);
    setExpenses(updated);
    showToast(`Logged expense: ${newExpense.title}`);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseItem) => {
    const updated = expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e));
    saveExpenses(updated);
    setExpenses(updated);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    saveExpenses(updated);
    setExpenses(updated);
    showToast('Expense removed from budget');
  };

  // TASK CRUD
  const handleAddTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setTasks(updated);
    showToast(`Added task: ${newTask.title}`);
  };

  const handleAddMultipleTasks = (newTasksData: Omit<TaskItem, 'id' | 'createdAt'>[]) => {
    const newTasks: TaskItem[] = newTasksData.map((td, index) => ({
      id: `tsk-${Date.now()}-${index}`,
      ...td,
      createdAt: new Date().toISOString(),
    }));
    const updated = [...tasks, ...newTasks];
    saveTasks(updated);
    setTasks(updated);
    showToast(`Added ${newTasks.length} standard checklist tasks!`);
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasks(updated);
    setTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    setTasks(updated);
    showToast('Task removed');
  };

  const handleToggleTaskComplete = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
    setTasks(updated);
  };

  const handleUpdateEventBudget = (newBudget: number) => {
    if (!activeEvent) return;
    const updatedEvents = events.map((e) =>
      e.id === activeEvent.id
        ? { ...e, targetBudget: newBudget, updatedAt: new Date().toISOString() }
        : e
    );
    saveEvents(updatedEvents);
    setEvents(updatedEvents);
    showToast(`Overall budget updated to $${newBudget.toLocaleString()}`);
  };

  // VENDOR CRUD
  const handleAddCustomVendor = (vendor: VendorItem) => {
    const updated = [vendor, ...customVendors];
    saveCustomVendors(updated);
    setCustomVendorsState(updated);
    showToast(`Added ${vendor.name} to custom directory`);
  };

  // INVITATION SAVE
  const handleSaveInvitation = (config: InvitationConfig) => {
    saveInvitation(config);
    setInvitation(config);
    showToast('Digital invitation settings saved');
  };

  // SYSTEM RESET / CLEAR
  const handleResetDemo = () => {
    resetToDemo();
    loadAllData();
    showToast('Reset to starter celebration template');
  };

  const handleClearAll = () => {
    clearAllData();
    loadAllData();
    showToast('All local celebration data cleared');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-stone-900 flex flex-col font-sans">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        Skip to main content
      </a>

      {/* Top Application Bar */}
      <Navbar
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCreateEvent={() => {
          setEditingEvent(null);
          setIsCreateModalOpen(true);
        }}
        guestCount={activeGuests.length}
        pendingTasksCount={activeTasks.filter((t) => !t.completed).length}
      />

      {/* Main Responsive View Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" tabIndex={-1}>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200" role="alert" aria-live="polite">
            <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Distinct Views based on activeTab */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            event={activeEvent}
            guests={activeGuests}
            expenses={activeExpenses}
            tasks={activeTasks}
            onNavigateTab={setActiveTab}
            onOpenCreateGuest={() => setActiveTab('guests')}
            onOpenCreateExpense={() => setActiveTab('budget')}
            onOpenCreateTask={() => setActiveTab('tasks')}
            onOpenEditEvent={() => {
              if (activeEvent) handleEditEvent(activeEvent);
            }}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        )}

        {activeTab === 'events' && (
          <EventListView
            events={events}
            activeEventId={activeEventId}
            guests={guests}
            expenses={expenses}
            tasks={tasks}
            onSelectEvent={(id) => {
              handleSelectEvent(id);
              setActiveTab('dashboard');
            }}
            onOpenCreate={() => {
              setEditingEvent(null);
              setIsCreateModalOpen(true);
            }}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onDuplicateEvent={handleDuplicateEvent}
            onResetDemo={handleResetDemo}
          />
        )}

        {activeTab === 'guests' && (
          <GuestManager
            event={activeEvent}
            guests={activeGuests}
            onAddGuest={handleAddGuest}
            onUpdateGuest={handleUpdateGuest}
            onDeleteGuest={handleDeleteGuest}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTracker
            event={activeEvent}
            expenses={activeExpenses}
            guests={activeGuests}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onUpdateEventBudget={handleUpdateEventBudget}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            event={activeEvent}
            tasks={activeTasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleTaskComplete}
            onAddMultipleTasks={handleAddMultipleTasks}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorDirectory
            event={activeEvent}
            customVendors={customVendors}
            onAddCustomVendor={handleAddCustomVendor}
            onLinkVendorToBudget={handleAddExpense}
          />
        )}

        {activeTab === 'invitations' && (
          <InvitationStudio
            event={activeEvent}
            invitation={
              invitation || {
                eventId: activeEvent?.id || '',
                theme: 'champagne',
                headline: 'You Are Warmly Invited',
                hostMessage: 'Please join us for this special celebration.',
                dressCode: 'Cocktail Attire',
                rsvpDeadline: '',
                scheduleHighlights: [],
              }
            }
            onSaveInvitation={handleSaveInvitation}
            onAddGuestFromRSVP={handleAddGuest}
          />
        )}

        {activeTab === 'reports' && (
          <EventReportView
            event={activeEvent}
            guests={activeGuests}
            expenses={activeExpenses}
            tasks={activeTasks}
            onResetDemo={handleResetDemo}
            onClearAll={handleClearAll}
            onRefreshData={loadAllData}
          />
        )}

        {activeTab === 'assistant' && (
          <EventAssistant
            event={activeEvent}
            guests={activeGuests}
            expenses={activeExpenses}
            tasks={activeTasks}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-stone-800">CELEBRATE</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Event Planner</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Real data persistence · Instant responsiveness · No registration required
          </div>
        </div>
      </footer>

      {/* Create / Edit Celebration Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />
    </div>
  );
}
