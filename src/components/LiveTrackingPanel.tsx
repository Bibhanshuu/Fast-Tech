import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  Navigation,
  Phone,
  PhoneOff,
  Radio,
  Send,
  Shield,
  Star,
  X,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import { ASSET_PATHS } from '../data/seedData';
import type { ServiceTicket } from '../types/fastTech';
import { formatINR, maskPhoneNumber } from '../utils/fastTechEngine';

interface LiveTrackingPanelProps {
  ticket: ServiceTicket;
}

export const LiveTrackingPanel: React.FC<LiveTrackingPanelProps> = ({ ticket }) => {
  const { users, pricingConfig, acceptTicket, sendChatMessage, setRole } = useFastTech();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [voipActive, setVoipActive] = useState(false);
  const [voipSec, setVoipSec] = useState(0);

  useEffect(() => {
    if (!voipActive) {
      setVoipSec(0);
      return;
    }
    const interval = window.setInterval(() => {
      setVoipSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [voipActive]);

  const engineer = users.find((u) => u.id === ticket.assignedEngineerId);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(ticket.id, 'customer', chatInput);
    setChatInput('');
  };

  if (ticket.status === 'Dispatching' || ticket.status === 'Escalated') {
    const tierRadius =
      ticket.dispatchTier === 1
        ? `0–${pricingConfig.tier1MaxKm} km`
        : ticket.dispatchTier === 2
        ? `${pricingConfig.tier1MaxKm}–${pricingConfig.tier2MaxKm} km`
        : `${pricingConfig.tier2MaxKm}–${pricingConfig.tier3MaxKm} km`;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-6 bg-[#F0F7FF] rounded-2xl border border-blue-100 relative overflow-hidden">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-[#2563EB]/30 animate-radar-ring" />
              <span className="absolute inset-0 rounded-full border-2 border-[#2563EB]/20 animate-radar-ring-delayed" />
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg">
                <Radio className="h-7 w-7" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-[#0F172A] text-center px-4">
              Fast Tech Dispatch: Searching nearest certified technician
            </p>
            <p className="mt-1 text-xs font-medium text-[#2563EB]">
              Tier {ticket.dispatchTier}: {tierRadius} · {ticket.category}
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500 font-mono">
                  {ticket.id} · S/N {ticket.serialNumber}
                </p>
                <h3 className="text-lg font-bold text-[#0F172A]">{ticket.subject}</h3>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-[#2563EB]">
                {formatINR(ticket.visitationFee)} ({ticket.paymentMethod})
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <p className="text-xs font-semibold text-[#0F172A]">Waterfall Dispatch Log</p>
              {ticket.dispatchLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 text-xs text-slate-600"
                >
                  <span>
                    <span className="font-mono font-semibold text-[#0F172A]">
                      [{log.timestamp}]
                    </span>{' '}
                    {log.note}
                  </span>
                  <span className="font-mono text-[11px] uppercase text-slate-500 shrink-0">
                    {log.outcome}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => acceptTicket(ticket.id, 'usr-eng-01')}
                className="rounded-xl bg-[#10B981] px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Simulate Engineer Accept
              </button>
              <button
                type="button"
                onClick={() => setRole('engineer')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
              >
                Respond in Service Engineer View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Live Simulated Route Map */}
        <div className="lg:col-span-6 overflow-hidden rounded-2xl border border-slate-200 bg-[#F0F7FF] flex flex-col justify-between">
          <svg
            viewBox="0 0 120 74"
            className="h-48 w-full"
            aria-label="Live engineer route map"
          >
            <defs>
              <pattern id="trackgrid" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#CBD5E1" strokeWidth="0.35" />
              </pattern>
            </defs>
            <rect width="120" height="74" fill="url(#trackgrid)" />
            <path
              d="M 20 56 Q 55 44 68 34 T 98 22"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeDasharray="3.5 2.5"
            />
            {/* Engineer Marker */}
            <g transform="translate(36, 49)">
              <circle r="5.5" fill="#10B981" fillOpacity="0.22" />
              <circle r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
              <text x="6" y="1" fontSize="4" fill="#0F172A" fontWeight="700">
                {engineer?.name ?? 'Arjun Sen'}
              </text>
            </g>
            {/* Customer Pin */}
            <g transform="translate(98, 22)">
              <circle r="5" fill="#2563EB" fillOpacity="0.2" />
              <circle r="2.8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
              <text x="-20" y="-5" fontSize="3.8" fill="#0F172A" fontWeight="600">
                Your Location
              </text>
            </g>
          </svg>
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#10B981]">
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Arriving in {ticket.etaMinutes ?? 10} min
            </span>
            <span className="font-mono text-slate-500 tabular-nums">
              {ticket.distanceKm.toFixed(1)} km · {ticket.locationLabel}
            </span>
          </div>
        </div>

        {/* Assigned Technician Card & Privacy Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={engineer?.avatarUrl ?? ASSET_PATHS.engineerAvatar}
              alt={engineer?.name ?? 'Arjun Sen'}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  {engineer?.name ?? 'Arjun Sen'}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Fast Tech Certified
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A] tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {(engineer?.rating ?? 4.8).toFixed(1)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{(engineer?.specializations ?? ['MacBook', 'NoteBook']).join(' / ')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{ticket.id}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Shield className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>
                  Masked Contact: {maskPhoneNumber(engineer?.phone ?? '+91 98742 11044')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
            <span className="font-semibold text-[#0F172A]">{ticket.model}</span> (S/N{' '}
            <span className="font-mono">{ticket.serialNumber}</span>) — {ticket.subject}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              In-App Chat ({ticket.chatMessages.length})
            </button>
            <button
              type="button"
              onClick={() => setVoipActive(true)}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
            >
              <Phone className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              Masked VoIP Call
            </button>
          </div>
        </div>
      </div>

      {/* Privacy-Masked In-App Chat Drawer */}
      {chatOpen && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#0F172A]">
              Encrypted In-App Chat · Phone numbers hidden
            </p>
            <button
              type="button"
              aria-label="Close chat panel"
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-44 overflow-y-auto space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
            {ticket.chatMessages.length === 0 ? (
              <p className="text-xs text-slate-500">Send a message to your assigned engineer.</p>
            ) : (
              ticket.chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'customer' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-xl px-3 py-2 text-xs ${
                      msg.sender === 'customer'
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white border border-slate-200 text-[#0F172A]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {msg.sender === 'customer' ? 'You' : engineer?.name ?? 'Engineer'} · {msg.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendChat} className="mt-2.5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message engineer securely..."
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* Masked VoIP Call Overlay */}
      {voipActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Privacy-masked VoIP call"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-xs rounded-3xl bg-[#0F172A] p-6 text-center text-white shadow-2xl border border-slate-700">
            <img
              src={engineer?.avatarUrl ?? ASSET_PATHS.engineerAvatar}
              alt={engineer?.name ?? 'Arjun Sen'}
              referrerPolicy="no-referrer"
              className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-[#2563EB]"
            />
            <h4 className="mt-3 text-base font-bold">{engineer?.name ?? 'Arjun Sen'}</h4>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {maskPhoneNumber(engineer?.phone ?? '+91 98742 11044')}
            </p>
            <p className="mt-3 font-mono text-sm text-[#10B981] tabular-nums">
              VoIP Bridged · 00:{String(voipSec).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={() => setVoipActive(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#EF4444] px-6 py-3 text-xs font-semibold text-white hover:bg-red-600"
            >
              <PhoneOff className="h-4 w-4" aria-hidden="true" />
              End Masked Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
