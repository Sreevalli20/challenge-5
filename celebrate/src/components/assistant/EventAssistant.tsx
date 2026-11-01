import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Clock,
  DollarSign,
  Utensils,
  HelpCircle,
  ShieldAlert,
  Mail,
  Calendar,
} from 'lucide-react';
import { EventItem, GuestItem, ExpenseItem, TaskItem } from '../../types';

interface EventAssistantProps {
  event: EventItem | null;
  guests: GuestItem[];
  expenses: ExpenseItem[];
  tasks: TaskItem[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: string;
}

export const EventAssistant: React.FC<EventAssistantProps> = ({
  event,
  guests,
  expenses,
  tasks,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check health and initialize conversation
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAiEnabled(Boolean(data.aiEnabled));
      })
      .catch(() => {
        setAiEnabled(false);
      });
  }, []);

  // Set welcome message when event changes or first mount
  useEffect(() => {
    if (event) {
      const confirmedCount = guests
        .filter((g) => g.rsvpStatus === 'confirmed')
        .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
      const spent = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
      const remaining = event.targetBudget - spent;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          content: `Welcome to the CELEBRATE Intelligent Assistant.

I am analyzing **${event.title}** (${event.category}):
- **Target Budget**: $${event.targetBudget.toLocaleString()} ($${spent.toLocaleString()} committed, $${remaining.toLocaleString()} remaining)
- **Confirmed Attendance**: ${confirmedCount} guests (${guests.length} total invitations)
- **Date & Location**: ${event.date || 'Date TBD'} · ${event.location || 'Location TBD'}
- **Open Milestones**: ${tasks.filter((t) => !t.completed).length} pending tasks

How can I assist your planning today? Select an action below or ask me any logistical, budget, catering, or timeline question.`,
          source: 'celebrate-assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-generic',
          sender: 'assistant',
          content: `Hello! I am your CELEBRATE event planning consultant. Please select an active celebration to enable contextual budget optimization, run of show schedules, and catering portion calculations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [event?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (promptText: string, actionType?: string) => {
    const textToSend = promptText.trim();
    if (!textToSend && !actionType) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const confirmedCount = guests
        .filter((g) => g.rsvpStatus === 'confirmed')
        .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
      const spent = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);

      const payload = {
        prompt: textToSend,
        type: actionType,
        eventContext: event
          ? {
              title: event.title,
              category: event.category,
              date: event.date,
              location: event.location,
              guestCount: confirmedCount || guests.length || 50,
              totalBudget: event.targetBudget,
              spentBudget: spent,
              confirmedGuests: confirmedCount,
              pendingGuests: guests.filter((g) => g.rsvpStatus === 'pending').length,
              incompleteTasks: tasks.filter((t) => !t.completed).length,
            }
          : null,
      };

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          content: data.response,
          source: data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMsg: Message = {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          content: `Unable to complete request: ${data.error || 'Server error occurred.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        content: `Connection error: Please ensure the development server is active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const QUICK_ACTIONS = [
    {
      type: 'budget_breakdown',
      label: 'Optimize Budget Breakdown',
      icon: DollarSign,
      prompt: 'Provide a realistic percentage and dollar allocation for this celebration budget.',
    },
    {
      type: 'run_of_show',
      label: 'Minute-by-Minute Run of Show',
      icon: Clock,
      prompt: 'Generate a comprehensive timeline and hourly schedule from vendor load-in to departure.',
    },
    {
      type: 'invitation_copy',
      label: 'Draft 3 Invitation Wordings',
      icon: Mail,
      prompt: 'Draft 3 distinct invitation copy styles (Elegant, Warm, and Contemporary) for this event.',
    },
    {
      type: 'catering_portions',
      label: 'Catering & Bar Quantities',
      icon: Utensils,
      prompt: 'Calculate recommended drink counts, wine/beer bottles, and appetizers needed for our guest count.',
    },
    {
      type: 'vendor_questions',
      label: 'Vendor Interview Checklist',
      icon: HelpCircle,
      prompt: 'What critical contract questions and hidden fee checks should I ask before signing caterer and venue contracts?',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Intelligent Event Planning Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Context-aware consultation grounded in your actual event budget, dates, and attendance.
          </p>
        </div>

        {/* AI Service Connection Badge */}
        <div className="flex items-center gap-2">
          {aiEnabled === true ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3.8 Flash Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200" title="Add GEMINI_API_KEY in Settings > Secrets to enable live Gemini API calls">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>CELEBRATE Intelligence Engine</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Preset Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Quick Planning Modules:
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick planning actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.type}
                disabled={isLoading}
                onClick={() => handleSendMessage(action.prompt, action.type)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-xs font-semibold text-stone-800 transition-all disabled:opacity-50 shadow-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                aria-label={action.label}
              >
                <Icon className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={`${msg.sender === 'user' ? 'You' : 'Assistant'} message`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs" aria-hidden="true">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-white rounded-tr-xs'
                    : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line prose-xs">{msg.content}</div>

                <div
                  className={`flex items-center justify-between pt-2 mt-2 border-t text-[10px] ${
                    msg.sender === 'user'
                      ? 'border-stone-800 text-stone-400'
                      : 'border-stone-200/60 text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-1 rounded"
                      aria-label="Copy message to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" aria-hidden="true" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-stone-500 py-2">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>Consulting event planning intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question about your event
            </label>
            <input
              id="assistant-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about this event (e.g., 'How many cases of wine for 80 guests?', 'Suggest rain contingency schedule')..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              aria-describedby="input-help"
            />
            <span id="input-help" className="sr-only">
              Press Enter to send your message
            </span>
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
