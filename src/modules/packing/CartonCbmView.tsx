import React, { useState, useEffect } from 'react';
import {
  Package,
  Calculator,
  Truck,
  Plus,
  Trash2,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
} from 'lucide-react';

interface CartonPacking {
  id: number;
  productId: number;
  skuId: number | null;
  cartonNumber: string | null;
  cartonLengthCm: string;
  cartonWidthCm: string;
  cartonHeightCm: string;
  qtyPerCarton: number;
  numCartons: number;
  grossWeightKg: string;
  netWeightKg: string;
  cbmPerCarton: string;
  totalCbm: string;
  packingNotes: string | null;
}

interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
}

export const CartonCbmView: React.FC = () => {
  const [cartons, setCartons] = useState<CartonPacking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [cartonNumber, setCartonNumber] = useState('CTN-EXP-01');
  const [lengthCm, setLengthCm] = useState('60');
  const [widthCm, setWidthCm] = useState('40');
  const [heightCm, setHeightCm] = useState('45');
  const [qtyPerCarton, setQtyPerCarton] = useState('16');
  const [numCartons, setNumCartons] = useState('50');
  const [grossWeightKg, setGrossWeightKg] = useState('15.50');
  const [netWeightKg, setNetWeightKg] = useState('13.80');
  const [packingNotes, setPackingNotes] = useState('Heavy 5-ply corrugated carton with internal foam buffer');

  const fetchCartons = async () => {
    setLoading(true);
    try {
      const [resCtn, resProd] = await Promise.all([
        fetch('/api/cartons').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ]);
      setCartons(Array.isArray(resCtn) ? resCtn : []);
      const fg = Array.isArray(resProd) ? resProd.filter((p: any) => p.itemType === 'FINISHED_GOOD') : [];
      setProducts(fg);
      if (fg.length > 0 && !selectedProductId) {
        setSelectedProductId(fg[0].id);
      }
    } catch (e) {
      console.error('Error fetching cartons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartons();
  }, []);

  // Real-time interactive calculation: (L × W × H) / 1,000,000
  const l = Number(lengthCm) || 0;
  const w = Number(widthCm) || 0;
  const h = Number(heightCm) || 0;
  const count = Number(numCartons) || 1;
  const qty = Number(qtyPerCarton) || 1;
  const cbmSingle = (l * w * h) / 1000000;
  const totalCbmLive = cbmSingle * count;
  const totalUnits = count * qty;

  const handleCreateCarton = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cartons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          cartonNumber,
          cartonLengthCm: lengthCm,
          cartonWidthCm: widthCm,
          cartonHeightCm: heightCm,
          qtyPerCarton: qty,
          numCartons: count,
          grossWeightKg,
          netWeightKg,
          packingNotes,
        }),
      });
      if (res.ok) {
        fetchCartons();
      }
    } catch (err) {
      console.error('Failed to create carton spec:', err);
    }
  };

  const handleDeleteCarton = async (id: number) => {
    if (!confirm('Delete this carton packing specification?')) return;
    try {
      await fetch(`/api/cartons/${id}`, { method: 'DELETE' });
      fetchCartons();
    } catch (err) {
      console.error(err);
    }
  };

  // Grand summary across all active packing rules
  const overallCbm = cartons.reduce((sum, c) => sum + Number(c.totalCbm || 0), 0);
  const overallCartons = cartons.reduce((sum, c) => sum + Number(c.numCartons || 0), 0);
  const overallUnits = cartons.reduce((sum, c) => sum + (Number(c.numCartons || 0) * Number(c.qtyPerCarton || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Carton Packaging & CBM Freight Engine
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Automated Cubic Meter (CBM) Calculator: Formula = <code>(L × W × H in cm) / 1,000,000</code>. Generate standard export & domestic packing lists for accurate transporter freight and container filling.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          Print Packing Manifest
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Volume</span>
          <div className="text-2xl font-black font-mono text-orange-400 mt-1">
            {overallCbm.toFixed(4)} <span className="text-xs font-normal text-slate-400">m³</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Across all registered master cartons</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Master Cartons</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {overallCartons.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">Boxes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Shipper outer corrugated boxes</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Packaged Units</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {overallUnits.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">PCS</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ready for warehouse dispatch</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Truck Utilization</span>
            <div className="text-lg font-bold font-mono text-blue-400 mt-1">
              {((overallCbm / 32) * 100).toFixed(1)}% of 20ft
            </div>
            <p className="text-[10px] text-slate-400">Standard 20ft container (~32 m³)</p>
          </div>
          <Truck className="w-8 h-8 text-blue-400/40" />
        </div>
      </div>

      {/* Interactive CBM Formula Calculator Card */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Interactive CBM Dimension Calculator & Specification Creator
            </h2>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono border border-slate-700">
            Formula: (L × W × H) / 1,000,000 = CBM/Carton
          </span>
        </div>

        <form onSubmit={handleCreateCarton} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Appliance Model</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} • {p.code} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Carton Number / Mark</label>
              <input
                type="text"
                required
                value={cartonNumber}
                onChange={(e) => setCartonNumber(e.target.value)}
                placeholder="e.g. CTN-EK-EXPORT"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Corrugation / Packing Details</label>
              <input
                type="text"
                value={packingNotes}
                onChange={(e) => setPackingNotes(e.target.value)}
                placeholder="e.g. 5-Ply Export Box, Strapped"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Length (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Width (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Qty / Carton</label>
              <input
                type="number"
                required
                value={qtyPerCarton}
                onChange={(e) => setQtyPerCarton(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Total Cartons</label>
              <input
                type="number"
                required
                value={numCartons}
                onChange={(e) => setNumCartons(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Gross Wt (KG)</label>
              <input
                type="number"
                step="0.1"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Live Preview Ribbon */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Calculated CBM / Box</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {cbmSingle.toFixed(6)} m³
                </span>
              </div>
              <div className="border-l border-slate-800 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Batch CBM</span>
                <span className="text-base font-extrabold font-mono text-orange-400">
                  {totalCbmLive.toFixed(4)} m³
                </span>
              </div>
              <div className="border-l border-slate-800 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Finished Units</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {totalUnits.toLocaleString('en-IN')} PCS
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Carton Specification
            </button>
          </div>
        </form>
      </div>

      {/* Carton Specification Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Registered Carton Packaging Manifest
          </h2>
          <span className="text-xs text-slate-400">
            {cartons.length} Master Specifications Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Carton Mark</th>
                <th className="py-3.5 px-4">Appliance Model</th>
                <th className="py-3.5 px-4">Dimensions (L × W × H)</th>
                <th className="py-3.5 px-4">Pcs / Box</th>
                <th className="py-3.5 px-4">Box Count</th>
                <th className="py-3.5 px-4">Total Units</th>
                <th className="py-3.5 px-4">CBM / Box</th>
                <th className="py-3.5 px-4">Total CBM</th>
                <th className="py-3.5 px-4">Gross Wt</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {cartons.map((c) => {
                const prod = products.find((p) => p.id === c.productId);
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-orange-400">
                      {c.cartonNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{prod ? prod.name : 'Finished Good'}</div>
                      <div className="text-[10px] text-slate-400">{prod?.code}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {c.cartonLengthCm} × {c.cartonWidthCm} × {c.cartonHeightCm} cm
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {c.qtyPerCarton} PCS
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {c.numCartons} Boxes
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {(c.numCartons * c.qtyPerCarton).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">
                      {Number(c.cbmPerCarton).toFixed(6)} m³
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-orange-400">
                      {Number(c.totalCbm).toFixed(4)} m³
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {c.grossWeightKg} KG
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCarton(c.id)}
                        className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
