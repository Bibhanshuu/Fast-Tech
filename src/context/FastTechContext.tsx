import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  INITIAL_DIRECTORY_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRICING_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
} from '../data/seedData';
import type {
  AppNotification,
  CartItem,
  DeviceCategory,
  DiagnosticMediaItem,
  DirectoryUser,
  FinancialTransaction,
  PaymentMethod,
  PortalRole,
  PricingConfig,
  Product,
  ServiceTicket,
  StoreOrder,
} from '../types/fastTech';
import {
  calculateVisitationFee,
  cascadeDispatchTier,
  toggleEngineerSpecialization,
} from '../utils/fastTechEngine';

export interface CreateTicketPayload {
  category: DeviceCategory;
  serialNumber: string;
  model: string;
  subject: string;
  description: string;
  isUrgent: boolean;
  locationLabel: string;
  pinCoords: { x: number; y: number };
  distanceKm: number;
  paymentMethod: PaymentMethod;
  slotDay: 'Today' | 'Tomorrow';
  slotTime: string;
  diagnosticMedia: DiagnosticMediaItem[];
}

interface FastTechContextValue {
  role: PortalRole;
  setRole: (role: PortalRole) => void;
  customerLocation: string;
  setCustomerLocation: (loc: string) => void;
  pricingConfig: PricingConfig;
  updatePricingConfig: (next: PricingConfig) => void;
  tickets: ServiceTicket[];
  activeDispatchTicketId: string | null;
  setActiveDispatchTicketId: (id: string | null) => void;
  createTicket: (payload: CreateTicketPayload) => ServiceTicket;
  acceptTicket: (ticketId: string, engineerId?: string) => void;
  cascadeTicketDispatch: (ticketId: string, reason: 'rejected' | 'timeout') => string;
  completeTicket: (ticketId: string) => void;
  sendChatMessage: (ticketId: string, sender: 'customer' | 'engineer', text: string) => void;
  users: DirectoryUser[];
  toggleKycStatus: (userId: string) => void;
  toggleEngineerAvailability: (engineerId: string) => void;
  updateEngineerSpecialization: (
    engineerId: string,
    category: DeviceCategory
  ) => { error: string | null };
  settleCashViaUpi: (engineerId: string) => void;
  applyPenaltyAndFreeze: (engineerId: string) => void;
  products: Product[];
  updateProductStock: (productId: string, delta: number) => void;
  toggleProductSerialTracking: (productId: string) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  orders: StoreOrder[];
  checkoutCart: (paymentMethod: PaymentMethod) => StoreOrder | null;
  transactions: FinancialTransaction[];
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  schemaModalOpen: boolean;
  setSchemaModalOpen: (open: boolean) => void;
}

const FastTechContext = createContext<FastTechContextValue | null>(null);

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const FastTechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<PortalRole>('customer');
  const [customerLocation, setCustomerLocation] = useState('Kolkata, WB, 700001');
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(INITIAL_PRICING_CONFIG);
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_TICKETS);
  const [activeDispatchTicketId, setActiveDispatchTicketId] = useState<string | null>('FT-TK-9038');
  const [users, setUsers] = useState<DirectoryUser[]>(INITIAL_DIRECTORY_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([{ productId: 'prd-01', quantity: 1 }]);
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  const pushNotification = useCallback((title: string, detail: string) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title,
        detail,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  }, []);

  const updatePricingConfig = useCallback(
    (next: PricingConfig) => {
      setPricingConfig(next);
      pushNotification(
        'Pricing & Geofence Updated',
        `Tier 1 (${next.tier1MaxKm}km): ₹${next.tier1Fee} · Timer: ${next.dispatchTimerSec}s`
      );
    },
    [pushNotification]
  );

  const createTicket = useCallback(
    (payload: CreateTicketPayload): ServiceTicket => {
      const quote = calculateVisitationFee(payload.distanceKm, pricingConfig, payload.isUrgent);
      const id = `FT-TK-${Math.floor(9100 + Math.random() * 890)}`;
      const newTicket: ServiceTicket = {
        id,
        customerId: 'usr-cust-01',
        customerName: 'Rohan Chatterjee',
        customerPhone: '+91 98304 51218',
        category: payload.category,
        serialNumber: payload.serialNumber.trim().toUpperCase(),
        model: payload.model.trim(),
        subject: payload.subject.trim(),
        description: payload.description.trim(),
        isUrgent: payload.isUrgent,
        priority: payload.isUrgent ? 'High' : quote.tier === 1 ? 'Medium' : 'Low',
        status: 'Dispatching',
        locationLabel: payload.locationLabel,
        pinCoords: payload.pinCoords,
        distanceKm: payload.distanceKm,
        visitationFee: quote.totalFee,
        paymentMethod: payload.paymentMethod,
        slotDay: payload.slotDay,
        slotTime: payload.slotTime,
        dispatchTier: 1,
        assignedEngineerId: null,
        etaMinutes: null,
        diagnosticMedia: payload.diagnosticMedia,
        dispatchLogs: [
          {
            id: `dl-${Date.now()}`,
            timestamp: nowTimeStr(),
            tier: 1,
            engineerName: 'Arjun Sen',
            outcome: 'sent',
            note: `Waterfall Tier 1 (0–${pricingConfig.tier1MaxKm} km) broadcast initiated.`,
          },
        ],
        chatMessages: [],
        createdAt: `2026-11-17 ${nowTimeStr()}`,
      };

      setTickets((prev) => [newTicket, ...prev]);
      setActiveDispatchTicketId(newTicket.id);
      setTransactions((prev) => [
        {
          id: `TX-${Math.floor(8810 + Math.random() * 900)}`,
          type: 'visitation_fee',
          actorName: 'Rohan Chatterjee',
          amount: quote.totalFee,
          method: payload.paymentMethod,
          status: payload.paymentMethod === 'Cash on Service' ? 'Pending' : 'Settled',
          timestamp: `2026-11-17 ${nowTimeStr()}`,
        },
        ...prev,
      ]);
      pushNotification(
        `Ticket ${newTicket.id} Dispatched`,
        `Searching certified ${payload.category} engineer within ${pricingConfig.tier1MaxKm} km.`
      );
      return newTicket;
    },
    [pricingConfig, pushNotification]
  );

  const acceptTicket = useCallback(
    (ticketId: string, engineerId = 'usr-eng-01') => {
      const eng = users.find((u) => u.id === engineerId);
      setTickets((prev) =>
        prev.map((tk) => {
          if (tk.id !== ticketId) return tk;
          return {
            ...tk,
            status: 'In Progress',
            assignedEngineerId: engineerId,
            etaMinutes: Math.max(6, Math.round(tk.distanceKm * 3.1)),
            dispatchLogs: [
              ...tk.dispatchLogs,
              {
                id: `dl-${Date.now()}`,
                timestamp: nowTimeStr(),
                tier: tk.dispatchTier,
                engineerName: eng?.name ?? 'Arjun Sen',
                outcome: 'accepted',
                note: `Accepted in Tier ${tk.dispatchTier}. Technician en route.`,
              },
            ],
            chatMessages:
              tk.chatMessages.length > 0
                ? tk.chatMessages
                : [
                    {
                      id: `ch-${Date.now()}`,
                      sender: 'engineer',
                      text: `Hello ${tk.customerName.split(' ')[0]}, I've accepted ticket ${tk.id} for your ${tk.model} (S/N: ${tk.serialNumber}). Heading to ${tk.locationLabel} now.`,
                      timestamp: nowTimeStr(),
                    },
                  ],
          };
        })
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === engineerId
            ? { ...u, ongoingJobs: (u.ongoingJobs ?? 0) + 1, availability: 'Busy' }
            : u
        )
      );
      setActiveDispatchTicketId(ticketId);
      pushNotification(
        `Engineer Assigned (${ticketId})`,
        `${eng?.name ?? 'Arjun Sen'} accepted your request and is en route.`
      );
    },
    [users, pushNotification]
  );

  const cascadeTicketDispatch = useCallback(
    (ticketId: string, reason: 'rejected' | 'timeout'): string => {
      let summaryMsg = '';
      setTickets((prev) =>
        prev.map((tk) => {
          if (tk.id !== ticketId) return tk;
          const res = cascadeDispatchTier(tk.dispatchTier, reason);
          summaryMsg = res.logMessage;
          return {
            ...tk,
            dispatchTier: res.nextTier,
            status: res.escalated ? 'Escalated' : 'Dispatching',
            dispatchLogs: [
              ...tk.dispatchLogs,
              {
                id: `dl-${Date.now()}`,
                timestamp: nowTimeStr(),
                tier: tk.dispatchTier,
                engineerName: tk.dispatchTier === 1 ? 'Arjun Sen' : 'Vikram Das',
                outcome: reason === 'timeout' ? 'timeout' : 'rejected',
                note: res.logMessage,
              },
            ],
          };
        })
      );
      pushNotification(`Dispatch Cascade (${ticketId})`, summaryMsg);
      return summaryMsg;
    },
    [pushNotification]
  );

  const completeTicket = useCallback(
    (ticketId: string) => {
      const target = tickets.find((t) => t.id === ticketId);
      if (!target || target.status === 'Completed') return;
      const engId = target.assignedEngineerId ?? 'usr-eng-01';

      setTickets((prev) =>
        prev.map((tk) =>
          tk.id === ticketId ? { ...tk, status: 'Completed', etaMinutes: 0 } : tk
        )
      );
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== engId) return u;
          const isCash = target.paymentMethod === 'Cash on Service';
          return {
            ...u,
            completedJobs: (u.completedJobs ?? 0) + 1,
            ongoingJobs: Math.max(0, (u.ongoingJobs ?? 1) - 1),
            availability: 'Online',
            totalEarnings: (u.totalEarnings ?? 0) + target.visitationFee,
            cashInHand: (u.cashInHand ?? 0) + (isCash ? target.visitationFee : 0),
          };
        })
      );
      pushNotification(`Service Completed (${ticketId})`, 'Job marked completed and earnings credited.');
    },
    [tickets, pushNotification]
  );

  const sendChatMessage = useCallback(
    (ticketId: string, sender: 'customer' | 'engineer', text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTickets((prev) =>
        prev.map((tk) =>
          tk.id === ticketId
            ? {
                ...tk,
                chatMessages: [
                  ...tk.chatMessages,
                  {
                    id: `ch-${Date.now()}`,
                    sender,
                    text: trimmed,
                    timestamp: nowTimeStr(),
                  },
                ],
              }
            : tk
        )
      );
    },
    []
  );

  const toggleKycStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const nextStatus = u.kycStatus === 'Approved' ? 'Suspended' : 'Approved';
        return {
          ...u,
          kycStatus: nextStatus,
          availability:
            u.role === 'engineer'
              ? nextStatus === 'Suspended'
                ? 'Frozen'
                : 'Online'
              : u.availability,
        };
      })
    );
  }, []);

  const toggleEngineerAvailability = useCallback((engineerId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== engineerId || u.availability === 'Frozen') return u;
        return {
          ...u,
          availability: u.availability === 'Online' ? 'Offline' : 'Online',
        };
      })
    );
  }, []);

  const updateEngineerSpecialization = useCallback(
    (engineerId: string, category: DeviceCategory): { error: string | null } => {
      const target = users.find((u) => u.id === engineerId);
      const current = target?.specializations ?? [];
      const result = toggleEngineerSpecialization(current, category);
      if (result.error) {
        return { error: result.error };
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === engineerId ? { ...u, specializations: result.next } : u))
      );
      return { error: null };
    },
    [users]
  );

  const settleCashViaUpi = useCallback(
    (engineerId: string) => {
      const eng = users.find((u) => u.id === engineerId);
      const amount = eng?.cashInHand ?? 0;
      if (amount <= 0) return;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === engineerId
            ? {
                ...u,
                cashInHand: 0,
                overdueDays: 0,
                availability: u.availability === 'Frozen' ? 'Online' : u.availability,
              }
            : u
        )
      );
      setTransactions((prev) => [
        {
          id: `TX-${Math.floor(8810 + Math.random() * 900)}`,
          type: 'cash_settlement',
          actorName: eng?.name ?? 'Engineer',
          amount,
          method: 'UPI Settlement',
          status: 'Settled',
          timestamp: `2026-11-17 ${nowTimeStr()}`,
        },
        ...prev,
      ]);
      pushNotification(
        'Cash Liability Settled',
        `${eng?.name ?? 'Engineer'} settled ₹${amount.toFixed(2)} via Fast Tech UPI.`
      );
    },
    [users, pushNotification]
  );

  const applyPenaltyAndFreeze = useCallback(
    (engineerId: string) => {
      const eng = users.find((u) => u.id === engineerId);
      if (!eng) return;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === engineerId
            ? {
                ...u,
                availability: 'Frozen',
                kycStatus: 'Suspended',
                cashInHand: (u.cashInHand ?? 0) + 250,
              }
            : u
        )
      );
      setTransactions((prev) => [
        {
          id: `TX-${Math.floor(8810 + Math.random() * 900)}`,
          type: 'penalty',
          actorName: eng.name,
          amount: 250,
          method: 'Late Cash Fee',
          status: 'Overdue',
          timestamp: `2026-11-17 ${nowTimeStr()}`,
        },
        ...prev,
      ]);
      pushNotification(
        `Account Frozen (${eng.name})`,
        '₹250 overdue settlement penalty applied & dispatch paused.'
      );
    },
    [users, pushNotification]
  );

  const updateProductStock = useCallback((productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  }, []);

  const toggleProductSerialTracking = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, serialTracked: !p.serialTracked } : p))
    );
  }, []);

  const addToCart = useCallback((productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const checkoutCart = useCallback(
    (paymentMethod: PaymentMethod): StoreOrder | null => {
      if (cart.length === 0) return null;
      const items = cart
        .map((c) => {
          const prod = products.find((p) => p.id === c.productId);
          if (!prod) return null;
          return {
            productId: prod.id,
            name: prod.name,
            quantity: c.quantity,
            unitPrice: prod.price,
            assignedSerial: prod.serialTracked ? prod.serialNumbers[0] : undefined,
          };
        })
        .filter(Boolean) as StoreOrder['items'];

      const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const order: StoreOrder = {
        id: `ORD-${Math.floor(5510 + Math.random() * 480)}`,
        customerName: 'Rohan Chatterjee',
        items,
        totalAmount,
        paymentMethod,
        status: 'Confirmed',
        createdAt: `2026-11-17 ${nowTimeStr()}`,
      };

      setProducts((prev) =>
        prev.map((p) => {
          const ordered = cart.find((c) => c.productId === p.id);
          if (!ordered) return p;
          return { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
        })
      );
      setOrders((prev) => [order, ...prev]);
      setTransactions((prev) => [
        {
          id: `TX-${Math.floor(8810 + Math.random() * 900)}`,
          type: 'store_order',
          actorName: 'Rohan Chatterjee',
          amount: totalAmount,
          method: paymentMethod,
          status: paymentMethod === 'Cash on Service' ? 'Pending' : 'Settled',
          timestamp: `2026-11-17 ${nowTimeStr()}`,
        },
        ...prev,
      ]);
      setCart([]);
      pushNotification(`Order ${order.id} Confirmed`, `Total ₹${totalAmount.toLocaleString('en-IN')} via ${paymentMethod}.`);
      return order;
    },
    [cart, products, pushNotification]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  return (
    <FastTechContext.Provider
      value={{
        role,
        setRole,
        customerLocation,
        setCustomerLocation,
        pricingConfig,
        updatePricingConfig,
        tickets,
        activeDispatchTicketId,
        setActiveDispatchTicketId,
        createTicket,
        acceptTicket,
        cascadeTicketDispatch,
        completeTicket,
        sendChatMessage,
        users,
        toggleKycStatus,
        toggleEngineerAvailability,
        updateEngineerSpecialization,
        settleCashViaUpi,
        applyPenaltyAndFreeze,
        products,
        updateProductStock,
        toggleProductSerialTracking,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        orders,
        checkoutCart,
        transactions,
        notifications,
        markNotificationsRead,
        schemaModalOpen,
        setSchemaModalOpen,
      }}
    >
      {children}
    </FastTechContext.Provider>
  );
};

export function useFastTech() {
  const ctx = useContext(FastTechContext);
  if (!ctx) {
    throw new Error('useFastTech must be used inside FastTechProvider');
  }
  return ctx;
}
