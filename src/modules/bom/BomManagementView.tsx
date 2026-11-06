import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  FileSpreadsheet,
  Download,
  Copy,
  History,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Search,
  ArrowRight,
  Layers,
  IndianRupee,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types/erp.ts';
import { formatINR } from '../../utils/formatters.ts';

interface BomItem {
  id?: number;
  componentName: string;
  componentSku: string;
  quantityRequired: number;
  unit: string;
  unitCost: number;
  wastagePercent: number;
  totalComponentCost: number;
}

interface BomRecord {
  id: number;
  productId: number;
  productName?: string;
  skuId?: number | null;
  skuCode?: string | null;
  name: string;
  revisionNumber: number;
  batchSize: number;
  estimatedMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  totalEstimatedCost: number;
  status: string;
  effectiveDate: string;
  items: BomItem[];
}

interface BomProps {
  products: Product[];
}

export const BomManagementView: React.FC<BomProps> = ({ products }) => {
  const [boms, setBoms] = useState<BomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBom, setSelectedBom] = useState<BomRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'LIST' | 'DETAIL'>('LIST');

  // Form State
  const [formData, setFormData] = useState({
    productId: products[0]?.id || 0,
    skuId: null as number | null,
    name: '',
    revisionNumber: 1,
    batchSize: 1,
    laborCost: 120,
    overheadCost: 65,
    effectiveDate: new Date().toISOString().split('T')[0],
    items: [
      {
        componentName: 'Heating Element 1000W / Mica Sheet',
        componentSku: 'RAW-ELM-1000',
        quantityRequired: 1,
        unit: 'PCS',
        unitCost: 180,
        wastagePercent: 2,
        totalComponentCost: 183.6,
      },
      {
        componentName: 'Virgin ABS Thermoplastic Body Moulding',
        componentSku: 'RAW-ABS-BODY',
        quantityRequired: 0.85,
        unit: 'KG',
        unitCost: 160,
        wastagePercent: 3,
        totalComponentCost: 140.08,
      },
      {
        componentName: 'Copper Power Cord with 16A 3-Pin Plug',
        componentSku: 'RAW-CORD-16A',
        quantityRequired: 1,
        unit: 'PCS',
        unitCost: 95,
        wastagePercent: 1,
        totalComponentCost: 95.95,
      },
      {
        componentName: 'Thermal Safety Cut-off & Rotary Switch',
        componentSku: 'RAW-SW-TCO',
        quantityRequired: 1,
        unit: 'SET',
        unitCost: 45,
        wastagePercent: 1,
        totalComponentCost: 45.45,
      },
      {
        componentName: '5-Ply Corrugated Printed Carton & Foam Buffers',
        componentSku: 'PKG-BOX-CORR',
        quantityRequired: 1,
        unit: 'BOX',
        unitCost: 38,
        wastagePercent: 1,
        totalComponentCost: 38.38,
      },
    ] as BomItem[],
  });

  const fetchBoms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boms');
      if (res.ok) {
        const data = await res.json();
        setBoms(data);
      }
    } catch (err) {
      console.error('Error fetching BOMs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  const calculateTotals = (items: BomItem[], labor: number, overhead: number) => {
    const materialCost = items.reduce((acc, it) => acc + (Number(it.totalComponentCost) || 0), 0);
    const total = materialCost + Number(labor) + Number(overhead);
    return { materialCost, total };
  };

  const handleItemChange = (index: number, field: keyof BomItem, val: any) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };

    const qty = Number(field === 'quantityRequired' ? val : item.quantityRequired) || 0;
    const cost = Number(field === 'unitCost' ? val : item.unitCost) || 0;
    const waste = Number(field === 'wastagePercent' ? val : item.wastagePercent) || 0;

    item.totalComponentCost = Number((qty * cost * (1 + waste / 100)).toFixed(2));
    updated[index] = item;
    setFormData({ ...formData, items: updated });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          componentName: '',
          componentSku: '',
          quantityRequired: 1,
          unit: 'PCS',
          unitCost: 0,
          wastagePercent: 0,
          totalComponentCost: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSaveBom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { materialCost, total } = calculateTotals(formData.items, formData.laborCost, formData.overheadCost);

      const payload = {
        ...formData,
        estimatedMaterialCost: materialCost,
        totalEstimatedCost: total,
      };

      const res = await fetch('/api/boms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        await fetchBoms();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save BOM');
      }
    } catch (err: any) {
      alert('Error saving BOM: ' + err.message);
    }
  };

  const handleDuplicate = (b: BomRecord) => {
    setFormData({
      productId: b.productId,
      skuId: b.skuId || null,
      name: `${b.name} (Rev ${b.revisionNumber + 1})`,
      revisionNumber: b.revisionNumber + 1,
      batchSize: b.batchSize || 1,
      laborCost: b.laborCost,
      overheadCost: b.overheadCost,
      effectiveDate: new Date().toISOString().split('T')[0],
      items: b.items.map((it) => ({ ...it })),
    });
    setShowCreateModal(true);
  };

  const handleExportCsv = () => {
    const headers = ['BOM Name', 'Product', 'Revision', 'Material Cost', 'Labor Cost', 'Overhead', 'Total Cost', 'Status'];
    const rows = boms.map((b) => [
      `"${b.name}"`,
      `"${b.productName || 'Electromax Appliance'}"`,
      `"Rev ${b.revisionNumber}"`,
      b.estimatedMaterialCost,
      b.laborCost,
      b.overheadCost,
      b.totalEstimatedCost,
      b.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Electromax_BOM_Catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentFormTotals = calculateTotals(formData.items, formData.laborCost, formData.overheadCost);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                BOM – Bill of Materials & Product Costing
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Model & Colour Configurable
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Engineering component structures, material consumption, wastage formulas, and automatic manufacturing cost breakdown per SKU batch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New BOM
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search BOM by model, SKU or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-200">{boms.length}</strong> Configured BOM Versions
        </div>
      </div>

      {/* BOM Cards / Table */}
      {boms.length === 0 ? (
        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl mx-auto flex items-center justify-center border border-orange-500/20">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Bill of Materials Configured Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create your first BOM recipe for Electromax Room Heaters, Electric Kettles, Fans, or Mosquito Bats with complete raw material line items and costing.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Setup First BOM
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boms
            .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
            .map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 hover:border-orange-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-orange-500 border border-slate-200 dark:border-slate-700">
                      Rev {b.revisionNumber}.0
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      {b.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {b.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Batch Size: {b.batchSize} Units • Eff: {b.effectiveDate || 'Immediate'}
                    </p>
                  </div>

                  {/* Costing Summary */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Raw Materials ({b.items?.length || 0} items):</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatINR(b.estimatedMaterialCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Labour & Assembly:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatINR(b.laborCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Factory Overheads:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatINR(b.overheadCost)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-1 flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>Total Unit Production Cost:</span>
                      <span className="font-mono text-orange-500">
                        {formatINR(b.totalEstimatedCost)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleDuplicate(b)}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Create Revision
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBom(b);
                      setActiveTab('DETAIL');
                    }}
                    className="text-[11px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                  >
                    View Recipe <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create / Edit BOM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Configure Model & Colour Bill of Material (BOM)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">BOM Recipe Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Kettle 1.8L Stainless Steel (Black Variant BOM)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Revision Number</label>
                  <input
                    type="number"
                    value={formData.revisionNumber}
                    onChange={(e) => setFormData({ ...formData, revisionNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Batch Production Size</label>
                  <input
                    type="number"
                    value={formData.batchSize}
                    onChange={(e) => setFormData({ ...formData, batchSize: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Labour & Assembly Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Factory Overheads (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.overheadCost}
                    onChange={(e) => setFormData({ ...formData, overheadCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Component Items Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Raw Material & Sub-Assembly Line Items ({formData.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Component
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 px-2">Component Name</th>
                        <th className="py-2 px-2">Item Code</th>
                        <th className="py-2 px-2 text-right">Qty</th>
                        <th className="py-2 px-2">Unit</th>
                        <th className="py-2 px-2 text-right">Unit Rate (₹)</th>
                        <th className="py-2 px-2 text-right">Wastage %</th>
                        <th className="py-2 px-2 text-right">Total (₹)</th>
                        <th className="py-2 px-1 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              required
                              value={item.componentName}
                              onChange={(e) => handleItemChange(idx, 'componentName', e.target.value)}
                              placeholder="e.g. Copper Element"
                              className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.componentSku}
                              onChange={(e) => handleItemChange(idx, 'componentSku', e.target.value)}
                              placeholder="RAW-001"
                              className="w-24 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.001"
                              value={item.quantityRequired}
                              onChange={(e) => handleItemChange(idx, 'quantityRequired', e.target.value)}
                              className="w-16 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                              <option value="PCS">PCS</option>
                              <option value="KG">KG</option>
                              <option value="MTR">MTR</option>
                              <option value="SET">SET</option>
                              <option value="BOX">BOX</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                              className="w-20 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.1"
                              value={item.wastagePercent}
                              onChange={(e) => handleItemChange(idx, 'wastagePercent', e.target.value)}
                              className="w-14 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                            {formatINR(item.totalComponentCost)}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation Bar */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex flex-wrap items-center justify-between gap-4 font-bold">
                <div>
                  <span className="text-slate-400 text-[11px] block">Material Cost:</span>
                  <span className="font-mono text-slate-900 dark:text-white text-sm">
                    {formatINR(currentFormTotals.materialCost)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Labour + Overhead:</span>
                  <span className="font-mono text-slate-900 dark:text-white text-sm">
                    {formatINR(formData.laborCost + formData.overheadCost)}
                  </span>
                </div>
                <div>
                  <span className="text-orange-500 text-[11px] block">Total Unit Production Cost:</span>
                  <span className="font-mono text-orange-500 text-base">
                    {formatINR(currentFormTotals.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md cursor-pointer"
                >
                  Save BOM Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
