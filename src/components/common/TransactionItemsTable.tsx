import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Package,
  Layers,
  Percent,
  Calculator,
  ArrowRight,
  Info,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';
import { AdvancedProductSelectionModal, SelectedItemPayload } from './AdvancedProductSelectionModal.tsx';

export interface TransactionLineItem {
  id: string;
  productId?: number;
  productName: string;
  modelCode: string;
  colorName?: string;
  skuCode?: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxableAmount: number;
  gstRate: number; // e.g. 18
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
  remarks?: string;
  imageUrl?: string;
}

export interface FinancialSummary {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  isInterState: boolean; // true = IGST, false = CGST + SGST
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  freightCharges: number;
  packagingCharges: number;
  roundOff: number;
  grandTotal: number;
  advancePercentage: number; // default 30%
  advanceAmount: number;
  balanceAmount: number;
}

interface TransactionItemsTableProps {
  items: TransactionLineItem[];
  onChangeItems: (items: TransactionLineItem[]) => void;
  summary: FinancialSummary;
  onChangeSummary: (summary: FinancialSummary) => void;
  priceType?: 'SALE' | 'PURCHASE';
  documentType?: 'QUOTATION' | 'PROFORMA' | 'SALES_ORDER' | 'PURCHASE_ORDER' | 'GRN' | 'DISPATCH' | 'CHALLAN';
  readOnly?: boolean;
}

export const TransactionItemsTable: React.FC<TransactionItemsTableProps> = ({
  items,
  onChangeItems,
  summary,
  onChangeSummary,
  priceType = 'SALE',
  documentType = 'QUOTATION',
  readOnly = false,
}) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Recalculate financial breakdown for items and summary
  const recalculateAll = (newItems: TransactionLineItem[], isInterState = summary.isInterState, freight = summary.freightCharges, packaging = summary.packagingCharges, advPct = summary.advancePercentage) => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableTotal = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;

    const updatedItems = newItems.map((item) => {
      const gross = (item.quantity || 0) * (item.rate || 0);
      const discount = (gross * (item.discountPercent || 0)) / 100;
      const taxable = Math.max(0, gross - discount);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInterState) {
        igst = (taxable * (item.gstRate || 0)) / 100;
      } else {
        cgst = (taxable * ((item.gstRate || 0) / 2)) / 100;
        sgst = (taxable * ((item.gstRate || 0) / 2)) / 100;
      }

      const totalTax = isInterState ? igst : cgst + sgst;
      const lineTotal = taxable + totalTax;

      subtotal += gross;
      totalDiscount += discount;
      taxableTotal += taxable;
      cgstSum += cgst;
      sgstSum += sgst;
      igstSum += igst;

      return {
        ...item,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        lineTotal: lineTotal,
      };
    });

    const netTaxTotal = isInterState ? igstSum : cgstSum + sgstSum;
    const rawTotal = taxableTotal + netTaxTotal + (freight || 0) + (packaging || 0);
    const grandTotal = Math.round(rawTotal);
    const roundOff = Number((grandTotal - rawTotal).toFixed(2));
    const advanceAmount = Math.round((grandTotal * (advPct || 30)) / 100);
    const balanceAmount = grandTotal - advanceAmount;

    onChangeItems(updatedItems);
    onChangeSummary({
      ...summary,
      subtotal,
      totalDiscount,
      taxableAmount: taxableTotal,
      isInterState,
      cgstTotal: cgstSum,
      sgstTotal: sgstSum,
      igstTotal: igstSum,
      freightCharges: freight,
      packagingCharges: packaging,
      roundOff,
      grandTotal,
      advancePercentage: advPct,
      advanceAmount,
      balanceAmount,
    });
  };

  const handleAddProductFromCatalog = (selected: SelectedItemPayload) => {
    const newItem: TransactionLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: selected.productId,
      productName: selected.productName,
      modelCode: selected.modelCode,
      colorName: selected.colorName,
      skuCode: selected.skuCode,
      hsnCode: selected.hsnCode || '8516',
      quantity: selected.quantity || 1,
      unit: selected.unit || 'PCS',
      rate: selected.rate || 0,
      discountPercent: 0,
      taxableAmount: (selected.quantity || 1) * (selected.rate || 0),
      gstRate: selected.gstRate || 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      lineTotal: 0,
      imageUrl: selected.imageUrl,
    };

    recalculateAll([...items, newItem]);
  };

  const handleAddBlankLine = () => {
    const newItem: TransactionLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productName: '',
      modelCode: '',
      colorName: 'Standard',
      skuCode: '',
      hsnCode: '8516',
      quantity: 1,
      unit: 'PCS',
      rate: 0,
      discountPercent: 0,
      taxableAmount: 0,
      gstRate: 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      lineTotal: 0,
    };
    recalculateAll([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof TransactionLineItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    recalculateAll(updated);
  };

  const handleDuplicateItem = (itemToDup: TransactionLineItem) => {
    const duplicated: TransactionLineItem = {
      ...itemToDup,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    recalculateAll([...items, duplicated]);
  };

  const handleRemoveItem = (id: string) => {
    const remaining = items.filter((item) => item.id !== id);
    recalculateAll(remaining);
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-white tracking-wide">
            Line Items & Pricing ({items.length} {items.length === 1 ? 'Product' : 'Products'})
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {documentType.replace('_', ' ')}
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4" />
              + Add from Catalog
            </button>
            <button
              type="button"
              onClick={handleAddBlankLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Custom Row
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 min-w-[220px]">Product / Model / Description</th>
              <th className="py-3 px-3 w-28">Color / SKU</th>
              <th className="py-3 px-3 w-20">HSN</th>
              <th className="py-3 px-3 w-24">Qty & Unit</th>
              <th className="py-3 px-3 w-28 text-right">Unit Rate (₹)</th>
              <th className="py-3 px-3 w-20 text-right">Disc %</th>
              <th className="py-3 px-3 w-28 text-right">Taxable (₹)</th>
              <th className="py-3 px-3 w-20 text-center">GST %</th>
              <th className="py-3 px-3 w-28 text-right">
                {summary.isInterState ? 'IGST (₹)' : 'CGST+SGST'}
              </th>
              <th className="py-3 px-3 w-32 text-right">Line Total (₹)</th>
              {!readOnly && <th className="py-3 px-3 w-16 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {items.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 11 : 12} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Package className="w-10 h-10 text-slate-600 stroke-1" />
                    <p className="text-sm font-medium text-slate-400">No items added to this document yet</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Click "+ Add from Catalog" to select Room Heaters, Electric Kettles, Pedestal/Table Fans or Mosquito Bats.
                    </p>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium text-xs border border-amber-500/40 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Select Products Now
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const totalTax = summary.isInterState ? item.igstAmount : item.cgstAmount + item.sgstAmount;

                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                      {index + 1}
                    </td>

                    {/* Product / Model */}
                    <td className="py-2.5 px-3">
                      {readOnly ? (
                        <div>
                          <div className="font-semibold text-white">{item.productName || 'Custom Item'}</div>
                          {item.modelCode && <div className="text-[11px] text-amber-400 font-mono">{item.modelCode}</div>}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.productName}
                            placeholder="Product Name / Model"
                            onChange={(e) => handleUpdateItem(item.id, 'productName', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={item.modelCode || ''}
                            placeholder="Model No."
                            onChange={(e) => handleUpdateItem(item.id, 'modelCode', e.target.value)}
                            className="w-full bg-slate-900/70 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}
                    </td>

                    {/* Color / SKU */}
                    <td className="py-2.5 px-3">
                      {readOnly ? (
                        <div>
                          <div className="text-slate-300">{item.colorName || '-'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.skuCode || ''}</div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.colorName || ''}
                          placeholder="Color"
                          onChange={(e) => handleUpdateItem(item.id, 'colorName', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      )}
                    </td>

                    {/* HSN */}
                    <td className="py-2.5 px-3">
                      {readOnly ? (
                        <span className="font-mono text-slate-400">{item.hsnCode}</span>
                      ) : (
                        <input
                          type="text"
                          value={item.hsnCode || ''}
                          placeholder="8516"
                          onChange={(e) => handleUpdateItem(item.id, 'hsnCode', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 text-center"
                        />
                      )}
                    </td>

                    {/* Qty & Unit */}
                    <td className="py-2.5 px-3">
                      {readOnly ? (
                        <span className="font-semibold text-white">
                          {item.quantity} <span className="text-slate-400 text-[10px]">{item.unit}</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseFloat(e.target.value) || 0))}
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 text-right"
                          />
                          <select
                            value={item.unit || 'PCS'}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[11px] text-slate-400 focus:outline-none"
                          >
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                            <option value="CTN">CTN</option>
                            <option value="SET">SET</option>
                            <option value="KG">KG</option>
                            <option value="MTR">MTR</option>
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Unit Rate */}
                    <td className="py-2.5 px-3 text-right">
                      {readOnly ? (
                        <span className="font-mono text-slate-200">{formatINR(item.rate)}</span>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-amber-500"
                        />
                      )}
                    </td>

                    {/* Discount % */}
                    <td className="py-2.5 px-3 text-right">
                      {readOnly ? (
                        <span className="text-slate-400">{item.discountPercent}%</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleUpdateItem(item.id, 'discountPercent', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                          className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-300 text-right focus:outline-none focus:border-amber-500"
                        />
                      )}
                    </td>

                    {/* Taxable Amount */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatINR(item.taxableAmount)}
                    </td>

                    {/* GST % */}
                    <td className="py-2.5 px-3 text-center">
                      {readOnly ? (
                        <span className="text-slate-300 font-semibold">{item.gstRate}%</span>
                      ) : (
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleUpdateItem(item.id, 'gstRate', parseFloat(e.target.value) || 0)}
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs font-medium text-amber-400 focus:outline-none"
                        >
                          <option value="18">18%</option>
                          <option value="12">12%</option>
                          <option value="28">28%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                        </select>
                      )}
                    </td>

                    {/* Tax Amount */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      <div>{formatINR(totalTax)}</div>
                      {!summary.isInterState && item.gstRate > 0 && (
                        <div className="text-[10px] text-slate-500">
                          C: {formatINR(item.cgstAmount)} | S: {formatINR(item.sgstAmount)}
                        </div>
                      )}
                    </td>

                    {/* Line Total */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatINR(item.lineTotal)}
                    </td>

                    {/* Actions */}
                    {!readOnly && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Duplicate Row"
                            onClick={() => handleDuplicateItem(item)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Row"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Financial Summary & Advance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Left Column: Tax Mode, Freight & Logistics */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-500" />
              Tax Regime & Logistics Charges
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Inter-State (IGST):</label>
              <input
                type="checkbox"
                checked={summary.isInterState}
                disabled={readOnly}
                onChange={(e) => recalculateAll(items, e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Freight / Transport (₹)</label>
              <input
                type="number"
                min="0"
                value={summary.freightCharges || 0}
                disabled={readOnly}
                onChange={(e) => recalculateAll(items, summary.isInterState, Math.max(0, parseFloat(e.target.value) || 0), summary.packagingCharges)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Packaging / Handling (₹)</label>
              <input
                type="number"
                min="0"
                value={summary.packagingCharges || 0}
                disabled={readOnly}
                onChange={(e) => recalculateAll(items, summary.isInterState, summary.freightCharges, Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Standard Indian Manufacturing Term:</span> 30% advance on order confirmation, balance 70% against delivery / dispatch through bank or LR copy.
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Advance Breakup */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between py-1 text-slate-400">
            <span>Gross Total:</span>
            <span className="font-mono text-white">{formatINR(summary.subtotal)}</span>
          </div>

          {summary.totalDiscount > 0 && (
            <div className="flex justify-between py-1 text-emerald-400">
              <span>Total Discount:</span>
              <span className="font-mono">- {formatINR(summary.totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 text-slate-300 font-semibold border-t border-slate-800 pt-1.5">
            <span>Taxable Value:</span>
            <span className="font-mono text-white">{formatINR(summary.taxableAmount)}</span>
          </div>

          {summary.isInterState ? (
            <div className="flex justify-between py-1 text-slate-400">
              <span>IGST Total:</span>
              <span className="font-mono text-amber-400">{formatINR(summary.igstTotal)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-1 text-slate-400">
                <span>CGST Total:</span>
                <span className="font-mono text-amber-400">{formatINR(summary.cgstTotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>SGST Total:</span>
                <span className="font-mono text-amber-400">{formatINR(summary.sgstTotal)}</span>
              </div>
            </>
          )}

          {(summary.freightCharges > 0 || summary.packagingCharges > 0) && (
            <div className="flex justify-between py-1 text-slate-400">
              <span>Freight + Packaging:</span>
              <span className="font-mono text-slate-300">{formatINR((summary.freightCharges || 0) + (summary.packagingCharges || 0))}</span>
            </div>
          )}

          {summary.roundOff !== 0 && (
            <div className="flex justify-between py-1 text-slate-500">
              <span>Round Off:</span>
              <span className="font-mono">{summary.roundOff > 0 ? `+${summary.roundOff}` : summary.roundOff}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-center py-2.5 px-3 bg-slate-950 rounded-lg border border-slate-700/80 my-2">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Grand Total (INR):</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {formatINR(summary.grandTotal)}
            </span>
          </div>

          {/* 30% Advance & Balance Split */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  Advance Required:
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={summary.advancePercentage}
                    disabled={readOnly}
                    onChange={(e) => recalculateAll(items, summary.isInterState, summary.freightCharges, summary.packagingCharges, parseFloat(e.target.value) || 0)}
                    className="w-10 bg-slate-900 border border-amber-500/40 rounded px-1 py-0.5 text-[11px] text-amber-300 text-center font-mono focus:outline-none"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {formatINR(summary.advanceAmount)}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
              <div className="text-slate-400 mb-1 font-semibold">
                Balance on Dispatch ({100 - (summary.advancePercentage || 30)}%):
              </div>
              <div className="text-sm font-bold text-slate-300 font-mono">
                {formatINR(summary.balanceAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      <AdvancedProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleAddProductFromCatalog}
        priceType={priceType}
      />
    </div>
  );
};
