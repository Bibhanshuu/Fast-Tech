import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  CreditCard,
  Crosshair,
  Landmark,
  MapPin,
  Mic,
  ShieldCheck,
  Smartphone,
  Square,
  Trash2,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import { ASSET_PATHS } from '../data/seedData';
import type {
  DeviceCategory,
  DiagnosticMediaItem,
  PaymentMethod,
} from '../types/fastTech';
import {
  calculateDistanceKm,
  calculateVisitationFee,
  formatINR,
  validateTicketForm,
} from '../utils/fastTechEngine';

const DEVICE_CATEGORIES: DeviceCategory[] = [
  'NoteBook',
  'MacBook',
  'Desktop',
  'Workstation',
  'Printer',
  'Mouse/Keyboard',
  'Preventative Cleaning',
];

const TIME_SLOTS_TODAY = [
  'Express (Within 45 mins)',
  '10:00 AM - 12:00 PM',
  '2:00 PM - 4:00 PM',
  '5:00 PM - 7:00 PM',
];

const TIME_SLOTS_TOMORROW = [
  '9:00 AM - 11:00 AM',
  '12:00 PM - 2:00 PM',
  '3:00 PM - 5:00 PM',
  '6:00 PM - 8:00 PM',
];

interface CustomerBookingModalProps {
  isOpen: boolean;
  initialCategory?: DeviceCategory;
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
}

export const CustomerBookingModal: React.FC<CustomerBookingModalProps> = ({
  isOpen,
  initialCategory = 'MacBook',
  onClose,
  onSuccess,
}) => {
  const { customerLocation, pricingConfig, createTicket } = useFastTech();

  const [category, setCategory] = useState<DeviceCategory>(initialCategory);
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [pinCoords, setPinCoords] = useState({ x: 40, y: 44 });
  const [locationLabel, setLocationLabel] = useState(customerLocation);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [slotDay, setSlotDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [slotTime, setSlotTime] = useState(TIME_SLOTS_TODAY[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [mediaItems, setMediaItems] = useState<DiagnosticMediaItem[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'details' | 'checkout'>('details');

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setLocationLabel(customerLocation);
      setStep('details');
      setErrors({});
    }
  }, [isOpen, initialCategory, customerLocation]);

  useEffect(() => {
    if (!isRecordingVoice) return;
    const timer = window.setInterval(() => {
      setRecordingSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecordingVoice]);

  if (!isOpen) return null;

  const distanceKm = calculateDistanceKm(pinCoords);
  const quote = calculateVisitationFee(distanceKm, pricingConfig, isUrgent);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setPinCoords({ x: Math.round(x), y: Math.round(y) });
    setGpsStatus(null);
  };

  const handleAutoDetectGps = () => {
    setGpsStatus('Detecting Kolkata GPS coordinates...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPinCoords({ x: 44, y: 46 });
          setLocationLabel('Park Street Area, Kolkata, WB, 700016');
          setGpsStatus('GPS locked (2.2 km from Fast Tech Hub)');
        },
        () => {
          setPinCoords({ x: 43, y: 45 });
          setLocationLabel('Kolkata, WB, 700001');
          setGpsStatus('Location resolved via network tower (2.6 km)');
        },
        { timeout: 2500 }
      );
    } else {
      setPinCoords({ x: 43, y: 45 });
      setGpsStatus('Location resolved via network (2.6 km)');
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      const dur = Math.max(3, recordingSec);
      setMediaItems((prev) => [
        ...prev,
        {
          id: `voice-${Date.now()}`,
          type: 'voice',
          name: `fault_voice_note_${dur}s.m4a`,
          durationSec: dur,
        },
      ]);
      setRecordingSec(0);
    } else {
      setRecordingSec(0);
      setIsRecordingVoice(true);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaType: 'image' | 'video'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = mediaType === 'image' ? URL.createObjectURL(file) : undefined;
    setMediaItems((prev) => [
      ...prev,
      {
        id: `${mediaType}-${Date.now()}`,
        type: mediaType,
        name: file.name,
        previewUrl,
        durationSec: mediaType === 'video' ? 14 : undefined,
      },
    ]);
    e.target.value = '';
  };

  const attachSampleDiagnostic = () => {
    setMediaItems((prev) => [
      ...prev,
      {
        id: `sample-${Date.now()}`,
        type: 'image',
        name: 'board_thermal_capture.jpg',
        previewUrl: ASSET_PATHS.productMobo,
      },
    ]);
  };

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTicketForm({
      serialNumber,
      model,
      subject,
      description,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setStep('checkout');
  };

  const handleConfirmBooking = () => {
    const validation = validateTicketForm({
      serialNumber,
      model,
      subject,
      description,
    });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStep('details');
      return;
    }
    const created = createTicket({
      category,
      serialNumber,
      model,
      subject,
      description,
      isUrgent,
      locationLabel,
      pinCoords,
      distanceKm,
      paymentMethod,
      slotDay,
      slotTime,
      diagnosticMedia: mediaItems,
    });
    onSuccess(created.id);
    onClose();
  };

  const slots = slotDay === 'Today' ? TIME_SLOTS_TODAY : TIME_SLOTS_TOMORROW;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm md:p-4"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl md:rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold text-[#0F172A]">
              {step === 'details'
                ? 'Book Certified Fast Tech Engineer'
                : 'Fast Tech Visitation Checkout'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'details'
                ? 'Provide device serial number, diagnostic media, and service pin'
                : 'Secured Razorpay-grade payment gateway · 100% inspection warranty'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close booking dialog"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'details' ? (
            <form id="ticket-details-form" onSubmit={handleProceedToCheckout} className="space-y-4">
              {/* Device & Serial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ticket-category"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Hardware Category
                  </label>
                  <select
                    id="ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    {DEVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ticket-serial"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Device Serial Number <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="ticket-serial"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g., C02Z9123LVDL"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.serialNumber
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/20'
                        : 'border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                    }`}
                  />
                  {errors.serialNumber && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">
                      {errors.serialNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="ticket-model"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Device Model <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="ticket-model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., MacBook Pro 14 M3"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.model
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/20'
                        : 'border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                    }`}
                  />
                  {errors.model && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">{errors.model}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="ticket-subject"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Issue Subject <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., No power / Display flicker"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.subject
                        ? 'border-[#EF4444] focus:ring-[#EF4444]/20'
                        : 'border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">{errors.subject}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="ticket-description"
                    className="block text-xs font-semibold text-[#0F172A]"
                  >
                    Detailed Symptom Description <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium text-slate-600">
                      Urgent Priority (+{formatINR(pricingConfig.urgentSurcharge)})
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isUrgent}
                      aria-label="Urgent priority dispatch"
                      onClick={() => setIsUrgent((v) => !v)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isUrgent ? 'bg-[#EF4444]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          isUrgent ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <textarea
                  id="ticket-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe beep codes, thermal shutdowns, liquid spills, or port failures..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-[#EF4444] focus:ring-[#EF4444]/20'
                      : 'border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs font-medium text-[#EF4444]">{errors.description}</p>
                )}
              </div>

              {/* Diagnostic Media Suite */}
              <div className="rounded-2xl border border-slate-200 bg-[#F0F7FF]/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">Diagnostic Media Suite</h3>
                    <p className="text-xs text-slate-500">
                      Attach a voice note, fault screenshot, or video clip for faster triage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={attachSampleDiagnostic}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    + Attach Sample Photo
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                      isRecordingVoice
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    {isRecordingVoice ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        Stop Recording (00:{String(recordingSec).padStart(2, '0')})
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                        Record Voice Note
                      </>
                    )}
                  </button>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors">
                    <Camera className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                    Fault Screenshot
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, 'image')}
                    />
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors">
                    <Video className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                    Video Clip
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, 'video')}
                    />
                  </label>
                </div>

                {mediaItems.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover shrink-0 border border-slate-100"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#2563EB] shrink-0">
                              {item.type === 'voice' ? (
                                <Mic className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Video className="h-4 w-4" aria-hidden="true" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-[#0F172A]">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 capitalize">
                              {item.type}
                              {item.durationSec ? ` · ${item.durationSec}s` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() =>
                            setMediaItems((prev) => prev.filter((m) => m.id !== item.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-[#EF4444]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Map Pin-Drop & Slot Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F172A]">
                      Drop Service Location Pin
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoDetectGps}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                      Auto-Detect GPS
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F0F7FF]">
                    <svg
                      viewBox="0 0 100 72"
                      onClick={handleMapClick}
                      data-testid="booking-map-canvas"
                      className="h-36 w-full cursor-crosshair select-none"
                      aria-label="Interactive service distance map. Click to drop pin."
                    >
                      <defs>
                        <pattern id="mapgrid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path
                            d="M 10 0 L 0 0 0 10"
                            fill="none"
                            stroke="#CBD5E1"
                            strokeWidth="0.35"
                          />
                        </pattern>
                      </defs>
                      <rect width="100" height="72" fill="url(#mapgrid)" />
                      {/* Hooghly river curve */}
                      <path
                        d="M 12 0 Q 20 32 14 72"
                        fill="none"
                        stroke="#93C5FD"
                        strokeWidth="4"
                        opacity="0.55"
                      />
                      {/* Tier 3, 2, 1 Geofence Rings centered around (50, 36) -> mapped hub at (50, 50) in distance fn */}
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="#2563EB"
                        fillOpacity="0.04"
                        stroke="#93C5FD"
                        strokeDasharray="2 2"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="28"
                        fill="#2563EB"
                        fillOpacity="0.06"
                        stroke="#60A5FA"
                        strokeDasharray="2 2"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="16"
                        fill="#10B981"
                        fillOpacity="0.08"
                        stroke="#10B981"
                        strokeWidth="0.5"
                      />

                      {/* Fast Tech Hub */}
                      <circle cx="50" cy="50" r="2.6" fill="#0F172A" />
                      <text x="53.5" y="51.2" fontSize="3.4" fill="#0F172A" fontWeight="600">
                        Fast Tech Hub
                      </text>

                      {/* Line from Hub to Pin */}
                      <line
                        x1="50"
                        y1="50"
                        x2={pinCoords.x}
                        y2={pinCoords.y * 0.72}
                        stroke="#2563EB"
                        strokeWidth="0.7"
                        strokeDasharray="1.5 1.5"
                      />

                      {/* Customer Dropped Pin */}
                      <g transform={`translate(${pinCoords.x}, ${pinCoords.y * 0.72})`}>
                        <circle r="4.2" fill="#2563EB" fillOpacity="0.22" />
                        <circle r="2.4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.8" />
                      </g>
                    </svg>
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 truncate">
                        <MapPin className="h-3.5 w-3.5 text-[#2563EB] shrink-0" aria-hidden="true" />
                        <span className="truncate">{locationLabel}</span>
                      </span>
                      <span className="font-mono font-semibold text-[#0F172A] tabular-nums shrink-0 ml-2">
                        {distanceKm.toFixed(1)} km
                      </span>
                    </div>
                  </div>
                  {gpsStatus && <p className="mt-1.5 text-[11px] text-[#10B981] font-medium">{gpsStatus}</p>}
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPinCoords({ x: 42, y: 44 })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Tier 1 (~2.5 km)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinCoords({ x: 74, y: 50 })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Tier 2 (~6.7 km)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinCoords({ x: 92, y: 65 })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Tier 3 (~12.5 km)
                    </button>
                  </div>
                </div>

                {/* Date & Time Slot + Live Pricing Summary */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-[#0F172A] mb-2">
                      Select Service Window
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 mb-3">
                      {(['Today', 'Tomorrow'] as const).map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSlotDay(day);
                            setSlotTime(
                              day === 'Today' ? TIME_SLOTS_TODAY[0] : TIME_SLOTS_TOMORROW[0]
                            );
                          }}
                          className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                            slotDay === day
                              ? 'bg-white text-[#0F172A] shadow-sm'
                              : 'text-slate-600 hover:text-[#0F172A]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSlotTime(slot)}
                          className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                            slotTime === slot
                              ? 'border-[#2563EB] bg-[#F0F7FF] text-[#2563EB] font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Visitation Pricing Engine */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Distance Bracket ({quote.tierLabel})</span>
                      <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                        {formatINR(quote.baseFee)}
                      </span>
                    </div>
                    {isUrgent && (
                      <div className="flex items-center justify-between text-xs text-[#EF4444]">
                        <span>Urgent Express Dispatch</span>
                        <span className="font-mono font-semibold tabular-nums">
                          +{formatINR(quote.urgentSurcharge)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-bold text-[#0F172A]">
                      <span>Visitation Fee</span>
                      <span data-testid="dynamic-visitation-fee" className="font-mono tabular-nums text-[#2563EB]">
                        {formatINR(quote.totalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Razorpay-style Checkout Step */
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-[#F0F7FF] p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {category} · {model} · S/N {serialNumber.toUpperCase()}
                  </p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">{subject}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {slotDay}, {slotTime} · {distanceKm.toFixed(1)} km ({quote.tierLabel})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Payable Visitation Fee</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#2563EB]">
                    {formatINR(quote.totalFee)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  Choose Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      {
                        id: 'UPI',
                        label: 'UPI Instant (GPay / PhonePe / Paytm)',
                        icon: Smartphone,
                      },
                      {
                        id: 'Card',
                        label: 'Credit / Debit Card',
                        icon: CreditCard,
                      },
                      {
                        id: 'NetBanking',
                        label: 'NetBanking (HDFC / ICICI / SBI)',
                        icon: Landmark,
                      },
                      {
                        id: 'Cash on Service',
                        label: 'Cash on Service (Pay Engineer)',
                        icon: Wallet,
                      },
                    ] as const
                  ).map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                          active
                            ? 'border-[#2563EB] bg-[#F0F7FF] shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            active ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#0F172A]">{method.id}</p>
                          <p className="text-xs text-slate-500 truncate">{method.label}</p>
                        </div>
                        {active && (
                          <CheckCircle2 className="h-5 w-5 text-[#2563EB] shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" aria-hidden="true" />
                <span>
                  Fast Tech Razorpay Escrow: Visitation fee covers doorstep diagnostics and is
                  adjusted against any approved hardware part replacement.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="ticket-details-form"
                className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Continue to Checkout ({formatINR(quote.totalFee)})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
              >
                {paymentMethod === 'Cash on Service'
                  ? `Confirm Booking (${formatINR(quote.totalFee)} Cash)`
                  : `Pay ${formatINR(quote.totalFee)} & Dispatch`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
