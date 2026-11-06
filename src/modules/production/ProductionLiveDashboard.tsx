import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Layers,
  Flame,
  Plus,
  RefreshCw,
  Box,
  CheckCircle,
  FileCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface WorkOrder {
  id: number;
  workOrderNo: string;
  productId: number;
  skuId: number | null;
  colorName: string | null;
  plannedQty: string;
  producedQty: string;
  rejectedQty: string;
  status: string;
  productionLine: string;
  assignedLead: string;
  startDate: string | null;
  completionDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
}

interface ProductSku {
  id: number;
  skuCode: string;
  colorName: string;
  productId: number;
}

const PRODUCTION_STAGES = [
  { key: 'ORDER_RECEIVED', label: '1. Order Received', desc: 'Work Order released from Sales Order' },
  { key: 'RAW_MATERIAL_REQUISITION', label: '2. Material Requisition', desc: 'Components picked from raw material warehouse' },
  { key: 'STAMPING_CUTTING', label: '3. Stamping & Body Forming', desc: 'Sheet metal press & plastic molding' },
  { key: 'COIL_WINDING_ASSEMBLY', label: '4. Coil Winding', desc: '100% Copper motor winding & core insertion' },
  { key: 'MOTOR_TESTING', label: '5. Motor Testing', desc: 'RPM check & high-voltage surge test' },
  { key: 'POWDER_COATING_PAINTING', label: '6. Color Coating', desc: 'Electrostatic powder coating & color curing' },
  { key: 'FINAL_ASSEMBLY', label: '7. Final Assembly', desc: 'Wiring, safety thermostat & outer housing' },
  { key: 'QUALITY_INSPECTION', label: '8. Quality Testing', desc: 'Dielectric breakdown, wattage & thermal QA' },
  { key: 'PACKED_READY_FOR_DISPATCH', label: '9. Packed & Ready', desc: 'Individual box, barcode & master carton' },
];

export const ProductionLiveDashboard: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [skus, setSkus] = useState<ProductSku[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isAdvanceStageOpen, setIsAdvanceStageOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Form State
  const [formProductId, setFormProductId] = useState<number>(1);
  const [formSkuId, setFormSkuId] = useState<number | null>(null);
  const [formColorName, setFormColorName] = useState('Jet Black');
  const [formQty, setFormQty] = useState('500');
  const [formLine, setFormLine] = useState('Line 1 - Heating & Electric Appliances');
  const [formLead, setFormLead] = useState('Rajesh Meena (Plant Head)');
  const [formNotes, setFormNotes] = useState('High priority Snow Wave commercial batch');

  // Advance Stage Form
  const [targetStage, setTargetStage] = useState('RAW_MATERIAL_REQUISITION');
  const [producedCount, setProducedCount] = useState('');
  const [rejectedCount, setRejectedCount] = useState('0');
  const [stagePhotoUrl, setStagePhotoUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resWo, resProd, resSkus] = await Promise.all([
        fetch('/api/production/work-orders').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/skus').then((r) => r.json()),
      ]);
      setWorkOrders(Array.isArray(resWo) ? resWo : []);
      const fg = Array.isArray(resProd) ? resProd.filter((p: any) => p.itemType === 'FINISHED_GOOD') : [];
      setProducts(fg);
      setSkus(Array.isArray(resSkus) ? resSkus : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/production/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formProductId,
          skuId: formSkuId,
          colorName: formColorName,
          plannedQty: formQty,
          productionLine: formLine,
          assignedLead: formLead,
          notes: formNotes,
        }),
      });
      if (res.ok) {
        setIsNewOrderOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/production/work-orders/${selectedOrder.id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: targetStage,
          producedQty: producedCount || selectedOrder.producedQty,
          rejectedQty: rejectedCount || selectedOrder.rejectedQty,
          stagePhotoUrl: stagePhotoUrl || null,
        }),
      });
      if (res.ok) {
        setIsAdvanceStageOpen(false);
        setSelectedOrder(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStageIndex = (stageKey: string) => {
    const idx = PRODUCTION_STAGES.findIndex((s) => s.key === stageKey);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Live 9-Stage Manufacturing & Assembly Line
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Color-wise Production Work Orders: Live stage-by-stage shop floor tracking across VKI Unit 1 & Unit 2 Jaipur. Upload photo inspection proof at each stage before progression.
          </p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) setFormProductId(products[0].id);
            setIsNewOrderOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      {/* Production Line Flow Legend */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Official 9-Stage Quality Manufacturing Protocol:
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 text-[10px]">
          {PRODUCTION_STAGES.map((s, idx) => (
            <div key={s.key} className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
              <span className="font-bold text-orange-400 block">{idx + 1}</span>
              <span className="text-slate-300 font-medium truncate block mt-0.5">{s.label.split('. ')[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.length === 0 ? (
          <div className="bg-slate-900/50 p-12 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
            No active work orders. Click &quot;Create Work Order&quot; to begin factory assembly.
          </div>
        ) : (
          workOrders.map((wo) => {
            const currentIdx = getStageIndex(wo.status);
            const parentProd = products.find((p) => p.id === wo.productId);
            const isCompleted = wo.status === 'PACKED_READY_FOR_DISPATCH';
            const progressPercent = Math.round(((currentIdx + 1) / PRODUCTION_STAGES.length) * 100);

            return (
              <div
                key={wo.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                      <Flame className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {wo.workOrderNo}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-orange-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                          {wo.colorName || 'Standard'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {parentProd ? `${parentProd.brand} • ${parentProd.name}` : 'Appliance Model'} ({wo.productionLine})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Planned Quantity</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {Number(wo.plannedQty).toLocaleString('en-IN')} PCS
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(wo);
                        const nextStageIdx = Math.min(currentIdx + 1, PRODUCTION_STAGES.length - 1);
                        setTargetStage(PRODUCTION_STAGES[nextStageIdx].key);
                        setProducedCount(wo.producedQty);
                        setIsAdvanceStageOpen(true);
                      }}
                      disabled={isCompleted}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isCompleted ? 'Batch Completed' : 'Advance Stage'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Current Stage: <span className="text-amber-400 font-bold">{PRODUCTION_STAGES[currentIdx].label}</span>
                    </span>
                    <span className="font-mono font-bold text-orange-400">
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 pt-1">
                  {PRODUCTION_STAGES.map((stg, idx) => {
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div
                        key={stg.key}
                        className={`p-2 rounded-lg text-[10px] border transition-all ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : isCurrent
                            ? 'bg-orange-500/15 border-orange-500/40 text-orange-300 font-bold shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-300">
                              {idx + 1}
                            </span>
                          )}
                          <span className="truncate">{stg.label.split('. ')[1]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floor Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center gap-4">
                    <span>Supervisor: <span className="text-white font-medium">{wo.assignedLead}</span></span>
                    <span>Produced: <span className="font-mono text-emerald-400 font-bold">{wo.producedQty} PCS</span></span>
                    <span>Rejected QA: <span className="font-mono text-rose-400 font-bold">{wo.rejectedQty} PCS</span></span>
                  </div>
                  <div>
                    <span>Start: {wo.startDate || 'Immediate'}</span>
                    {wo.completionDate && <span className="ml-3 text-emerald-400">Completed: {wo.completionDate}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Work Order */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-400" />
                Issue New Factory Production Work Order
              </h2>
              <button onClick={() => setIsNewOrderOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Finished Good Appliance</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} • {p.code} ({p.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Color Variant</label>
                  <input
                    type="text"
                    required
                    value={formColorName}
                    onChange={(e) => setFormColorName(e.target.value)}
                    placeholder="e.g. Jet Black, Crimson Red"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Planned Batch Units (PCS)</label>
                  <input
                    type="number"
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assembly Line</label>
                  <select
                    value={formLine}
                    onChange={(e) => setFormLine(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                  >
                    <option value="Line 1 - Heating & Electric Appliances">Line 1 - Heating & Electric Appliances (Plant 1)</option>
                    <option value="Line 2 - Fans & Mosquito Bats">Line 2 - Fans & Mosquito Bats (Plant 2)</option>
                    <option value="Line 3 - OEM & Private Label">Line 3 - OEM & Private Label (VKI)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assigned Shift Lead</label>
                  <input
                    type="text"
                    value={formLead}
                    onChange={(e) => setFormLead(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Production Specifications & Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg"
                >
                  Release Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Advance Stage with Photo Verification */}
      {isAdvanceStageOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                Advance Stage: {selectedOrder.workOrderNo}
              </h2>
              <button onClick={() => setIsAdvanceStageOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdvanceStage} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Select Next Progression Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-semibold"
                >
                  {PRODUCTION_STAGES.map((stg) => (
                    <option key={stg.key} value={stg.key}>
                      {stg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Produced Units</label>
                  <input
                    type="number"
                    value={producedCount}
                    onChange={(e) => setProducedCount(e.target.value)}
                    placeholder={selectedOrder.producedQty}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rejected QA Units</label>
                  <input
                    type="number"
                    value={rejectedCount}
                    onChange={(e) => setRejectedCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-rose-400 font-mono outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-1">
                <PhotoCaptureField
                  label="Stage Quality Inspection Camera Photo"
                  value={stagePhotoUrl}
                  onChange={setStagePhotoUrl}
                  helperText="Capture work order assembly, heating coil, or QA test result directly with device camera."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdvanceStageOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg"
                >
                  Verify & Move to Next Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
