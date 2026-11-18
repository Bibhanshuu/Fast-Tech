import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Cpu,
  HardDrive,
  HelpCircle,
  Keyboard,
  Laptop,
  MapPin,
  Monitor,
  Printer,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
  X,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import { ASSET_PATHS } from '../data/seedData';
import type { DeviceCategory, PaymentMethod, TicketStatus } from '../types/fastTech';
import { filterProducts, formatINR } from '../utils/fastTechEngine';
import { CustomerBookingModal } from './CustomerBookingModal';
import { LiveTrackingPanel } from './LiveTrackingPanel';

export type CustomerTab = 'home' | 'store' | 'tickets';

const SERVICE_CATEGORIES: {
  id: DeviceCategory;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'NoteBook', label: 'NoteBook', subtitle: 'Windows & Linux', icon: Laptop },
  { id: 'MacBook', label: 'MacBook', subtitle: 'Apple Silicon & Intel', icon: Laptop },
  { id: 'Desktop', label: 'Desktop', subtitle: 'Custom & OEM Towers', icon: Monitor },
  { id: 'Workstation', label: 'Workstation', subtitle: 'CAD & GPU Rigs', icon: Server },
  { id: 'Printer', label: 'Printer', subtitle: 'Laser & InkTank', icon: Printer },
  { id: 'Mouse/Keyboard', label: 'Mouse/Keyboard', subtitle: 'Switches & Sensors', icon: Keyboard },
  {
    id: 'Preventative Cleaning',
    label: 'Preventative Cleaning',
    subtitle: 'Thermal & Dust Purge',
    icon: Sparkles,
  },
];

const HELP_FAQS = [
  {
    q: 'How is the Fast Tech doorstep visitation fee calculated?',
    a: 'Visitation pricing scales transparently by your pin distance from the nearest hub (Tier 1: 0–5 km, Tier 2: 5–10 km, Tier 3: 10–20 km). If you approve a part replacement, the diagnostic fee is adjusted into the final invoice.',
  },
  {
    q: 'Are phone numbers hidden between customers and engineers?',
    a: 'Yes. Both customer and technician phone numbers are masked on-screen and bridged strictly via encrypted In-App Chat and Masked VoIP Calls.',
  },
  {
    q: 'Why is my Device Serial Number mandatory when raising a ticket?',
    a: 'Your serial number lets Fast Tech pre-verify motherboard revisions, OEM battery compatibility, and part warranty before the engineer leaves the hub.',
  },
];

interface CustomerPortalProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ activeTab, setActiveTab }) => {
  const {
    customerLocation,
    setCustomerLocation,
    tickets,
    activeDispatchTicketId,
    setActiveDispatchTicketId,
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    checkoutCart,
    orders,
    notifications,
    markNotificationsRead,
  } = useFastTech();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState(customerLocation);
  const [notifOpen, setNotifOpen] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<DeviceCategory>('MacBook');

  // Hardware Store filters & cart drawer
  const [storeCategory, setStoreCategory] = useState<string>('All');
  const [serialFilter, setSerialFilter] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [storePayment, setStorePayment] = useState<PaymentMethod>('UPI');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // My Tickets filter & FAQ accordion
  const [ticketFilter, setTicketFilter] = useState<'All' | TicketStatus>('All');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const activeTicket =
    tickets.find((t) => t.id === activeDispatchTicketId) ??
    tickets.find((t) => t.status === 'Dispatching' || t.status === 'In Progress') ??
    null;

  const filteredProducts = filterProducts(products, searchQuery, serialFilter, storeCategory);

  const filteredCategories = searchQuery.trim()
    ? SERVICE_CATEGORIES.filter((c) =>
        `${c.label} ${c.subtitle}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : SERVICE_CATEGORIES;

  const filteredTickets = tickets.filter((t) =>
    ticketFilter === 'All' ? true : t.status === ticketFilter
  );

  const openBookingFor = (cat: DeviceCategory) => {
    setBookingCategory(cat);
    setBookingOpen(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationDraft.trim()) {
      setCustomerLocation(locationDraft.trim());
    }
    setEditingLocation(false);
  };

  const handleStoreCheckout = () => {
    const order = checkoutCart(storePayment);
    if (order) {
      setLastOrderId(order.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-header Bar: Location, Search, Notifications & Cart */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80">
        {/* Location Picker */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#2563EB] shrink-0">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </div>
          {editingLocation ? (
            <form onSubmit={handleSaveLocation} className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Service city and postal code"
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                className="rounded-lg border border-[#2563EB] px-2.5 py-1 text-xs font-medium text-[#0F172A] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#2563EB] px-2.5 py-1 text-xs font-semibold text-white"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLocationDraft(customerLocation);
                setEditingLocation(true);
              }}
              className="text-left min-w-0 group"
            >
              <p className="text-[11px] font-medium text-slate-500">Service Location</p>
              <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#2563EB]">
                {customerLocation}
              </p>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Fast Tech devices, issues, or parts"
            className="w-full rounded-xl border border-slate-200 bg-[#F0F7FF]/50 py-2.5 pl-10 pr-4 text-xs text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Notification Bell & Cart */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              type="button"
              aria-label={`Notifications (${unreadCount} unread)`}
              onClick={() => {
                setNotifOpen((v) => !v);
                markNotificationsRead();
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-40">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-bold text-[#0F172A]">Dispatch Updates</span>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-slate-400 hover:text-[#0F172A]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="rounded-xl bg-[#F0F7FF]/60 p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0F172A]">{n.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{n.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
            <span>Cart</span>
            <span className="font-mono tabular-nums text-[#2563EB]">({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => openBookingFor('MacBook')}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            Book Repair
          </button>
        </div>
      </div>

      {/* TAB 1: HOME & SERVICE DISCOVERY */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Hero Promo Banner */}
          <section className="overflow-hidden rounded-2xl bg-[#0F172A] text-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#60A5FA]">
                    Fast Tech Kolkata Metro Ring · Tier 1–3 Geofenced Dispatch
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance leading-tight">
                    Fast Tech Doorstep Repairs — Certified Engineers in Minutes
                  </h1>
                  <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                    Board-level MacBook diagnostics, enterprise NoteBook thermals, and genuine
                    serial-tracked components delivered to your desk with masked privacy.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openBookingFor('MacBook')}
                    className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                  >
                    Book Doorstep Technician
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('store')}
                    className="rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    Browse Hardware Store
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 min-h-[220px] relative bg-slate-800">
                <img
                  src={ASSET_PATHS.heroRepair}
                  alt="Fast Tech certified hardware technician inspecting a laptop logic board"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0F172A]/60 lg:via-transparent" />
              </div>
            </div>
          </section>

          {/* Interactive Category Grid */}
          <section aria-labelledby="categories-heading">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="categories-heading" className="text-lg font-bold text-[#0F172A]">
                  Select Hardware Service Category
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any hardware class to launch doorstep ticketing with live visitation quote
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openBookingFor(cat.id)}
                    className="group flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-[#2563EB] hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-bold text-[#0F172A]">{cat.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Live Waterfall Dispatch & Engineer Tracking */}
          {activeTicket && (
            <section aria-labelledby="live-tracking-heading" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 id="live-tracking-heading" className="text-lg font-bold text-[#0F172A]">
                    Live Dispatch &amp; Engineer Tracking
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time waterfall status for ticket{' '}
                    <span className="font-mono font-semibold text-[#0F172A]">{activeTicket.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {tickets
                    .filter((t) => t.status !== 'Completed')
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveDispatchTicketId(t.id)}
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                          activeTicket.id === t.id
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.id} · {t.status}
                      </button>
                    ))}
                </div>
              </div>

              <LiveTrackingPanel ticket={activeTicket} />
            </section>
          )}

          {/* Featured Store Preview (search-aware) */}
          <section aria-labelledby="store-preview-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="store-preview-heading" className="text-lg font-bold text-[#0F172A]">
                  OEM Serial-Tracked Replacement Parts
                </h2>
                <p className="text-xs text-slate-500">
                  Same-day dispatch with technician installation option
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('store')}
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                View Full Store &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span>{product.category}</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-[#0F172A] line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 truncate">
                        {product.compatibleModels}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-base font-bold font-mono tabular-nums text-[#0F172A]">
                        {formatINR(product.price)}
                      </span>
                      <button
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() => {
                          addToCart(product.id);
                          setCartOpen(true);
                        }}
                        className="rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: FAST TECH HARDWARE STORE */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Fast Tech Hardware Store</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter Laptop Motherboards, RAM, SSDs, Chips &amp; Peripherals by device or part
                Serial Number
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Cpu
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={serialFilter}
                  onChange={(e) => setSerialFilter(e.target.value)}
                  placeholder="Filter by Serial No. (e.g. 99401)"
                  aria-label="Filter hardware parts by Serial Number"
                  className="w-60 rounded-xl border border-slate-200 bg-[#F0F7FF]/50 py-2 pl-8 pr-3 font-mono text-xs text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Motherboard', 'RAM', 'SSD', 'Chips', 'Peripherals'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setStoreCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  storeCategory === cat
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <HardDrive className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-bold text-[#0F172A]">
                No hardware parts match your Serial Number or query
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing the serial filter or searching another SKU.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSerialFilter('');
                  setSearchQuery('');
                  setStoreCategory('All');
                }}
                className="mt-4 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
              >
                Reset Catalog Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{product.category}</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-[#0F172A]">{product.name}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Fits: <span className="font-medium text-[#0F172A]">{product.compatibleModels}</span>
                      </p>
                      {product.serialTracked && (
                        <p className="mt-1.5 font-mono text-[11px] text-[#2563EB]">
                          Serials: {product.serialNumbers.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                      <div>
                        <p className="text-lg font-bold font-mono tabular-nums text-[#0F172A]">
                          {formatINR(product.price)}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() => {
                          addToCart(product.id);
                          setCartOpen(true);
                        }}
                        className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Hardware Orders */}
          {orders.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Recent Store Orders</h2>
              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#0F172A]">{ord.id}</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span className="text-slate-600">
                        {ord.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#10B981]">{ord.status}</span>
                      <span className="font-mono font-bold tabular-nums text-[#0F172A]">
                        {formatINR(ord.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY TICKETS & HELP CENTER */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">My Service Tickets</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track active doorstep dispatches, serial logs, and completed repairs
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100">
              {(['All', 'Dispatching', 'In Progress', 'Completed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTicketFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    ticketFilter === status
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-[#0F172A]">{ticket.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ticket.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">S/N {ticket.serialNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        ticket.priority === 'High'
                          ? 'text-[#EF4444]'
                          : ticket.priority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {ticket.model} — {ticket.subject}
                  </h3>
                  <p className="text-xs text-slate-600">{ticket.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        ticket.status === 'Completed'
                          ? 'text-[#10B981]'
                          : ticket.status === 'In Progress'
                          ? 'text-[#2563EB]'
                          : 'text-amber-600'
                      }`}
                    >
                      {ticket.status}
                    </p>
                    <p className="font-mono text-sm font-bold tabular-nums text-[#0F172A]">
                      {formatINR(ticket.visitationFee)}
                    </p>
                  </div>
                  {ticket.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDispatchTicketId(ticket.id);
                        setActiveTab('home');
                      }}
                      className="rounded-xl bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      Track Live
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Help Center Accordion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <HelpCircle className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#0F172A]">Fast Tech Help Center</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {HELP_FAQS.map((faq, idx) => {
                const open = openFaqIdx === idx;
                return (
                  <div key={faq.q} className="py-3">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaqIdx(open ? null : idx)}
                      className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-[#0F172A]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fast Tech Hardware Store Cart"
          className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/50 backdrop-blur-sm"
        >
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-[#0F172A]">Hardware Cart ({cartCount})</h2>
              <button
                type="button"
                aria-label="Close cart drawer"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {lastOrderId && cart.length === 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                    Order {lastOrderId} Confirmed!
                  </div>
                  <p className="mt-1">
                    Serial unit allocated and queued for same-day Kolkata delivery.
                  </p>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-[#0F172A]">Your cart is empty</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add OEM SSDs, RAM, or logic boards from the Hardware Store.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#0F172A]">{prod.name}</p>
                        <p className="font-mono text-xs text-slate-500 tabular-nums mt-0.5">
                          {formatINR(prod.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${prod.name}`}
                            onClick={() => updateCartQty(prod.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${prod.name}`}
                            onClick={() => updateCartQty(prod.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${prod.name} from cart`}
                        onClick={() => removeFromCart(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-5 space-y-4 bg-slate-50">
                <div>
                  <label
                    htmlFor="store-payment-select"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Payment Method
                  </label>
                  <select
                    id="store-payment-select"
                    value={storePayment}
                    onChange={(e) => setStorePayment(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#0F172A]"
                  >
                    <option value="UPI">UPI Instant</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Cash on Service">Cash on Delivery</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[#0F172A]">
                  <span>Order Total</span>
                  <span className="font-mono text-lg tabular-nums text-[#2563EB]">
                    {formatINR(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStoreCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Checkout &amp; Reserve Serial Units
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <CustomerBookingModal
        isOpen={bookingOpen}
        initialCategory={bookingCategory}
        onClose={() => setBookingOpen(false)}
        onSuccess={(ticketId) => {
          setActiveDispatchTicketId(ticketId);
          setActiveTab('home');
        }}
      />
    </div>
  );
};
