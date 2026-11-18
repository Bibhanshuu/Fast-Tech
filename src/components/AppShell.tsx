import React, { useState } from 'react';
import {
  ClipboardList,
  Database,
  Home,
  Shield,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { useFastTech } from '../context/FastTechContext';
import type { PortalRole } from '../types/fastTech';
import { AdminPortal } from './AdminPortal';
import { BrandLogo } from './BrandLogo';
import { CustomerPortal, type CustomerTab } from './CustomerPortal';
import { EngineerPortal } from './EngineerPortal';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';
import { SchemaSqlModal } from './SchemaSqlModal';

const ROLE_OPTIONS: { id: PortalRole; label: string; shortLabel: string }[] = [
  { id: 'customer', label: 'Customer View', shortLabel: 'Customer' },
  { id: 'engineer', label: 'Service Engineer View', shortLabel: 'Engineer' },
  { id: 'admin', label: 'Super Admin Panel', shortLabel: 'Admin' },
];

export const AppShell: React.FC = () => {
  const { role, setRole, setSchemaModalOpen, tickets, cart } = useFastTech();
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');

  const activeTicketsCount = tickets.filter((t) => t.status !== 'Completed').length;
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#0F172A] flex flex-col md:flex-row">
      {/* Desktop Left Sidebar (>= 768px) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-30">
        <div className="flex h-16 items-center px-5 border-b border-slate-100">
          <BrandLogo size="md" />
        </div>

        <nav aria-label="Workspace navigation" className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
          {role === 'customer' && (
            <div className="space-y-1">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                Customer Portal
              </p>
              <button
                type="button"
                onClick={() => setCustomerTab('home')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  customerTab === 'home'
                    ? 'bg-[#F0F7FF] text-[#2563EB]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Home &amp; Discovery</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerTab('store')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  customerTab === 'store'
                    ? 'bg-[#F0F7FF] text-[#2563EB]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Hardware Store</span>
                </span>
                {cartCount > 0 && (
                  <span className="font-mono text-xs tabular-nums text-[#2563EB]">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCustomerTab('tickets')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  customerTab === 'tickets'
                    ? 'bg-[#F0F7FF] text-[#2563EB]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">My Tickets &amp; Help</span>
                </span>
                {activeTicketsCount > 0 && (
                  <span className="font-mono text-xs tabular-nums text-slate-500">
                    {activeTicketsCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {role === 'engineer' && (
            <div className="space-y-1">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                Engineer Portal
              </p>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl bg-[#F0F7FF] px-3 py-2.5 text-sm font-semibold text-[#2563EB]"
              >
                <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Dispatch &amp; Wallet</span>
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div className="space-y-1">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                Super Admin
              </p>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl bg-[#F0F7FF] px-3 py-2.5 text-sm font-semibold text-[#2563EB]"
              >
                <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Command Center</span>
              </button>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 space-y-1">
            <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
              Deliverables &amp; App
            </p>
            <button
              type="button"
              onClick={() => setSchemaModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
            >
              <Database className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
              <span className="truncate font-mono text-xs">fast_tech_schema.sql</span>
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4 flex flex-col gap-2">
          <PWAInstallButton />
          <p className="text-[11px] text-slate-400">Fast Tech Ecosystem PWA</p>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Bar with Persistent Role Switcher */}
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center md:hidden shrink-0">
            <BrandLogo size="sm" showText={false} />
          </div>

          <div
            role="tablist"
            aria-label="Fast Tech Portal Switcher"
            className="flex items-center gap-0.5 sm:gap-1 rounded-xl bg-slate-100 p-1 min-w-0"
          >
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRole(opt.id)}
                  className={`rounded-lg px-2 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSchemaModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Database className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
              <span className="hidden sm:inline">Schema SQL</span>
              <span className="sm:hidden">SQL</span>
            </button>
            <div className="md:hidden">
              <PWAInstallButton />
            </div>
          </div>
        </header>

        {/* Active Portal Viewport */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-8">
          {role === 'customer' && (
            <CustomerPortal activeTab={customerTab} setActiveTab={setCustomerTab} />
          )}
          {role === 'engineer' && <EngineerPortal />}
          {role === 'admin' && <AdminPortal />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center px-1"
      >
        <button
          type="button"
          onClick={() => {
            setRole('customer');
            setCustomerTab('home');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            role === 'customer' && customerTab === 'home'
              ? 'text-[#2563EB]'
              : 'text-slate-500'
          }`}
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole('customer');
            setCustomerTab('store');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            role === 'customer' && customerTab === 'store'
              ? 'text-[#2563EB]'
              : 'text-slate-500'
          }`}
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-semibold mt-0.5">Store</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole('customer');
            setCustomerTab('tickets');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            role === 'customer' && customerTab === 'tickets'
              ? 'text-[#2563EB]'
              : 'text-slate-500'
          }`}
        >
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-semibold mt-0.5">Tickets</span>
        </button>

        <button
          type="button"
          onClick={() => setSchemaModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] text-slate-500"
        >
          <Database className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-semibold mt-0.5">Schema</span>
        </button>
      </nav>

      <SchemaSqlModal />
      <OfflineIndicator />
    </div>
  );
};
