import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Settings,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import type { PricingConfig } from '../types/fastTech';
import { formatINR } from '../utils/fastTechEngine';

export const AdminPortal: React.FC = () => {
  const {
    users,
    toggleKycStatus,
    pricingConfig,
    updatePricingConfig,
    products,
    updateProductStock,
    toggleProductSerialTracking,
    transactions,
    applyPenaltyAndFreeze,
    settleCashViaUpi,
  } = useFastTech();

  const [pricingDraft, setPricingDraft] = useState<PricingConfig>(pricingConfig);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setPricingDraft(pricingConfig);
  }, [pricingConfig]);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig(pricingDraft);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  const engineers = users.filter((u) => u.role === 'engineer');

  return (
    <div className="space-y-6">
      {/* Top KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Registered Accounts</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {users.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Unmasked Super Admin View</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tier 1 Geofence Fee</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#2563EB]">
            {formatINR(pricingConfig.tier1Fee)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            0–{pricingConfig.tier1MaxKm} km · {pricingConfig.dispatchTimerSec}s timer
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Inventory SKUs</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
            {products.reduce((sum, p) => sum + p.stock, 0)} units
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {products.filter((p) => p.serialTracked).length} serial-tracked SKUs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Outstanding Cash Liability</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#EF4444]">
            {formatINR(engineers.reduce((sum, e) => sum + (e.cashInHand ?? 0), 0))}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {engineers.filter((e) => (e.overdueDays ?? 0) >= 3 && (e.cashInHand ?? 0) > 0).length}{' '}
            overdue &ge; 3 days
          </p>
        </div>
      </section>

      {/* 1. Command Center & Unmasked Directory */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Command Center &amp; Unmasked Directory
              </h2>
              <p className="text-xs text-slate-500">
                Full unmasked phone numbers, live availability, and KYC governance
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Name &amp; Role</th>
                <th className="py-2.5 pr-4 font-semibold">Unmasked Phone</th>
                <th className="py-2.5 pr-4 font-semibold">Hub / Location</th>
                <th className="py-2.5 pr-4 font-semibold">Availability</th>
                <th className="py-2.5 pr-4 font-semibold">KYC Status</th>
                <th className="py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-[#0F172A]">{user.name}</p>
                    <p className="text-[11px] text-slate-500">
                      <span className="capitalize">{user.role}</span> · {user.email}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                    {user.phone}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{user.location}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-semibold ${
                        user.availability === 'Online'
                          ? 'text-[#10B981]'
                          : user.availability === 'Frozen'
                          ? 'text-[#EF4444]'
                          : 'text-slate-500'
                      }`}
                    >
                      {user.availability ?? 'Active'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-semibold ${
                        user.kycStatus === 'Approved'
                          ? 'text-[#10B981]'
                          : user.kycStatus === 'Suspended'
                          ? 'text-[#EF4444]'
                          : 'text-amber-600'
                      }`}
                    >
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleKycStatus(user.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        user.kycStatus === 'Approved'
                          ? 'border border-red-200 bg-red-50 text-[#EF4444] hover:bg-red-100'
                          : 'bg-[#10B981] text-white hover:bg-emerald-600'
                      }`}
                    >
                      {user.kycStatus === 'Approved' ? 'Suspend' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Runtime Pricing & Geofence Configurator + 3. Inventory & Cash Penalty Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Runtime Pricing & Geofence Configurator */}
        <form
          onSubmit={handleSavePricing}
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Runtime Pricing &amp; Geofence Configurator
              </h2>
              <p className="text-xs text-slate-500">
                Changes propagate immediately to Customer Checkout &amp; Engineer Timer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="cfg-t1-km"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 1 Max Radius (km)
              </label>
              <input
                id="cfg-t1-km"
                type="number"
                min={1}
                value={pricingDraft.tier1MaxKm}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier1MaxKm: Number(e.target.value) || 1 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-t1-fee"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 1 Visitation Fee (₹)
              </label>
              <input
                id="cfg-t1-fee"
                type="number"
                min={50}
                step={10}
                value={pricingDraft.tier1Fee}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier1Fee: Number(e.target.value) || 0 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-t2-km"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 2 Max Radius (km)
              </label>
              <input
                id="cfg-t2-km"
                type="number"
                min={2}
                value={pricingDraft.tier2MaxKm}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier2MaxKm: Number(e.target.value) || 2 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-t2-fee"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 2 Visitation Fee (₹)
              </label>
              <input
                id="cfg-t2-fee"
                type="number"
                min={50}
                step={10}
                value={pricingDraft.tier2Fee}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier2Fee: Number(e.target.value) || 0 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-t3-km"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 3 Max Radius (km)
              </label>
              <input
                id="cfg-t3-km"
                type="number"
                min={5}
                value={pricingDraft.tier3MaxKm}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier3MaxKm: Number(e.target.value) || 5 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-t3-fee"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Tier 3 Visitation Fee (₹)
              </label>
              <input
                id="cfg-t3-fee"
                type="number"
                min={50}
                step={10}
                value={pricingDraft.tier3Fee}
                onChange={(e) =>
                  setPricingDraft((p) => ({ ...p, tier3Fee: Number(e.target.value) || 0 }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-timer"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Dispatch Timer (sec)
              </label>
              <input
                id="cfg-timer"
                type="number"
                min={15}
                max={180}
                value={pricingDraft.dispatchTimerSec}
                onChange={(e) =>
                  setPricingDraft((p) => ({
                    ...p,
                    dispatchTimerSec: Number(e.target.value) || 60,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="cfg-urgent"
                className="block text-xs font-semibold text-[#0F172A] mb-1"
              >
                Urgent Surcharge (₹)
              </label>
              <input
                id="cfg-urgent"
                type="number"
                min={0}
                step={25}
                value={pricingDraft.urgentSurcharge}
                onChange={(e) =>
                  setPricingDraft((p) => ({
                    ...p,
                    urgentSurcharge: Number(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {savedBanner ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Live rules synced across portals
              </span>
            ) : (
              <span className="text-xs text-slate-500">Applies immediately on save</span>
            )}
            <button
              type="submit"
              className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Apply Runtime Rules
            </button>
          </div>
        </form>

        {/* Cash Penalty Monitor & Store Inventory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cash Penalty Monitor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-[#EF4444]" aria-hidden="true" />
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Cash-in-Hand &amp; Penalty Monitor
                </h2>
                <p className="text-xs text-slate-500">
                  Enforce settlement SLAs on Cash-on-Service balances
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {engineers.map((eng) => {
                const isOverdue = (eng.overdueDays ?? 0) >= 3 && (eng.cashInHand ?? 0) > 0;
                return (
                  <div
                    key={eng.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">{eng.name}</span>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            Overdue ({eng.overdueDays}d)
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-slate-500 mt-0.5">
                        {eng.phone} · Status: {eng.availability}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold tabular-nums text-[#0F172A]">
                        {formatINR(eng.cashInHand ?? 0)}
                      </span>
                      {(eng.cashInHand ?? 0) > 0 && eng.availability !== 'Frozen' && (
                        <button
                          type="button"
                          onClick={() => applyPenaltyAndFreeze(eng.id)}
                          className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors whitespace-nowrap"
                        >
                          Apply Penalty &amp; Freeze
                        </button>
                      )}
                      {eng.availability === 'Frozen' && (
                        <button
                          type="button"
                          onClick={() => settleCashViaUpi(eng.id)}
                          className="rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors whitespace-nowrap"
                        >
                          Clear &amp; Unfreeze
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardware Store Stock & Serial Number Tracking */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Settings className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Hardware Store Stock &amp; Serial Tracking
                </h2>
                <p className="text-xs text-slate-500">
                  Manage live catalog quantities and per-unit serial tracking
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#0F172A] truncate">{prod.name}</p>
                    <p className="font-mono text-slate-500">
                      {prod.sku} · {formatINR(prod.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prod.serialTracked}
                      onClick={() => toggleProductSerialTracking(prod.id)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        prod.serialTracked
                          ? 'border-[#2563EB] bg-[#F0F7FF] text-[#2563EB]'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      Serial Tracking: {prod.serialTracked ? 'ON' : 'OFF'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Decrease stock for ${prod.name}`}
                        onClick={() => updateProductStock(prod.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold tabular-nums text-[#0F172A]">
                        {prod.stock}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase stock for ${prod.name}`}
                        onClick={() => updateProductStock(prod.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ledger */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0F172A] mb-3">
          Recent Financial Transactions Ledger
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-semibold">Tx ID</th>
                <th className="py-2 pr-4 font-semibold">Actor</th>
                <th className="py-2 pr-4 font-semibold">Type</th>
                <th className="py-2 pr-4 font-semibold">Method</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2.5 pr-4 font-mono font-semibold text-[#0F172A]">{tx.id}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{tx.actorName}</td>
                  <td className="py-2.5 pr-4 font-mono text-slate-500">{tx.type}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{tx.method}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`font-semibold ${
                        tx.status === 'Settled'
                          ? 'text-[#10B981]'
                          : tx.status === 'Overdue'
                          ? 'text-[#EF4444]'
                          : 'text-amber-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold tabular-nums text-[#0F172A]">
                    {formatINR(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
