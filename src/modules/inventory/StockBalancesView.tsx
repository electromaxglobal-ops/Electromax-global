import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Warehouse,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { StockBalance, Warehouse as WarehouseType, Product } from '../../types/erp.ts';
import { formatINR, formatIndianNumber, formatIST } from '../../utils/formatters.ts';

interface StockBalancesViewProps {
  balances: StockBalance[];
  warehouses: WarehouseType[];
  products: Product[];
  onAdjustStock: (warehouseId: number, productId: number, type: 'ADD' | 'SUBTRACT', qty: number, reason: string) => Promise<any>;
  preSelectedProduct?: Product | null;
}

export const StockBalancesView: React.FC<StockBalancesViewProps> = ({
  balances,
  warehouses,
  products,
  onAdjustStock,
  preSelectedProduct,
}) => {
  const [selectedWh, setSelectedWh] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ warehouseId: number; productId: number; name: string; uom: string; currentQty: number } | null>(null);

  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustQty, setAdjustQty] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('Physical stock audit reconciliation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const openAdjustModal = (b: StockBalance) => {
    setSelectedItem({
      warehouseId: b.warehouseId,
      productId: b.productId,
      name: b.product?.name || `Product #${b.productId}`,
      uom: b.product?.uom || 'PCS',
      currentQty: Number(b.quantity || 0),
    });
    setAdjustQty(10);
    setAdjustType('ADD');
    setShowAdjustModal(true);
  };

  const openCustomAdjust = () => {
    if (products.length === 0 || warehouses.length === 0) return;
    const p = preSelectedProduct || products[0];
    const wh = warehouses[0];
    const existing = balances.find(b => b.productId === p.id && b.warehouseId === wh.id);
    setSelectedItem({
      warehouseId: wh.id,
      productId: p.id,
      name: p.name,
      uom: p.uom,
      currentQty: Number(existing?.quantity || 0),
    });
    setAdjustQty(10);
    setAdjustType('ADD');
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await onAdjustStock(
        selectedItem.warehouseId,
        selectedItem.productId,
        adjustType,
        adjustQty,
        adjustReason
      );
      setShowAdjustModal(false);
      setNotification({
        type: 'success',
        message: `Success! Voucher #${res.voucherNo} posted. New stock balance: ${res.newQuantity} ${res.uom}`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Stock adjustment rejected',
      });
      setTimeout(() => setNotification(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBalances = balances.filter((b) => {
    const matchesWh = selectedWh === 'ALL' || String(b.warehouseId) === selectedWh;
    const matchesSearch =
      search === '' ||
      b.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.product?.code.toLowerCase().includes(search.toLowerCase());
    return matchesWh && matchesSearch;
  });

  const totalValuation = filteredBalances.reduce((sum, b) => sum + Number(b.totalValuation || 0), 0);

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Multi-Warehouse Stock Balances</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live stock levels with negative stock lock, warehouse bin allocations, and FIFO/weighted valuation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Total Valuation: {formatINR(totalValuation)}
            </div>
            <button
              onClick={openCustomAdjust}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Perform Audit Adjustment</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product code or name..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Warehouses ({warehouses.length})</option>
            {warehouses.map((w) => (
              <option key={w.id} value={String(w.id)}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Balances Table */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">SKU / Model</th>
                <th className="py-3 px-4">Appliance / Component Name</th>
                <th className="py-3 px-4 text-right">Physical Quantity</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-right">Weighted Avg Cost</th>
                <th className="py-3 px-4 text-right">Total Valuation</th>
                <th className="py-3 px-4">Last Audit Time</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredBalances.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {b.warehouse?.name || `Warehouse #${b.warehouseId}`}
                    </div>
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 px-1.5 py-0.2 rounded font-semibold">
                      {b.warehouse?.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                    {b.product?.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {b.product?.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Brand: {b.product?.brand} • {b.product?.itemType.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap text-sm">
                    {formatIndianNumber(b.quantity)} {b.product?.uom}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatIndianNumber(b.availableQuantity)} {b.product?.uom}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatINR(b.averageCost)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 dark:text-white whitespace-nowrap">
                    {formatINR(b.totalValuation)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatIST(b.lastUpdated)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => openAdjustModal(b)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-500 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Audit Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <span>Physical Stock Audit Adjustment</span>
              </h3>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1">
              <div className="text-slate-500">Selected Appliance / SKU:</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedItem.name}</div>
              <div className="text-slate-400">
                Current Recorded Balance: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.currentQty} {selectedItem.uom}</span>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Adjustment Action</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdjustType('ADD')}
                      className={`p-2 rounded-lg font-bold text-center border transition-all cursor-pointer ${
                        adjustType === 'ADD'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      + ADD (Inward)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('SUBTRACT')}
                      className={`p-2 rounded-lg font-bold text-center border transition-all cursor-pointer ${
                        adjustType === 'SUBTRACT'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      - DEDUCT (Write-off)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Adjustment Quantity ({selectedItem.uom})</label>
                  <input
                    type="number"
                    min="1"
                    max={adjustType === 'SUBTRACT' ? selectedItem.currentQty : 10000}
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-sm"
                    required
                  />
                  {adjustType === 'SUBTRACT' && adjustQty > selectedItem.currentQty && (
                    <span className="text-[10px] text-rose-500 font-bold block mt-1">
                      Cannot subtract more than available ({selectedItem.currentQty})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Auditor Reason / Narration</label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical inventory verification at VKI Bay 1"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-700 dark:text-orange-300">
                Notice: An immutable stock ledger voucher will be automatically generated and posted to Cloud SQL. Negative stock is strictly blocked.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (adjustType === 'SUBTRACT' && adjustQty > selectedItem.currentQty)}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting Voucher...' : 'Confirm & Post Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
