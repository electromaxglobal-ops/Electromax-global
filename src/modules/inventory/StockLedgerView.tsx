import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ShieldCheck,
  Building,
  Boxes,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StockLedgerEntry, Warehouse as WarehouseType } from '../../types/erp.ts';
import { formatINR, formatIndianNumber, formatIST } from '../../utils/formatters.ts';

interface StockLedgerViewProps {
  ledger: StockLedgerEntry[];
  warehouses: WarehouseType[];
  onRefreshLedger?: () => void;
}

export const StockLedgerView: React.FC<StockLedgerViewProps> = ({
  ledger,
  warehouses,
  onRefreshLedger,
}) => {
  const [search, setSearch] = useState('');
  const [selectedVoucherType, setSelectedVoucherType] = useState('ALL');
  const [selectedMovement, setSelectedMovement] = useState('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');

  // Reversal Modal
  const [selectedEntryToReverse, setSelectedEntryToReverse] = useState<StockLedgerEntry | null>(null);
  const [reversalReason, setReversalReason] = useState('Physical count discrepancy correction approved by Plant Head');
  const [reversalAuthBy, setReversalAuthBy] = useState('Mr. Sushil Goyal');
  const [isReversing, setIsReversing] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 17 Standard Movement Types
  const all17MovementTypes = [
    { code: 'ALL', label: 'All 17 Movement Types' },
    { code: 'GRN', label: 'Purchase Inward (GRN)' },
    { code: 'SALES_DISPATCH', label: 'Sales Dispatch Outward' },
    { code: 'DISPATCH', label: 'Consignment Dispatch' },
    { code: 'MATERIAL_ISSUE', label: 'Production Issue (WIP Floor)' },
    { code: 'PROD_RECEIPT', label: 'Production Receipt (Finished Goods)' },
    { code: 'TRANSFER_IN', label: 'Inter-Warehouse Transfer In' },
    { code: 'TRANSFER_OUT', label: 'Inter-Warehouse Transfer Out' },
    { code: 'STOCK_TRANSFER', label: 'Plant Stock Transfer' },
    { code: 'SALES_RETURN', label: 'Sales Return (Customer RMA)' },
    { code: 'PURCHASE_RETURN', label: 'Purchase Return (Supplier Rejection)' },
    { code: 'STOCK_ADJUSTMENT', label: 'Stock Adjustment (Physical Audit)' },
    { code: 'REJECTION_OUT', label: 'QC Rejection Out' },
    { code: 'SCRAP_OUT', label: 'Assembly Scrap Write-off' },
    { code: 'JOB_WORK_OUT', label: 'Job Work Subcontract Out' },
    { code: 'JOB_WORK_IN', label: 'Job Work Processed In' },
    { code: 'SAMPLE_OUT', label: 'Dealer Marketing Sample Out' },
    { code: 'WARRANTY_OUT', label: 'Warranty Replacement Dispatch' },
    { code: 'OPENING_BALANCE', label: 'Initial Opening Balance' },
  ];

  const filtered = ledger.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.referenceDoc && item.referenceDoc.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedVoucherType === 'ALL' || item.voucherType === selectedVoucherType;
    const matchesMov = selectedMovement === 'ALL' || item.movementType === selectedMovement;
    const matchesWh = selectedWarehouse === 'ALL' || String(item.warehouseId) === selectedWarehouse;

    return matchesSearch && matchesType && matchesMov && matchesWh;
  });

  const totalLedgerValue = filtered.reduce((acc, it) => acc + (Number(it.totalValue) || 0), 0);

  const handleReverseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryToReverse) return;
    setIsReversing(true);
    setActionMsg(null);

    try {
      const res = await fetch('/api/stock/ledger/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledgerId: selectedEntryToReverse.id,
          reason: reversalReason,
          authorizedBy: reversalAuthBy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post reversal entry');
      }

      setActionMsg({
        type: 'success',
        text: `Reversal entry posted successfully! New voucher #${data.reversalVoucherNo} recorded in immutable ledger.`,
      });
      setSelectedEntryToReverse(null);
      if (onRefreshLedger) onRefreshLedger();
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setIsReversing(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Voucher Date',
      'Voucher No',
      'Type',
      'Movement',
      'Product Code',
      'Product Name',
      'Warehouse',
      'Quantity',
      'Unit Cost',
      'Total Value',
      'Balance After',
      'Reference',
    ];
    const rows = filtered.map((l) => [
      l.createdAt,
      l.voucherNo,
      l.voucherType,
      l.movementType,
      l.product?.code || '',
      `"${l.product?.name || ''}"`,
      `"${l.warehouse?.name || ''}"`,
      l.quantity,
      l.unitCost,
      l.totalValue,
      l.balanceAfter,
      `"${l.referenceDoc || l.narration || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Electromax_Stock_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {actionMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-orange-500" />
              <span>Immutable Stock Movement Ledger (Audit-Proof)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cardinal Principle: Append-only double-entry perpetual inventory journal. No direct edit or deletion allowed. Reversals must be authorized by <strong>Mr. Sushil Goyal</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Immutable Log
            </span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar with all 17 movement types */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search voucher, SKU, or batch..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <select
              value={selectedVoucherType}
              onChange={(e) => setSelectedVoucherType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {all17MovementTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMovement}
              onChange={(e) => setSelectedMovement(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Directions (IN & OUT)</option>
              <option value="IN">Inward Inflow (IN)</option>
              <option value="OUT">Outward Inflow (OUT)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Warehouses / Depots</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Voucher Type</th>
                <th className="py-3 px-4">Product / Appliance</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4 text-center">Movement</th>
                <th className="py-3 px-4 text-right">Transacted Qty</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Reference / Audit Note</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No stock ledger transactions found for selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatIST(l.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {l.voucherNo}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {l.voucherType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {l.product?.name || `Product #${l.productId}`}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{l.product?.code}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {l.warehouse?.name || `WH #${l.warehouseId}`}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          l.movementType === 'IN'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {l.movementType === 'IN' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {l.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {formatIndianNumber(l.quantity)} {l.product?.uom || 'PCS'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      {formatINR(l.totalValue)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                      {formatIndianNumber(l.balanceAfter)} {l.product?.uom || 'PCS'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                      {l.referenceDoc || l.narration || '-'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEntryToReverse(l)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-orange-500 hover:text-orange-600 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Post an offsetting reversal entry"
                      >
                        <RotateCcw className="w-3 h-3" /> Reverse Entry
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Reverse Stock Movement Entry */}
      {selectedEntryToReverse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-500" />
                Post Accounting Reversal Entry (Stock Movement)
              </h3>
              <button
                onClick={() => setSelectedEntryToReverse(null)}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReverseEntry} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div>
                  <span className="text-slate-400 text-[10px]">Target Voucher to Reverse: </span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {selectedEntryToReverse.voucherNo} ({selectedEntryToReverse.voucherType})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Product & Quantity: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedEntryToReverse.product?.name || selectedEntryToReverse.productId} • {selectedEntryToReverse.quantity} {selectedEntryToReverse.product?.uom || 'PCS'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Offsetting Direction: </span>
                  <strong className={selectedEntryToReverse.movementType === 'IN' ? 'text-rose-500' : 'text-emerald-500'}>
                    Will post an offsetting {selectedEntryToReverse.movementType === 'IN' ? 'OUTWARD (Deduction)' : 'INWARD (Addition)'} entry.
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Statutory Reversal Reason (Mandatory Audit Trail)
                </label>
                <textarea
                  required
                  rows={2}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Physical count discrepancy found during audit..."
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Authorized By</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={reversalAuthBy}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-orange-500 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEntryToReverse(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReversing}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold cursor-pointer"
                >
                  {isReversing ? 'Posting Reversal...' : 'Authorize & Post Offset Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
