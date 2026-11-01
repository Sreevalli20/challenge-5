import React, { useState } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  CheckSquare,
  Sparkles,
  MapPin,
  Mail,
  FileText,
  Plus,
  ChevronDown,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { EventItem } from '../../types';

interface NavbarProps {
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (eventId: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateEvent: () => void;
  guestCount: number;
  pendingTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  activeTab,
  onSelectTab,
  onOpenCreateEvent,
  guestCount,
  pendingTasksCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Layers },
    { id: 'events', label: 'All Events', icon: Calendar, badge: events.length },
    { id: 'guests', label: 'Guests & RSVPs', icon: Users, badge: guestCount },
    { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
    { id: 'tasks', label: 'Timeline & Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'vendors', label: 'Venues & Vendors', icon: MapPin },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200" role="banner">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Active Event Switcher */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 rounded-lg p-1 -m-1"
              aria-label="Navigate to Dashboard"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-serif-display text-lg font-bold shadow-sm transition-transform group-hover:scale-105" aria-hidden="true">
                C
              </div>
              <div>
                <span className="font-serif-display text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                  CELEBRATE
                </span>
                <span className="text-[10px] font-medium tracking-wider text-amber-700 uppercase block">
                  Intelligent Event Planner
                </span>
              </div>
            </button>

            {/* Active Event Dropdown */}
            {events.length > 0 && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  aria-label={`Current event: ${activeEvent ? activeEvent.title : 'Select an Event'}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-sm font-medium text-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                  <span className="max-w-[200px] truncate font-medium">
                    {activeEvent ? activeEvent.title : 'Select an Event'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone-500" aria-hidden="true" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                    role="listbox"
                    aria-label="Select active event"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100" id="event-switcher-label">
                      Active Event Switcher
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1" role="listbox" aria-labelledby="event-switcher-label">
                      {events.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            onSelectEvent(evt.id);
                            setDropdownOpen(false);
                          }}
                          role="option"
                          aria-selected={activeEvent?.id === evt.id}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-inset ${
                            activeEvent?.id === evt.id ? 'bg-amber-50/70 font-semibold text-stone-900' : 'text-stone-700'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="truncate">{evt.title}</div>
                            <div className="text-[11px] text-stone-400">
                              {evt.category} · {evt.date || 'Date TBD'}
                            </div>
                          </div>
                          {activeEvent?.id === evt.id && (
                            <span className="text-amber-600 text-[10px] font-semibold" aria-label="Currently selected">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-stone-100 pt-1 px-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenCreateEvent();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-inset"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Create New Celebration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateEvent}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Create Event</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 border-t border-stone-100 overflow-x-auto py-1" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-stone-900 text-white font-semibold shadow-sm'
                    : item.highlight
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (item.highlight ? 'text-amber-400' : 'text-stone-200') : (item.highlight ? 'text-amber-600' : 'text-stone-500')}`} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-stone-700 text-stone-100' : 'bg-stone-200 text-stone-700'
                    }`}
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2" role="navigation" aria-label="Mobile navigation">
          {events.length > 0 && (
            <div className="mb-3 pb-3 border-b border-stone-100">
              <label htmlFor="mobile-event-select" className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">
                Current Celebration
              </label>
              <select
                id="mobile-event-select"
                value={activeEvent?.id || ''}
                onChange={(e) => {
                  onSelectEvent(e.target.value);
                }}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-inset ${
                    isActive
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
