export type EventCategory =
  | 'Wedding'
  | 'Birthday'
  | 'Corporate Gala'
  | 'College Festival'
  | 'Anniversary'
  | 'Private Dinner'
  | 'Conference'
  | 'Baby Shower'
  | 'Community'
  | 'Other';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime?: string;
  location: string;
  targetBudget: number;
  themeColor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RSVPStatus = 'accepted' | 'confirmed' | 'pending' | 'declined';
export type InvitationStatus = 'sent' | 'pending' | 'accepted' | 'declined';
export type GuestGroup = 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Vendors' | 'General';

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  rsvpStatus: RSVPStatus;
  invitationStatus: InvitationStatus;
  plusOnes: number;
  dietaryRestrictions: string;
  tableNumber?: string;
  group: GuestGroup;
  invitationSent: boolean;
  notes?: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Venue & Rental'
  | 'Catering & Bar'
  | 'Photography & Video'
  | 'Decor & Florals'
  | 'Music & Entertainment'
  | 'Invitations & Favors'
  | 'Attire & Styling'
  | 'Staff & Security'
  | 'Transportation'
  | 'Miscellaneous';

export type ExpenseStatus = 'paid' | 'pending' | 'deposit_paid';

export interface ExpenseItem {
  id: string;
  eventId: string;
  title: string;
  category: ExpenseCategory;
  plannedAmount: number;
  actualAmount: number;
  status: ExpenseStatus;
  vendorName: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export type TaskCategory =
  | 'Planning'
  | 'Vendor Booking'
  | 'Guests & Invitations'
  | 'Design & Decor'
  | 'Logistics & Setup'
  | 'Day-of Execution';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueDate: string;
  completed: boolean;
  priority: TaskPriority;
  assignee: string;
  createdAt: string;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  estimatedCost: string;
  capacity?: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  features: string[];
  isCustom?: boolean;
}

export type InvitationTheme = 'champagne' | 'midnight' | 'botanical' | 'velvet' | 'minimal';

export interface InvitationConfig {
  eventId: string;
  theme: InvitationTheme;
  headline: string;
  hostMessage: string;
  dressCode: string;
  rsvpDeadline: string;
  scheduleHighlights: string[];
  customLocationNotes?: string;
}
