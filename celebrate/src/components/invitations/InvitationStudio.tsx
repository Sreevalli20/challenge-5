import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Check,
  Printer,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  X,
} from 'lucide-react';
import { EventItem, GuestItem, InvitationConfig, InvitationTheme } from '../../types';

interface InvitationStudioProps {
  event: EventItem | null;
  invitation: InvitationConfig;
  onSaveInvitation: (config: InvitationConfig) => void;
  onAddGuestFromRSVP: (guest: Omit<GuestItem, 'id' | 'updatedAt'>) => void;
}

export const InvitationStudio: React.FC<InvitationStudioProps> = ({
  event,
  invitation,
  onSaveInvitation,
  onAddGuestFromRSVP,
}) => {
  const [theme, setTheme] = useState<InvitationTheme>(invitation.theme || 'champagne');
  const [headline, setHeadline] = useState(invitation.headline || 'You Are Warmly Invited');
  const [hostMessage, setHostMessage] = useState(
    invitation.hostMessage ||
      'We would be delighted to have you join us for an evening of shared memories, delightful food, and celebration.'
  );
  const [dressCode, setDressCode] = useState(invitation.dressCode || 'Cocktail Attire');
  const [rsvpDeadline, setRsvpDeadline] = useState(invitation.rsvpDeadline || '');
  const [scheduleText, setScheduleText] = useState(
    (invitation.scheduleHighlights || []).join('\n')
  );
  const [customLocationNotes, setCustomLocationNotes] = useState(
    invitation.customLocationNotes || ''
  );
  const [copied, setCopied] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Simulator Form States
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simStatus, setSimStatus] = useState<'confirmed' | 'declined'>('confirmed');
  const [simPlusOnes, setSimPlusOnes] = useState('0');
  const [simDietary, setSimDietary] = useState('');
  const [simSubmitted, setSimSubmitted] = useState(false);

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <Mail className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h3 className="font-serif-display text-lg font-bold text-stone-800">
          No Celebration Selected
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Select a celebration to customize digital invitations and RSVP workflows.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    const highlights = scheduleText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveInvitation({
      eventId: event.id,
      theme,
      headline,
      hostMessage,
      dressCode,
      rsvpDeadline,
      scheduleHighlights: highlights,
      customLocationNotes,
    });
  };

  const copyInvitationText = () => {
    const formatted = `🎉 You're Invited to ${event.title}!

${headline}
${hostMessage}

📅 Date: ${event.date || 'TBD'}
⏰ Time: ${event.time || ''} ${event.endTime ? `– ${event.endTime}` : ''}
📍 Location: ${event.location || 'To Be Announced'}
${customLocationNotes ? `ℹ️ Details: ${customLocationNotes}\n` : ''}
👔 Dress Code: ${dressCode}
📬 Kindly RSVP by: ${rsvpDeadline || 'one week prior'}

Please reply with your RSVP and any dietary restrictions!`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;

    onAddGuestFromRSVP({
      eventId: event.id,
      name: simName.trim(),
      email: simEmail.trim() || 'guest@example.com',
      phone: simPhone.trim(),
      rsvpStatus: simStatus === 'confirmed' ? 'accepted' : 'declined',
      invitationStatus: simStatus === 'confirmed' ? 'accepted' : 'declined',
      plusOnes: simStatus === 'confirmed' ? parseInt(simPlusOnes, 10) || 0 : 0,
      dietaryRestrictions: simStatus === 'confirmed' ? simDietary.trim() : 'None',
      group: 'General',
      invitationSent: true,
      notes: 'Submitted via Live RSVP Simulation Portal',
    });

    setSimSubmitted(true);
    setTimeout(() => {
      setSimSubmitted(false);
      setIsSimulatorOpen(false);
      setSimName('');
      setSimEmail('');
      setSimPhone('');
      setSimPlusOnes('0');
      setSimDietary('');
    }, 2000);
  };

  // Theme visual styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'midnight':
        return {
          card: 'bg-stone-950 text-stone-100 border-amber-500/40 shadow-2xl',
          accent: 'text-amber-400',
          divider: 'border-amber-500/30',
          inner: 'bg-stone-900/60 border-stone-800',
          textMuted: 'text-stone-400',
        };
      case 'botanical':
        return {
          card: 'bg-emerald-950 text-emerald-50 border-emerald-700/50 shadow-2xl',
          accent: 'text-emerald-300',
          divider: 'border-emerald-700/40',
          inner: 'bg-emerald-900/40 border-emerald-800',
          textMuted: 'text-emerald-200/70',
        };
      case 'velvet':
        return {
          card: 'bg-rose-950 text-rose-50 border-rose-700/40 shadow-2xl',
          accent: 'text-amber-300',
          divider: 'border-rose-700/40',
          inner: 'bg-rose-900/40 border-rose-800',
          textMuted: 'text-rose-200/70',
        };
      case 'minimal':
        return {
          card: 'bg-white text-stone-900 border-stone-300 shadow-xl',
          accent: 'text-stone-950',
          divider: 'border-stone-200',
          inner: 'bg-stone-50 border-stone-200',
          textMuted: 'text-stone-500',
        };
      case 'champagne':
      default:
        return {
          card: 'bg-[#faf7f2] text-stone-900 border-amber-300 shadow-2xl',
          accent: 'text-amber-800',
          divider: 'border-amber-200',
          inner: 'bg-white/90 border-amber-100',
          textMuted: 'text-stone-600',
        };
    }
  };

  const themeStyle = getThemeClasses();
  const scheduleList = scheduleText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Digital Invitation Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Design an elegant digital invitation and test real-time RSVP submission for {event.title}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>Test Guest RSVP Portal</span>
          </button>

          <button
            onClick={copyInvitationText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Invite Text</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Card</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Designer Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif-display text-base font-bold text-stone-900">
              Invitation Details
            </h3>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
            >
              Save Configuration
            </button>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Aesthetic Theme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'champagne', label: 'Champagne', color: 'bg-amber-100 border-amber-300' },
                { id: 'midnight', label: 'Midnight', color: 'bg-stone-900 text-white border-stone-700' },
                { id: 'botanical', label: 'Botanical', color: 'bg-emerald-900 text-white border-emerald-700' },
                { id: 'velvet', label: 'Velvet', color: 'bg-rose-950 text-white border-rose-800' },
                { id: 'minimal', label: 'Minimal', color: 'bg-white border-stone-400' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as InvitationTheme)}
                  className={`p-2 rounded-xl text-center border text-[11px] font-medium transition-all ${th.color} ${
                    theme === th.id ? 'ring-2 ring-stone-900 font-bold scale-102 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Together Through Fifty Golden Years"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Host Message / Note
            </label>
            <textarea
              rows={3}
              value={hostMessage}
              onChange={(e) => setHostMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Dress Code
              </label>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="e.g. Black Tie, Cocktail, Casual"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                RSVP Deadline
              </label>
              <input
                type="date"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Schedule Highlights (1 per line)
            </label>
            <textarea
              rows={3}
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              placeholder="6:00 PM — Welcome Cocktails&#10;7:15 PM — Dinner & Remarks&#10;8:45 PM — Dance Floor Opens"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Location & Parking Notes
            </label>
            <input
              type="text"
              value={customLocationNotes}
              onChange={(e) => setCustomLocationNotes(e.target.value)}
              placeholder="e.g. Complimentary valet parking at gate 2"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Card Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Live Card Preview ({theme})
          </div>

          <div
            className={`w-full max-w-md rounded-2xl border p-8 sm:p-10 transition-all ${themeStyle.card}`}
          >
            {/* Card Content Header */}
            <div className="text-center space-y-2 pb-6 border-b border-dashed ${themeStyle.divider}">
              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-serif-display text-xl font-bold border ${themeStyle.divider} ${themeStyle.accent}">
                C
              </div>
              <div className={`text-[11px] uppercase tracking-widest font-semibold ${themeStyle.accent}`}>
                {event.category}
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                {event.title}
              </h2>
              <div className={`font-serif-display italic text-base pt-1 ${themeStyle.accent}`}>
                {headline}
              </div>
            </div>

            {/* Host Note */}
            <div className="py-6 text-center">
              <p className={`text-xs sm:text-sm leading-relaxed ${themeStyle.textMuted}`}>
                "{hostMessage}"
              </p>
            </div>

            {/* Essential Event Details Grid */}
            <div className={`p-4 rounded-xl border text-center space-y-3 ${themeStyle.inner}`}>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                <Calendar className="w-4 h-4 shrink-0 opacity-70" />
                <span>
                  {event.date
                    ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Date To Be Announced'}
                </span>
              </div>

              {event.time && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span>
                    {event.time} {event.endTime ? `until ${event.endTime}` : ''}
                  </span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span>{event.location}</span>
                </div>
              )}

              {customLocationNotes && (
                <div className={`text-[11px] pt-1 ${themeStyle.textMuted}`}>
                  {customLocationNotes}
                </div>
              )}
            </div>

            {/* Schedule Highlights */}
            {scheduleList.length > 0 && (
              <div className="mt-6 pt-6 border-t border-dashed ${themeStyle.divider}">
                <div className={`text-[10px] uppercase tracking-wider font-semibold text-center mb-3 ${themeStyle.accent}`}>
                  Order of Events
                </div>
                <div className="space-y-1.5 text-xs">
                  {scheduleList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className={themeStyle.textMuted}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RSVP Footer */}
            <div className="mt-8 pt-6 border-t border-dashed ${themeStyle.divider} text-center space-y-2">
              <div className="text-xs">
                <span className="font-semibold">Dress Code:</span>{' '}
                <span className={themeStyle.textMuted}>{dressCode}</span>
              </div>
              {rsvpDeadline && (
                <div className="text-[11px]">
                  <span className="font-semibold">RSVP Requested by:</span>{' '}
                  <span className={themeStyle.accent}>
                    {new Date(rsvpDeadline + 'T00:00:00').toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="mt-3 w-full py-2.5 rounded-xl font-semibold text-xs bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-md"
              >
                RSVP Online Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Guest RSVP Simulator Modal */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-stone-900">
                  Guest RSVP Portal
                </h3>
                <p className="text-xs text-stone-500">
                  Submitting this creates an active guest entry in your event database.
                </p>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {simSubmitted ? (
              <div className="py-8 text-center text-stone-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-serif-display text-lg font-bold">
                  RSVP Successfully Recorded!
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  The guest list and event attendance calculations have been updated in real-time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatorSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Dr. Eleanor Vance"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={simEmail}
                      onChange={(e) => setSimEmail(e.target.value)}
                      placeholder="eleanor@example.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Will you attend? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSimStatus('confirmed')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        simStatus === 'confirmed'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      ✓ Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimStatus('declined')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        simStatus === 'declined'
                          ? 'bg-stone-100 border-stone-600 text-stone-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      ✕ Regretfully Decline
                    </button>
                  </div>
                </div>

                {simStatus === 'confirmed' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                          Additional Guests (+1s)
                        </label>
                        <select
                          value={simPlusOnes}
                          onChange={(e) => setSimPlusOnes(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                        >
                          <option value="0">+0 (Just Me)</option>
                          <option value="1">+1 Guest</option>
                          <option value="2">+2 Guests</option>
                          <option value="3">+3 Guests</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                          Dietary Preferences
                        </label>
                        <input
                          type="text"
                          value={simDietary}
                          onChange={(e) => setSimDietary(e.target.value)}
                          placeholder="e.g. Vegetarian, Nut Allergy"
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSimulatorOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
                  >
                    Submit RSVP Response
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
