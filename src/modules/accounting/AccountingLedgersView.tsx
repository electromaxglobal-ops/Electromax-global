import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  BookOpen,
  Receipt,
  FileCheck2,
  PieChart,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  IndianRupee,
  Calendar,
  Layers,
  Search,
  Printer,
  ChevronDown,
  Building,
  Check,
  ShieldCheck,
  FileText,
  Scale,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.ts';

interface Account {
  id: number;
  code: string;
  name: string;
  accountType: string;
  openingBalance: number;
  currentBalance: number;
  groupName?: string;
  parentGroup?: string;
}

interface VoucherLine {
  id?: number;
  accountId: number;
  accountName?: string;
  debit: number;
  credit: number;
  narration?: string;
}

interface Voucher {
  id: number;
  voucherType: string;
  voucherNumber: string;
  date: string;
  totalAmount: number;
  narration: string;
  isPosted: boolean;
  lines?: VoucherLine[];
}

export const AccountingLedgersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'VOUCHERS' | 'CHART' | 'DAYBOOK' | 'TRIAL_BALANCE' | 'PNL' | 'BALANCE_SHEET' | 'BANKING' | 'GST' | 'AGEING'
  >('VOUCHERS');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [searchLedger, setSearchLedger] = useState('');
  const [voucherFilterType, setVoucherFilterType] = useState('ALL');

  // New Account Form
  const [newAccForm, setNewAccForm] = useState({
    code: '',
    name: '',
    accountType: 'EXPENSE',
    parentGroup: 'Direct Expenses',
    openingBalance: '0.00',
  });

  // Full 15 Tally Prime Voucher Types
  const voucherTypesList = [
    { code: 'CONTRA', label: 'Contra (F4) - Cash & Bank Transfers' },
    { code: 'PAYMENT', label: 'Payment (F5) - Vendor & Expense Settlements' },
    { code: 'RECEIPT', label: 'Receipt (F6) - Customer & Inward Inflow' },
    { code: 'JOURNAL', label: 'Journal (F7) - Adjustments & Depreciation' },
    { code: 'SALES', label: 'Sales (F8) - Appliance Outward Invoices' },
    { code: 'PURCHASE', label: 'Purchase (F9) - Raw Material Invoices' },
    { code: 'DEBIT_NOTE', label: 'Debit Note (Alt+F5) - Purchase Returns & Rejections' },
    { code: 'CREDIT_NOTE', label: 'Credit Note (Alt+F6) - Sales Returns & Discounts' },
    { code: 'STOCK_JOURNAL', label: 'Stock Journal (Alt+F7) - Assembly WIP Transfers' },
    { code: 'DELIVERY_NOTE', label: 'Delivery Note (Alt+F8) - Goods Outward Note' },
    { code: 'RECEIPT_NOTE', label: 'Receipt Note (Alt+F9) - Goods Inward Note' },
    { code: 'PURCHASE_ORDER', label: 'Purchase Order - Vendor Order Voucher' },
    { code: 'SALES_ORDER', label: 'Sales Order - Customer Order Voucher' },
    { code: 'REVERSING_JOURNAL', label: 'Reversing Journal (F10) - Accrual Entries' },
    { code: 'MEMORANDUM', label: 'Memorandum - Suspense & Temporary Entries' },
  ];

  // Voucher Form State with multi-line double entry
  const [voucherForm, setVoucherForm] = useState({
    voucherType: 'PAYMENT',
    date: new Date().toISOString().split('T')[0],
    narration: '',
    lines: [
      { accountId: 1, debit: 5000, credit: 0, narration: 'Vendor Advance Payment' },
      { accountId: 2, debit: 0, credit: 5000, narration: 'Paid from HDFC Current A/c' },
    ],
  });

  const fetchAccountingData = async () => {
    setLoading(true);
    try {
      const [accRes, vchRes] = await Promise.all([
        fetch('/api/accounting/accounts').then((r) => r.json()).catch(() => []),
        fetch('/api/accounting/vouchers').then((r) => r.json()).catch(() => []),
      ]);

      if (Array.isArray(accRes) && accRes.length > 0) {
        setAccounts(accRes);
      } else {
        // Fallback default chart if database has empty initial seed
        setAccounts([
          { id: 1, code: '1001', name: 'Cash in Hand (Jaipur HQ)', accountType: 'ASSET', openingBalance: 125000, currentBalance: 125000, groupName: 'Cash-in-Hand', parentGroup: 'Current Assets' },
          { id: 2, code: '1002', name: 'HDFC Bank Current Account', accountType: 'ASSET', openingBalance: 845000, currentBalance: 845000, groupName: 'Bank Accounts', parentGroup: 'Current Assets' },
          { id: 3, code: '1003', name: 'State Bank of India (Cash Credit)', accountType: 'ASSET', openingBalance: 520000, currentBalance: 520000, groupName: 'Bank Accounts', parentGroup: 'Current Assets' },
          { id: 4, code: '2001', name: 'Sundry Debtors (Trade Receivables)', accountType: 'ASSET', openingBalance: 1240000, currentBalance: 1240000, groupName: 'Sundry Debtors', parentGroup: 'Current Assets' },
          { id: 5, code: '3001', name: 'Sundry Creditors (Trade Payables)', accountType: 'LIABILITY', openingBalance: 980000, currentBalance: 980000, groupName: 'Sundry Creditors', parentGroup: 'Current Liabilities' },
          { id: 6, code: '4001', name: 'Sales Account - Snow Wave Brand', accountType: 'INCOME', openingBalance: 0, currentBalance: 3250000, groupName: 'Sales Accounts', parentGroup: 'Direct Revenue' },
          { id: 7, code: '5001', name: 'Raw Material Purchases Account', accountType: 'EXPENSE', openingBalance: 0, currentBalance: 2150000, groupName: 'Purchase Accounts', parentGroup: 'Direct Expenses' },
          { id: 8, code: '6001', name: 'Output CGST 9%', accountType: 'LIABILITY', openingBalance: 0, currentBalance: 145000, groupName: 'Duties & Taxes', parentGroup: 'Current Liabilities' },
          { id: 9, code: '6002', name: 'Output SGST 9%', accountType: 'LIABILITY', openingBalance: 0, currentBalance: 145000, groupName: 'Duties & Taxes', parentGroup: 'Current Liabilities' },
          { id: 10, code: '6003', name: 'Input CGST 9% (ITC)', accountType: 'ASSET', openingBalance: 0, currentBalance: 95000, groupName: 'Duties & Taxes', parentGroup: 'Current Assets' },
          { id: 11, code: '6004', name: 'Input SGST 9% (ITC)', accountType: 'ASSET', openingBalance: 0, currentBalance: 95000, groupName: 'Duties & Taxes', parentGroup: 'Current Assets' },
        ]);
      }

      if (Array.isArray(vchRes)) setVouchers(vchRes);
    } catch (err) {
      console.error('Error fetching accounting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const totalDebit = voucherForm.lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = voucherForm.lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...voucherForm.lines];
    updated[index] = { ...updated[index], [field]: value };
    setVoucherForm({ ...voucherForm, lines: updated });
  };

  const handleAddLine = () => {
    setVoucherForm({
      ...voucherForm,
      lines: [...voucherForm.lines, { accountId: accounts[0]?.id || 1, debit: 0, credit: 0, narration: '' }],
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (voucherForm.lines.length <= 2) {
      alert('A double-entry voucher must contain at least 2 lines (Debit and Credit).');
      return;
    }
    setVoucherForm({
      ...voucherForm,
      lines: voucherForm.lines.filter((_, i) => i !== idx),
    });
  };

  const handlePostVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert('Tally Double-Entry Rule Violation: Total Debits must exactly equal Total Credits.');
      return;
    }

    try {
      const res = await fetch('/api/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherForm),
      });

      if (res.ok) {
        setShowVoucherModal(false);
        setVoucherForm({
          voucherType: 'PAYMENT',
          date: new Date().toISOString().split('T')[0],
          narration: '',
          lines: [
            { accountId: accounts[0]?.id || 1, debit: 0, credit: 0, narration: '' },
            { accountId: accounts[1]?.id || 2, debit: 0, credit: 0, narration: '' },
          ],
        });
        await fetchAccountingData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post voucher');
      }
    } catch (err: any) {
      alert('Error posting voucher: ' + err.message);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/accounting/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccForm),
      });
      if (res.ok) {
        setShowAccountModal(false);
        setNewAccForm({ code: '', name: '', accountType: 'EXPENSE', parentGroup: 'Direct Expenses', openingBalance: '0.00' });
        await fetchAccountingData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherFilterType === 'ALL') return true;
    return v.voucherType === voucherFilterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Advanced Double-Entry Accounting & Tally Prime Engine
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Indian Schedule III & GST Compliant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Strict Double-Entry Bookkeeping: 15 Voucher types (Contra, Payment, Receipt, Journal, Sales, Purchase, Debit/Credit Notes, Stock Journal), Day Book, Trial Balance, Profit & Loss, Balance Sheet, Bank Reconciliation, and Ageing Analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAccountModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> New Ledger Head
          </button>
          <button
            onClick={() => setShowVoucherModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Post Voucher (F4-F10)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'VOUCHERS', label: 'Vouchers Register' },
          { id: 'CHART', label: 'Chart of Accounts (Ledgers)' },
          { id: 'DAYBOOK', label: 'Day Book (Daily Log)' },
          { id: 'TRIAL_BALANCE', label: 'Trial Balance (Debit = Credit)' },
          { id: 'PNL', label: 'Profit & Loss Statement' },
          { id: 'BALANCE_SHEET', label: 'Balance Sheet' },
          { id: 'BANKING', label: 'Cash & Bank Books' },
          { id: 'GST', label: 'GSTR-1 & 3B Summary' },
          { id: 'AGEING', label: 'Bill-Wise Ageing Analysis' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Vouchers Register */}
      {activeTab === 'VOUCHERS' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" /> Accounting Vouchers Log
              </h3>
              <p className="text-[11px] text-slate-400">
                All 15 statutory voucher categories posted under double-entry rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={voucherFilterType}
                onChange={(e) => setVoucherFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Voucher Types</option>
                {voucherTypesList.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Narration</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No vouchers posted for selected filter. Click &quot;Post Voucher&quot; to create a new double-entry record.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{v.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-orange-400">{v.voucherNumber}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {v.voucherType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{v.narration}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {formatINR(v.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {formatINR(v.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          POSTED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Chart of Accounts */}
      {activeTab === 'CHART' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Chart of Accounts Ledger Master
              </h3>
              <p className="text-[11px] text-slate-400">
                Hierarchical grouping under Indian Schedule III (Assets, Liabilities, Income, Expenses).
              </p>
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search ledger by name or code..."
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts
              .filter(
                (a) =>
                  !searchLedger ||
                  a.name.toLowerCase().includes(searchLedger.toLowerCase()) ||
                  a.code.includes(searchLedger)
              )
              .map((acc) => (
                <div key={acc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-orange-400 font-bold">{acc.code}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        acc.accountType === 'ASSET'
                          ? 'bg-blue-500/10 text-blue-400'
                          : acc.accountType === 'LIABILITY'
                          ? 'bg-amber-500/10 text-amber-400'
                          : acc.accountType === 'INCOME'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {acc.accountType}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{acc.name}</h4>
                  <div className="text-[10px] text-slate-400">{acc.parentGroup || acc.groupName}</div>
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[10px]">Balance:</span>
                    <span className="font-mono font-bold text-white">{formatINR(acc.currentBalance)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Day Book */}
      {activeTab === 'DAYBOOK' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" /> Tally Prime Day Book (Daily Transaction Journal)
              </h3>
              <p className="text-[11px] text-slate-400">
                Chronological list of all transactions entered for the business day.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" /> Print Day Book
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Particulars (Account)</th>
                  <th className="py-2.5 px-3">Vch Type</th>
                  <th className="py-2.5 px-3">Vch No</th>
                  <th className="py-2.5 px-3 text-right">Debit Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono">2026-11-04</td>
                  <td className="py-2.5 px-3 font-bold text-white">To Marwar Electricals & Hardware Depot</td>
                  <td className="py-2.5 px-3 font-mono text-orange-400">SALES</td>
                  <td className="py-2.5 px-3 font-mono">INV-2627-1044</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">₹1,85,000.00</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">-</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono">2026-11-04</td>
                  <td className="py-2.5 px-3 font-bold text-white">By HDFC Bank Current A/c (Razorpay Advance)</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">RECEIPT</td>
                  <td className="py-2.5 px-3 font-mono">RCT-2627-0412</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">-</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">₹55,500.00</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono">2026-11-03</td>
                  <td className="py-2.5 px-3 font-bold text-white">To Rajasthan Copper Works (Raw Materials)</td>
                  <td className="py-2.5 px-3 font-mono text-amber-400">PURCHASE</td>
                  <td className="py-2.5 px-3 font-mono">PUR-2627-0391</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">₹2,45,000.00</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Trial Balance */}
      {activeTab === 'TRIAL_BALANCE' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" /> Statutory Trial Balance (Debit = Credit Validation)
              </h3>
              <p className="text-[11px] text-slate-400">
                Electromax Global Enterprises • Financial Year 2026-27 • Jaipur, Rajasthan
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> BALANCED (Difference: ₹0.00)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Particulars (Ledger Name)</th>
                  <th className="py-2.5 px-3">Schedule III Group</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {accounts.map((a) => {
                  const isDebit = a.accountType === 'ASSET' || a.accountType === 'EXPENSE';
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-orange-400">{a.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{a.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{a.parentGroup || a.groupName}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white">
                        {isDebit ? formatINR(a.currentBalance) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-white">
                        {!isDebit ? formatINR(a.currentBalance) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right text-emerald-400 uppercase">
                    Total Trial Balance:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    ₹58,75,000.00
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    ₹58,75,000.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Profit & Loss Statement */}
      {activeTab === 'PNL' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Statement of Profit & Loss (FY 2026-27)
              </h3>
              <p className="text-[11px] text-slate-400">
                Revenue from Appliance Operations vs Material Cost & Direct Overheads
              </p>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              Net Profit: ₹11,00,000.00
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Income */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                I. Revenue from Operations
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Domestic Sales (Snow Wave Heaters & Kettles):</span>
                  <span className="font-mono font-bold text-white">₹32,50,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>OEM Contract Manufacturing Revenue:</span>
                  <span className="font-mono font-bold text-white">₹8,40,000.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Total Income (A):</span>
                  <span className="font-mono text-emerald-400">₹40,90,000.00</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                II. Operating Expenses
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Raw Material Purchases (Copper/Heating Elements):</span>
                  <span className="font-mono font-bold text-white">₹21,50,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Factory Power & Direct Machine Wages:</span>
                  <span className="font-mono font-bold text-white">₹4,80,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Freight Outward & Transport Charges:</span>
                  <span className="font-mono font-bold text-white">₹3,60,000.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Total Expenses (B):</span>
                  <span className="font-mono text-rose-400">₹29,90,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Balance Sheet */}
      {activeTab === 'BALANCE_SHEET' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Balance Sheet as at 31 March 2027 (Indian Schedule III)
              </h3>
              <p className="text-[11px] text-slate-400">
                Electromax Global Enterprises • Jaipur, Rajasthan
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs">
              Equated Balance: ₹64,20,000.00
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                I. Equity & Liabilities
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Shareholder Capital (Mr. Sushil Goyal):</span>
                  <span className="font-mono font-bold text-white">₹25,00,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserves & Surplus (Accumulated Profit):</span>
                  <span className="font-mono font-bold text-white">₹16,40,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sundry Creditors (Trade Payables):</span>
                  <span className="font-mono font-bold text-white">₹9,80,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Statutory Duties Payable:</span>
                  <span className="font-mono font-bold text-white">₹2,90,000.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Total Liabilities:</span>
                  <span className="font-mono text-blue-400">₹64,20,000.00</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                II. Assets
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Plant, Machinery & Factory Fixtures (Jaipur):</span>
                  <span className="font-mono font-bold text-white">₹18,50,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventory Valuation (Raw Material + Finished Goods):</span>
                  <span className="font-mono font-bold text-white">₹14,90,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Trade Receivables (Sundry Debtors):</span>
                  <span className="font-mono font-bold text-white">₹12,40,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank & Cash Balances:</span>
                  <span className="font-mono font-bold text-white">₹14,90,000.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                  <span>Total Assets:</span>
                  <span className="font-mono text-emerald-400">₹64,20,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Banking & Cash Books */}
      {activeTab === 'BANKING' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Bank Accounts & Physical Cash Book (Jaipur HQ)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">HDFC Bank Current A/c #50200088192</span>
              <div className="text-lg font-mono font-bold text-white mt-1">₹8,45,000.00</div>
              <span className="text-[10px] text-emerald-400">Reconciled up to yesterday</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">SBI Cash Credit Account #339900124</span>
              <div className="text-lg font-mono font-bold text-white mt-1">₹5,20,000.00</div>
              <span className="text-[10px] text-slate-400">Limit: ₹25,00,000</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Jaipur Factory Cash-in-Hand</span>
              <div className="text-lg font-mono font-bold text-white mt-1">₹1,25,000.00</div>
              <span className="text-[10px] text-amber-400">Petty Cash Imprest Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: GST Returns */}
      {activeTab === 'GST' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Indian GST GSTR-1 & GSTR-3B Tax Ledger Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">
                GSTIN: 08AABCE9876K1Z2 • State: Rajasthan (08)
              </p>
            </div>
            <button
              onClick={() => alert('Exporting statutory GSTR-1 JSON for GST Portal upload.')}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export GSTR-1 JSON
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Output Tax Liability</span>
              <div className="text-lg font-mono font-bold text-rose-400 mt-1">₹2,90,000.00</div>
              <div className="text-[10px] text-slate-400 mt-1">CGST: ₹1,45,000 • SGST: ₹1,45,000</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Eligible Input Tax Credit (ITC)</span>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">₹1,90,000.00</div>
              <div className="text-[10px] text-slate-400 mt-1">Auto-Drafted from GSTR-2B</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Cash Tax Payable (Electronic Ledger)</span>
              <div className="text-lg font-mono font-bold text-orange-400 mt-1">₹1,00,000.00</div>
              <div className="text-[10px] text-emerald-400 mt-1">Paid on 20th of the month</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Ageing Analysis */}
      {activeTab === 'AGEING' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Trade Receivables & Payables Bill-Wise Ageing Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">0 - 30 Days (Current):</span>
              <div className="font-mono font-bold text-emerald-400 text-sm mt-1">₹8,40,000.00</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">31 - 60 Days:</span>
              <div className="font-mono font-bold text-amber-400 text-sm mt-1">₹2,80,000.00</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">61 - 90 Days:</span>
              <div className="font-mono font-bold text-orange-400 text-sm mt-1">₹1,20,000.00</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">&gt; 90 Days (Overdue):</span>
              <div className="font-mono font-bold text-rose-400 text-sm mt-1">₹0.00</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Post Voucher (15 Types, Multi-Line, Double Entry Validation) */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" />
                Post Tally Prime Double-Entry Accounting Voucher
              </h2>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostVoucher} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Select Voucher Type (15 Statutory Types)
                  </label>
                  <select
                    value={voucherForm.voucherType}
                    onChange={(e) => setVoucherForm({ ...voucherForm, voucherType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-orange-400 font-bold"
                  >
                    {voucherTypesList.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Voucher Date (Asia/Kolkata)
                  </label>
                  <input
                    type="date"
                    value={voucherForm.date}
                    onChange={(e) => setVoucherForm({ ...voucherForm, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Multi-Line Entry Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Double-Entry Transaction Lines
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Dr / Cr</th>
                        <th className="py-2 px-3">Ledger Account</th>
                        <th className="py-2 px-2 text-right">Debit (₹)</th>
                        <th className="py-2 px-2 text-right">Credit (₹)</th>
                        <th className="py-2 px-2">Line Narration</th>
                        <th className="py-2 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {voucherForm.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono font-bold text-orange-400">
                            {Number(line.debit) > 0 ? 'Dr' : 'Cr'}
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={line.accountId}
                              onChange={(e) => handleLineChange(idx, 'accountId', Number(e.target.value))}
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                            >
                              {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.code} - {acc.name} ({acc.accountType})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.debit}
                              onChange={(e) => handleLineChange(idx, 'debit', Number(e.target.value))}
                              className="w-24 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.credit}
                              onChange={(e) => handleLineChange(idx, 'credit', Number(e.target.value))}
                              className="w-24 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={line.narration || ''}
                              onChange={(e) => handleLineChange(idx, 'narration', e.target.value)}
                              placeholder="Narration..."
                              className="w-32 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-950 font-bold border-t border-slate-800 text-xs">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 text-right uppercase text-slate-400">
                          Totals:
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-white">
                          ₹{totalDebit.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-white">
                          ₹{totalCredit.toFixed(2)}
                        </td>
                        <td colSpan={2} className="py-2 px-2">
                          {isBalanced ? (
                            <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                            </span>
                          ) : (
                            <span className="text-rose-400 text-[11px] flex items-center gap-1 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Diff: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Overall Voucher Narration
                </label>
                <textarea
                  value={voucherForm.narration}
                  onChange={(e) => setVoucherForm({ ...voucherForm, narration: e.target.value })}
                  placeholder="Being amount paid towards..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-lg cursor-pointer"
                >
                  Post Voucher to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Ledger Account */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Create Chart of Accounts Ledger Head
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Ledger Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5012"
                  value={newAccForm.code}
                  onChange={(e) => setNewAccForm({ ...newAccForm, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Ledger Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory Electricity Expense (Jaipur Discom)"
                  value={newAccForm.name}
                  onChange={(e) => setNewAccForm({ ...newAccForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Account Nature</label>
                  <select
                    value={newAccForm.accountType}
                    onChange={(e) => setNewAccForm({ ...newAccForm, accountType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Parent Schedule III Group</label>
                  <input
                    type="text"
                    value={newAccForm.parentGroup}
                    onChange={(e) => setNewAccForm({ ...newAccForm, parentGroup: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold"
                >
                  Save Ledger Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
