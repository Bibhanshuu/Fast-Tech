import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Play,
  Send,
  ShieldCheck,
  Smartphone,
  Volume2,
  Wallet,
  X,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import { ASSET_PATHS, WEEKLY_EARNINGS_SERIES } from '../data/seedData';
import type { DeviceCategory, DiagnosticMediaItem } from '../types/fastTech';
import {
  formatCountdown,
  formatINR,
  maskPhoneNumber,
} from '../utils/fastTechEngine';

const ALL_SPECIALTIES: DeviceCategory[] = [
  'NoteBook',
  'MacBook',
  'Desktop',
  'Workstation',
  'Printer',
  'Mouse/Keyboard',
  'Preventative Cleaning',
];

export const EngineerPortal: React.FC = () => {
  const {
    users,
    tickets,
    pricingConfig,
    acceptTicket,
    cascadeTicketDispatch,
    completeTicket,
    sendChatMessage,
    toggleEngineerAvailability,
    updateEngineerSpecialization,
    settleCashViaUpi,
  } = useFastTech();

  const engineer = users.find((u) => u.id === 'usr-eng-01') ?? users[0];
  const incomingTicket = tickets.find((t) => t.status === 'Dispatching') ?? null;
  const ongoingTickets = tickets.filter(
    (t) => t.status === 'In Progress' && (t.assignedEngineerId === engineer.id || !t.assignedEngineerId)
  );

  const [secondsLeft, setSecondsLeft] = useState<number>(Math.max(1, pricingConfig.dispatchTimerSec - 2));
  const [cascadeBanner, setCascadeBanner] = useState<string | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<DiagnosticMediaItem | null>(null);
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(3);
  const [chatText, setChatText] = useState<Record<string, string>>({});

  useEffect(() => {
    setSecondsLeft(Math.max(1, pricingConfig.dispatchTimerSec - 2));
  }, [incomingTicket?.id, pricingConfig.dispatchTimerSec]);

  useEffect(() => {
    if (!incomingTicket || engineer.availability === 'Frozen') return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const msg = cascadeTicketDispatch(incomingTicket.id, 'timeout');
          setCascadeBanner(msg);
          return pricingConfig.dispatchTimerSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [incomingTicket, engineer.availability, cascadeTicketDispatch, pricingConfig.dispatchTimerSec]);

  const handleReject = () => {
    if (!incomingTicket) return;
    const msg = cascadeTicketDispatch(incomingTicket.id, 'rejected');
    setCascadeBanner(msg);
    setSecondsLeft(pricingConfig.dispatchTimerSec);
  };

  const handleAccept = () => {
    if (!incomingTicket) return;
    setCascadeBanner(null);
    acceptTicket(incomingTicket.id, engineer.id);
  };

  const handleToggleSpecialty = (cat: DeviceCategory) => {
    const res = updateEngineerSpecialization(engineer.id, cat);
    setSpecError(res.error);
  };

  // Build SVG line chart coordinates
  const maxVal = Math.max(...WEEKLY_EARNINGS_SERIES.map((d) => d.earnings), 700);
  const chartPoints = WEEKLY_EARNINGS_SERIES.map((d, idx) => {
    const x = 24 + idx * 46;
    const y = 110 - Math.round((d.earnings / maxVal) * 82);
    return { ...d, x, y };
  });
  const polylineStr = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      {/* 1. Earnings & Wallet Header (Blue Gradient Summary Card) */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={engineer.avatarUrl ?? ASSET_PATHS.engineerAvatar}
              alt={engineer.name}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-2xl object-cover border-2 border-white/25 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{engineer.name}</h1>
                <span className="text-xs font-semibold text-emerald-300 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  KYC {engineer.kycStatus}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {engineer.location} · Dual Specialization:{' '}
                {(engineer.specializations ?? []).join(' & ') || 'None selected'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={engineer.availability === 'Frozen'}
              onClick={() => toggleEngineerAvailability(engineer.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                engineer.availability === 'Frozen'
                  ? 'bg-[#EF4444] text-white cursor-not-allowed'
                  : engineer.availability === 'Online'
                  ? 'bg-[#10B981] text-white hover:bg-emerald-600'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              Status: {engineer.availability}
            </button>

            <button
              type="button"
              disabled={(engineer.cashInHand ?? 0) <= 0}
              onClick={() => setUpiModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0F172A] shadow-sm hover:bg-blue-50 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Wallet className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              Settle Cash to Fast Tech via UPI
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl bg-white/10 p-4 border border-white/10">
            <p className="text-xs text-blue-100">Total Earnings</p>
            <p
              data-testid="engineer-total-earnings"
              className="mt-1 text-2xl font-bold font-mono tabular-nums"
            >
              ₹{(engineer.totalEarnings ?? 3099).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 border border-white/10">
            <p className="text-xs text-blue-100">Completed Services</p>
            <p
              data-testid="engineer-completed-count"
              className="mt-1 text-2xl font-bold font-mono tabular-nums"
            >
              {engineer.completedJobs ?? 5}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 border border-white/10">
            <p className="text-xs text-blue-100">Ongoing</p>
            <p
              data-testid="engineer-ongoing-count"
              className="mt-1 text-2xl font-bold font-mono tabular-nums"
            >
              {engineer.ongoingJobs ?? 1}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 border border-white/10">
            <p className="text-xs text-blue-100">Cash-in-Hand Liability</p>
            <p
              data-testid="engineer-cash-liability"
              className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                (engineer.cashInHand ?? 0) > 0 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              ₹{(engineer.cashInHand ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </section>

      {cascadeBanner && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900"
        >
          <span>{cascadeBanner}</span>
          <button
            type="button"
            onClick={() => setCascadeBanner(null)}
            className="text-amber-700 hover:text-amber-950"
            aria-label="Dismiss dispatch alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Incoming Job Request Card (Waterfall Dispatch) & Ongoing Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Incoming Job Request (Waterfall Dispatch)
                </h2>
                <p className="text-xs text-slate-500">
                  Accept before timer reaches 00:00 or ticket cascades to next geofence tier
                </p>
              </div>
              {incomingTicket && (
                <div className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-[#EF4444]">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span
                    data-testid="engineer-countdown-timer"
                    className="font-mono text-sm font-bold tabular-nums"
                  >
                    {formatCountdown(secondsLeft)}
                  </span>
                </div>
              )}
            </div>

            {engineer.availability === 'Frozen' ? (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-[#EF4444]" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-[#0F172A]">
                  Dispatch Paused — Settle Overdue Cash Liability
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your account was frozen by Fast Tech Super Admin. Settle Cash-in-Hand via UPI to
                  resume receiving tickets.
                </p>
              </div>
            ) : incomingTicket ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-[#2563EB]">
                        {incomingTicket.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Tier {incomingTicket.dispatchTier} Dispatch</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#0F172A]">
                        {incomingTicket.category}
                      </span>
                      {incomingTicket.isUrgent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[#EF4444]">Urgent Priority</span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#0F172A]">
                      {incomingTicket.model} — {incomingTicket.subject}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">Visitation Fee</p>
                    <p className="font-mono text-lg font-bold tabular-nums text-[#0F172A]">
                      {formatINR(incomingTicket.visitationFee)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-[#F0F7FF] p-3.5 text-xs">
                  <div>
                    <p className="text-slate-500">Proximity Distance</p>
                    <p className="mt-0.5 font-mono font-bold text-[#0F172A] tabular-nums inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                      {incomingTicket.distanceKm.toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Device Serial No.</p>
                    <p className="mt-0.5 font-mono font-bold text-[#0F172A]">
                      {incomingTicket.serialNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Customer (Masked)</p>
                    <p className="mt-0.5 font-mono font-semibold text-[#0F172A]">
                      {maskPhoneNumber(incomingTicket.customerPhone)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {incomingTicket.description}
                </p>

                {/* Diagnostic Media Playback Buttons */}
                {incomingTicket.diagnosticMedia.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#0F172A]">
                      Customer Diagnostic Media
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {incomingTicket.diagnosticMedia.map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => setPreviewMedia(media)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-blue-50 hover:border-[#2563EB] transition-colors"
                        >
                          {media.type === 'voice' ? (
                            <Volume2 className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                          )}
                          <span>Play / View {media.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {previewMedia && (
                  <div className="rounded-xl border border-blue-200 bg-[#F0F7FF] p-3.5 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#0F172A]">
                        Diagnostic Playback: {previewMedia.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewMedia(null)}
                        className="text-slate-500 hover:text-[#0F172A]"
                        aria-label="Close diagnostic media preview"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {previewMedia.previewUrl ? (
                      <img
                        src={previewMedia.previewUrl}
                        alt={previewMedia.name}
                        referrerPolicy="no-referrer"
                        className="h-32 w-full rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg bg-white p-3 border border-slate-200">
                        <Volume2 className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full w-2/3 bg-[#2563EB] rounded-full" />
                        </div>
                        <span className="font-mono tabular-nums text-slate-600">
                          00:{String(previewMedia.durationSec ?? 15).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#EF4444] py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#10B981]" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-[#0F172A]">
                  Queue Clear — Waiting for Next Tier 1 Broadcast
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Raise a new service ticket in Customer View to test live Waterfall Dispatch.
                </p>
              </div>
            )}
          </div>

          {/* Active Ongoing Services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0F172A]">
              Active Ongoing Jobs ({ongoingTickets.length})
            </h2>
            {ongoingTickets.length === 0 ? (
              <p className="text-xs text-slate-500">No active jobs assigned right now.</p>
            ) : (
              ongoingTickets.map((tk) => (
                <div
                  key={tk.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#2563EB]">
                        {tk.id} · S/N {tk.serialNumber}
                      </p>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        {tk.model} — {tk.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tk.locationLabel} · Customer {maskPhoneNumber(tk.customerPhone)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => completeTicket(tk.id)}
                      className="rounded-xl bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Mark Completed
                    </button>
                  </div>

                  {/* Masked Engineer -> Customer Chat */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-[#2563EB]" aria-hidden="true" />
                      Customer In-App Thread
                    </p>
                    {tk.chatMessages.slice(-2).map((m) => (
                      <p key={m.id} className="text-xs text-slate-700">
                        <span className="font-semibold">
                          {m.sender === 'engineer' ? 'You' : tk.customerName.split(' ')[0]}:
                        </span>{' '}
                        {m.text}
                      </p>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = chatText[tk.id] ?? '';
                        if (!val.trim()) return;
                        sendChatMessage(tk.id, 'engineer', val);
                        setChatText((prev) => ({ ...prev, [tk.id]: '' }));
                      }}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={chatText[tk.id] ?? ''}
                        onChange={(e) =>
                          setChatText((prev) => ({ ...prev, [tk.id]: e.target.value }))
                        }
                        placeholder="Reply to customer..."
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#2563EB] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <Send className="h-3 w-3" aria-hidden="true" />
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Technician Performance Chart & Dual-Specialization Profile */}
        <div className="lg:col-span-5 space-y-5">
          {/* Weekly Earnings Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Weekly Earnings</h2>
                <p className="text-xs text-slate-500">Interactive 7-day payout curve</p>
              </div>
              {hoveredDayIdx !== null && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#2563EB]">
                    {WEEKLY_EARNINGS_SERIES[hoveredDayIdx].day}
                  </p>
                  <p className="font-mono text-sm font-bold tabular-nums text-[#0F172A]">
                    {formatINR(WEEKLY_EARNINGS_SERIES[hoveredDayIdx].earnings)} (
                    {WEEKLY_EARNINGS_SERIES[hoveredDayIdx].jobs}{' '}
                    {WEEKLY_EARNINGS_SERIES[hoveredDayIdx].jobs === 1 ? 'job' : 'jobs'})
                  </p>
                </div>
              )}
            </div>

            <svg
              viewBox="0 0 325 135"
              className="w-full h-44 overflow-visible"
              aria-label="Weekly earnings line chart"
            >
              {[30, 60, 90, 110].map((y) => (
                <line
                  key={y}
                  x1="12"
                  y1={y}
                  x2="315"
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
              ))}
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
              {chartPoints.map((pt, idx) => {
                const active = hoveredDayIdx === idx;
                return (
                  <g
                    key={pt.day}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDayIdx(idx)}
                    onClick={() => setHoveredDayIdx(idx)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={active ? 6 : 4}
                      fill={active ? '#2563EB' : '#FFFFFF'}
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y="128"
                      textAnchor="middle"
                      fontSize="10"
                      fill={active ? '#0F172A' : '#64748B'}
                      fontWeight={active ? '700' : '500'}
                    >
                      {pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Strict Dual-Specialization Profile Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Dual-Specialization Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Strict policy: select up to 2 certified hardware categories
                </p>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-[#2563EB]">
                {(engineer.specializations ?? []).length}/2 Active
              </span>
            </div>

            {specError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-[#EF4444]"
              >
                {specError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_SPECIALTIES.map((cat) => {
                const checked = (engineer.specializations ?? []).includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                      checked
                        ? 'border-[#2563EB] bg-[#F0F7FF] text-[#0F172A]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleSpecialty(cat)}
                      className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* UPI Settlement Modal */}
      {upiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Settle Cash to Fast Tech via UPI"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[#0F172A]">Fast Tech UPI Settlement</h3>
              </div>
              <button
                type="button"
                aria-label="Close UPI settlement dialog"
                onClick={() => setUpiModalOpen(false)}
                className="text-slate-400 hover:text-[#0F172A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Clear your Cash-in-Hand Liability to keep dispatch eligibility active.
            </p>
            <div className="rounded-xl bg-[#F0F7FF] p-4 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Settlement Amount</span>
              <span className="font-mono text-xl font-bold tabular-nums text-[#2563EB]">
                ₹{(engineer.cashInHand ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-500">
              VPA: settlements@fasttech.icici · Instant Ledger Sync
            </p>
            <button
              type="button"
              onClick={() => {
                settleCashViaUpi(engineer.id);
                setUpiModalOpen(false);
              }}
              className="w-full rounded-xl bg-[#10B981] py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              Confirm UPI Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
