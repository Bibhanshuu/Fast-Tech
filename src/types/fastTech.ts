export type PortalRole = 'customer' | 'engineer' | 'admin';

export type DeviceCategory =
  | 'NoteBook'
  | 'MacBook'
  | 'Desktop'
  | 'Workstation'
  | 'Printer'
  | 'Mouse/Keyboard'
  | 'Preventative Cleaning';

export type TicketPriority = 'High' | 'Medium' | 'Low';

export type TicketStatus =
  | 'Dispatching'
  | 'In Progress'
  | 'Completed'
  | 'Escalated';

export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Cash on Service';

export interface PricingConfig {
  tier1MaxKm: number;
  tier1Fee: number;
  tier2MaxKm: number;
  tier2Fee: number;
  tier3MaxKm: number;
  tier3Fee: number;
  urgentSurcharge: number;
  dispatchTimerSec: number;
}

export interface DiagnosticMediaItem {
  id: string;
  type: 'voice' | 'video' | 'image';
  name: string;
  durationSec?: number;
  previewUrl?: string;
}

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  tier: 1 | 2 | 3;
  engineerName: string;
  outcome: 'sent' | 'accepted' | 'rejected' | 'timeout';
  note: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'engineer';
  text: string;
  timestamp: string;
}

export interface ServiceTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: DeviceCategory;
  serialNumber: string;
  model: string;
  subject: string;
  description: string;
  isUrgent: boolean;
  priority: TicketPriority;
  status: TicketStatus;
  locationLabel: string;
  pinCoords: { x: number; y: number };
  distanceKm: number;
  visitationFee: number;
  paymentMethod: PaymentMethod;
  slotDay: 'Today' | 'Tomorrow';
  slotTime: string;
  dispatchTier: 1 | 2 | 3;
  assignedEngineerId: string | null;
  etaMinutes: number | null;
  diagnosticMedia: DiagnosticMediaItem[];
  dispatchLogs: DispatchLogEntry[];
  chatMessages: ChatMessage[];
  createdAt: string;
}

export interface DirectoryUser {
  id: string;
  name: string;
  role: 'customer' | 'engineer';
  email: string;
  phone: string;
  location: string;
  kycStatus: 'Approved' | 'Pending' | 'Suspended';
  availability?: 'Online' | 'Busy' | 'Offline' | 'Frozen';
  rating?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  specializations?: DeviceCategory[];
  avatarUrl?: string;
  totalEarnings?: number;
  cashInHand?: number;
  overdueDays?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Motherboard' | 'RAM' | 'SSD' | 'Chips' | 'Peripherals';
  price: number;
  stock: number;
  serialTracked: boolean;
  serialNumbers: string[];
  compatibleModels: string;
  imageUrl: string;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreOrder {
  id: string;
  customerName: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number; assignedSerial?: string }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: 'Confirmed' | 'Dispatched';
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'visitation_fee' | 'cash_settlement' | 'store_order' | 'penalty';
  actorName: string;
  amount: number;
  method: string;
  status: 'Settled' | 'Pending' | 'Overdue';
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}
