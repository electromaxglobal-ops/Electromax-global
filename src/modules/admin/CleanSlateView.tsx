import React, { useState } from 'react';
import {
  Sparkles,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Database,
  Building,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';

export const CleanSlateView: React.FC = () => {
  const [resetScope, setResetScope] = useState<'TRANSACTIONS_ONLY' | 'FULL_BLANK'>('TRANSACTIONS_ONLY');
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationText !== 'ELECTROMAX-RESET') {
      alert('Please type "ELECTROMAX-RESET" exactly to confirm.');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/clean-slate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetScope }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || 'ERP successfully prepared for clean onboarding.');
        setConfirmationText('');
      } else {
        alert(data.error || 'Failed to perform reset');
      }
    } catch (err: any) {
      alert('Error during reset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Sparkles className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Clean Blank ERP Option & Factory Onboarding
            </h1>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Prepare Electromax Global ERP for live factory rollout. Clear sample test transactions, mock orders, and dummy stock so your procurement and production teams can enter live physical opening balances.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex items-center gap-3 text-xs font-semibold shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mode Selection Form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-400" />
            Select Clean Slate Scope
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose whether to purge only transactional workflows or also reset stock balances to zero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setResetScope('TRANSACTIONS_ONLY')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              resetScope === 'TRANSACTIONS_ONLY'
                ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-orange-400 uppercase tracking-wide">
                1. Reset Transactions Only (Recommended)
              </span>
              <input
                type="radio"
                checked={resetScope === 'TRANSACTIONS_ONLY'}
                onChange={() => setResetScope('TRANSACTIONS_ONLY')}
                className="text-orange-500"
              />
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Clears all sample test Leads, Quotations, Proforma Invoices, Sales Orders, Work Orders, Purchase Orders, GRNs, Challans, and Dispatches.
            </p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">
              ✓ Keeps: Products, Color SKUs, Warehouses, Chart of Accounts, and Company Master under Mr. Sushil Goyal.
            </p>
          </div>

          <div
            onClick={() => setResetScope('FULL_BLANK')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              resetScope === 'FULL_BLANK'
                ? 'bg-rose-500/10 border-rose-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-400 uppercase tracking-wide">
                2. Full Factory Blank Canvas
              </span>
              <input
                type="radio"
                checked={resetScope === 'FULL_BLANK'}
                onChange={() => setResetScope('FULL_BLANK')}
                className="text-rose-500"
              />
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Purges all sample SKUs, stock balances, ledger entries, carton packing records, and all transactions.
            </p>
            <p className="text-[11px] text-amber-400 mt-2 font-medium">
              ✓ Leaves empty clean inventory tables ready for initial physical stock take & Excel CSV bulk inward.
            </p>
          </div>
        </div>

        {/* Security Confirmation */}
        <form onSubmit={handleExecuteReset} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Administrator Authorization Required</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                To prevent accidental wipes, please type <span className="font-mono text-orange-400 font-bold">ELECTROMAX-RESET</span> below and click execute.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="text"
              required
              placeholder="Type ELECTROMAX-RESET to confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || confirmationText !== 'ELECTROMAX-RESET'}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                confirmationText === 'ELECTROMAX-RESET'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              Execute Clean Slate Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
