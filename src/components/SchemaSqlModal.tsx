import React, { useState } from 'react';
import { Check, Copy, Database, Download, X } from 'lucide-react';
import { FAST_TECH_SCHEMA_SQL } from '../data/fastTechSchemaSql';
import { useFastTech } from '../context/FastTechContext';

const SCHEMA_TABLES = [
  'users',
  'engineer_profiles',
  'service_tickets',
  'ticket_dispatch_logs',
  'products',
  'product_serial_units',
  'orders',
  'engineer_wallets',
  'financial_transactions',
];

export const SchemaSqlModal: React.FC = () => {
  const { schemaModalOpen, setSchemaModalOpen } = useFastTech();
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('All');

  if (!schemaModalOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FAST_TECH_SCHEMA_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([FAST_TECH_SCHEMA_SQL], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fast_tech_schema.sql';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const displayedSql =
    selectedTable === 'All'
      ? FAST_TECH_SCHEMA_SQL
      : FAST_TECH_SCHEMA_SQL.split('\n\n')
          .filter(
            (block) =>
              block.includes(`TABLE ${selectedTable}`) ||
              block.includes(`INTO ${selectedTable}`)
          )
          .join('\n\n');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4"
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#2563EB]">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="schema-modal-title" className="text-base font-bold text-[#0F172A]">
                fast_tech_schema.sql
              </h2>
              <p className="text-xs text-slate-500">
                Normalized PostgreSQL 15+ / MySQL 8+ DDL &amp; Seed Data (9 Tables)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              )}
              {copied ? 'Copied SQL' : 'Copy SQL'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download .sql
            </button>
            <button
              type="button"
              aria-label="Close SQL schema modal"
              onClick={() => setSchemaModalOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setSelectedTable('All')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedTable === 'All'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:bg-white hover:text-[#0F172A]'
            }`}
          >
            All 9 Tables + Seed
          </button>
          {SCHEMA_TABLES.map((tbl) => (
            <button
              key={tbl}
              type="button"
              onClick={() => setSelectedTable(tbl)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
                selectedTable === tbl
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-slate-600 hover:bg-white hover:text-[#0F172A]'
              }`}
            >
              {tbl}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto bg-[#0F172A] p-5">
          <pre className="font-mono text-xs leading-relaxed text-slate-100 whitespace-pre">
            {displayedSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
