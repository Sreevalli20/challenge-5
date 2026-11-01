import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Edit2,
  Trash2,
  Utensils,
  CheckCircle2,
  Clock3,
  XCircle,
  Send,
  MapPin,
  Phone,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { GuestGroup, GuestItem, InvitationStatus, RSVPStatus, EventItem } from '../../types';
import { exportGuestsToCSV } from '../../lib/storage';

interface GuestManagerProps {
  event: EventItem | null;
  guests: GuestItem[];
  onAddGuest: (guest: Omit<GuestItem, 'id' | 'updatedAt'>) => void;
  onUpdateGuest: (guest: GuestItem) => void;
  onDeleteGuest: (guestId: string) => void;
}

const GROUPS: GuestGroup[] = ['Family', 'Friends', 'VIP', 'Colleagues', 'Vendors', 'General'];

export const GuestManager: React.FC<GuestManagerProps> = ({
  event,
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvitationStatus>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>('pending');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [plusOnes, setPlusOnes] = useState('0');
  const [dietary, setDietary] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [group, setGroup] = useState<GuestGroup>('Friends');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h3 className="font-serif-display text-lg font-bold text-stone-800">
          No Celebration Selected
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Please select an active celebration to manage invited guests, contact information, and RSVPs.
        </p>
      </div>
    );
  }

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      (g.address || '').toLowerCase().includes(searchQuery.toLowerCase());

    const effectiveInvStatus = g.invitationStatus || (g.invitationSent ? (g.rsvpStatus === 'accepted' ? 'accepted' : g.rsvpStatus === 'declined' ? 'declined' : 'sent') : 'pending');
    const matchesStatus = statusFilter === 'all' || effectiveInvStatus === statusFilter;
    const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  // Real-time calculations
  const acceptedGuests = guests.filter((g) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed');
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');

  // Headcount includes primary guest plus declared +1s
  const totalAttendingHeadcount = acceptedGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  const sentCount = guests.filter((g) => g.invitationSent || g.invitationStatus === 'sent' || g.invitationStatus === 'accepted' || g.invitationStatus === 'declined').length;

  // Dietary restrictions for caterers
  const dietaryItems = guests
    .filter((g) => (g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed') && g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase() !== 'none')
    .map((g) => ({ name: g.name, note: g.dietaryRestrictions }));

  const openAddModal = () => {
    setEditingGuest(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setInvitationStatus('pending');
    setRsvpStatus('pending');
    setPlusOnes('0');
    setDietary('');
    setTableNumber('');
    setGroup('Friends');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (guest: GuestItem) => {
    setEditingGuest(guest);
    setName(guest.name);
    setEmail(guest.email);
    setPhone(guest.phone);
    setAddress(guest.address || '');
    setInvitationStatus(guest.invitationStatus || (guest.invitationSent ? 'sent' : 'pending'));
    setRsvpStatus(guest.rsvpStatus);
    setPlusOnes(String(guest.plusOnes || 0));
    setDietary(guest.dietaryRestrictions || '');
    setTableNumber(guest.tableNumber || '');
    setGroup(guest.group);
    setNotes(guest.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Guest name is required');
      return;
    }
    const plusOnesNum = parseInt(plusOnes, 10) || 0;
    const isSent = invitationStatus === 'sent' || invitationStatus === 'accepted' || invitationStatus === 'declined';

    if (editingGuest) {
      onUpdateGuest({
        ...editingGuest,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        invitationStatus,
        rsvpStatus,
        plusOnes: plusOnesNum,
        dietaryRestrictions: dietary.trim(),
        tableNumber: tableNumber.trim(),
        group,
        invitationSent: isSent,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddGuest({
        eventId: event.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        invitationStatus,
        rsvpStatus,
        plusOnes: plusOnesNum,
        dietaryRestrictions: dietary.trim(),
        tableNumber: tableNumber.trim(),
        group,
        invitationSent: isSent,
        notes: notes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Quick 1-click status change for RSVP & Invitation
  const handleQuickStatusChange = (guest: GuestItem, newRsvp: RSVPStatus) => {
    let newInvStatus: InvitationStatus = guest.invitationStatus;
    if (newRsvp === 'accepted') newInvStatus = 'accepted';
    else if (newRsvp === 'declined') newInvStatus = 'declined';
    else newInvStatus = 'sent';

    onUpdateGuest({
      ...guest,
      rsvpStatus: newRsvp,
      invitationStatus: newInvStatus,
      invitationSent: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleInviteSent = (guest: GuestItem) => {
    const nextSent = !guest.invitationSent;
    onUpdateGuest({
      ...guest,
      invitationSent: nextSent,
      invitationStatus: nextSent
        ? (guest.rsvpStatus === 'accepted' ? 'accepted' : guest.rsvpStatus === 'declined' ? 'declined' : 'sent')
        : 'pending',
      updatedAt: new Date().toISOString(),
    });
  };

  // Batch action: Send all pending invitations
  const handleMarkAllSent = () => {
    guests.forEach((g) => {
      if (!g.invitationSent) {
        onUpdateGuest({
          ...g,
          invitationSent: true,
          invitationStatus: g.rsvpStatus === 'accepted' ? 'accepted' : g.rsvpStatus === 'declined' ? 'declined' : 'sent',
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Guest Management & RSVPs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Maintain contact information, track invitation delivery, and record RSVP attendance for {event.title}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {guests.some((g) => !g.invitationSent) && (
            <button
              onClick={handleMarkAllSent}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-amber-700" />
              <span>Mark All as Sent</span>
            </button>
          )}

          {guests.length > 0 && (
            <button
              onClick={() => exportGuestsToCSV(guests, event.title)}
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
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Total Attending</div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {totalAttendingHeadcount}
          </div>
          <div className="text-[11px] text-stone-500">
            {acceptedGuests.length} primary + {totalAttendingHeadcount - acceptedGuests.length} plus-ones
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Accepted (Yes)</div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
            {acceptedGuests.length}
          </div>
          <div className="text-[11px] text-stone-500">
            {guests.length > 0 ? Math.round((acceptedGuests.length / guests.length) * 100) : 0}% of invited list
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Pending RSVP</div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-amber-700 mt-1">
            {pendingGuests.length}
          </div>
          <div className="text-[11px] text-stone-500">
            Awaiting guest confirmation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Invitations Sent</div>
          <div className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {sentCount} / {guests.length}
          </div>
          <div className="text-[11px] text-stone-500">
            {declinedGuests.length} declined
          </div>
        </div>
      </div>

      {/* Catering Advisory Box */}
      {dietaryItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
          <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1.5">
            <Utensils className="w-4 h-4 text-amber-700" />
            <span>Catering Advisory: {dietaryItems.length} Confirmed Dietary Restrictions</span>
          </div>
          <div className="flex flex-wrap gap-2 text-stone-700">
            {dietaryItems.map((item, idx) => (
              <span
                key={idx}
                className="bg-white/80 border border-amber-200 px-2.5 py-1 rounded-md text-[11px]"
              >
                <strong className="text-stone-900">{item.name}</strong>: {item.note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guests by name, email, phone, or address..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {/* Invitation Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs overflow-x-auto">
          {(['all', 'sent', 'pending', 'accepted', 'declined'] as const).map((st) => (
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
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="all">All Groups</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Guest Directory Table */}
      {filteredGuests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="font-serif-display text-lg font-bold text-stone-800">
            {guests.length === 0 ? 'No Guests Invited Yet' : 'No Matching Guests Found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            {guests.length === 0
              ? 'Start building your guest manifest to track invitations, dietary preferences, and RSVPs.'
              : 'Try clearing your search query or selecting another status filter.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
          >
            + Add First Guest
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Guest & Contact Info</th>
                  <th className="py-3 px-4">Invitation Status</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">+1s</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Dietary Notes</th>
                  <th className="py-3 px-4 text-center">Invite Sent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((g) => {
                  const effectiveStatus = g.invitationStatus || (g.invitationSent ? (g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed' ? 'accepted' : g.rsvpStatus === 'declined' ? 'declined' : 'sent') : 'pending');
                  return (
                    <tr key={g.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 text-sm">{g.name}</div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-500 mt-0.5">
                          {g.email && <span>{g.email}</span>}
                          {g.email && g.phone && <span aria-hidden="true">·</span>}
                          {g.phone && <span>{g.phone}</span>}
                          {g.address && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-stone-400 truncate max-w-xs">{g.address}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Invitation Status Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold capitalize ${
                            effectiveStatus === 'accepted'
                              ? 'text-emerald-700'
                              : effectiveStatus === 'declined'
                              ? 'text-stone-500'
                              : effectiveStatus === 'sent'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {effectiveStatus === 'sent'
                            ? 'Delivered'
                            : effectiveStatus === 'accepted'
                            ? 'Accepted'
                            : effectiveStatus === 'declined'
                            ? 'Declined'
                            : 'Pending Send'}
                        </span>
                      </td>

                      {/* RSVP Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={g.rsvpStatus === 'confirmed' ? 'accepted' : g.rsvpStatus}
                          onChange={(e) => handleQuickStatusChange(g, e.target.value as RSVPStatus)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                            g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : g.rsvpStatus === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          <option value="accepted">Accepted (Yes)</option>
                          <option value="pending">Pending</option>
                          <option value="declined">Declined (No)</option>
                        </select>
                      </td>

                      {/* Plus Ones */}
                      <td className="py-3.5 px-4 font-medium text-stone-800">
                        +{g.plusOnes || 0}
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {g.group}
                      </td>

                      {/* Table */}
                      <td className="py-3.5 px-4 text-stone-600">
                        {g.tableNumber || '—'}
                      </td>

                      {/* Dietary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {g.dietaryRestrictions ? (
                          <span className="text-amber-900 font-medium">
                            {g.dietaryRestrictions}
                          </span>
                        ) : (
                          <span className="text-stone-400">None</span>
                        )}
                      </td>

                      {/* Invite Sent Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={g.invitationSent}
                          onChange={() => handleToggleInviteSent(g)}
                          title="Toggle invitation sent status"
                          className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1.5 text-stone-400 hover:text-stone-800 mr-1"
                          title="Edit Guest Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(g.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600"
                          title="Delete Guest"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Remove Guest?
            </h3>
            <p className="text-xs text-stone-600 mt-2">
              Are you sure you want to remove this guest from the invitation list? This will update your headcount and dietary summaries.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteGuest(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                {editingGuest ? 'Edit Guest Information' : 'Add Guest to Celebration'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jonathan Reynolds"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jonathan@example.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Physical / Mailing Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 124 Park Avenue, Apt 4B, New York, NY"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Invitation Status
                  </label>
                  <select
                    value={invitationStatus}
                    onChange={(e) => {
                      const val = e.target.value as InvitationStatus;
                      setInvitationStatus(val);
                      if (val === 'accepted') setRsvpStatus('accepted');
                      else if (val === 'declined') setRsvpStatus('declined');
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="pending">Pending (Not Sent)</option>
                    <option value="sent">Sent / Delivered</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    RSVP Response
                  </label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => {
                      const val = e.target.value as RSVPStatus;
                      setRsvpStatus(val);
                      if (val === 'accepted') setInvitationStatus('accepted');
                      else if (val === 'declined') setInvitationStatus('declined');
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted (Yes)</option>
                    <option value="declined">Declined (No)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Plus-Ones (+1s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Guest Group
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as GuestGroup)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Table / Seating
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. Table 2 or VIP"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Dietary Requirements
                  </label>
                  <input
                    type="text"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="e.g. Vegetarian, Gluten-Free"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Private Notes & Relationship
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special accommodations, family relation, song requests..."
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
                  {editingGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
