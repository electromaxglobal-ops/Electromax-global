import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Camera,
  Printer,
  Boxes,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building,
  Eye,
  Layers,
  Calendar,
  CheckCheck,
  Edit2,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';
import { TransactionItemsTable, TransactionLineItem, FinancialSummary } from '../../components/common/TransactionItemsTable.tsx';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string;
  deliveryDate: string | null;
  paymentTerms: string | null;
  subtotal: string;
  taxAmount: string;
  grandTotal: string;
  specialInstructions?: string | null;
  itemsJson?: string | null;
  status: string;
  createdAt: string;
}

interface Grn {
  id: number;
  grnNumber: string;
  poId: number | null;
  supplierName: string;
  receivedDate: string;
  receivedQty: string;
  acceptedQty: string;
  rejectedQty: string;
  shortageQty: string;
  challanNumber: string | null;
  inspectionNotes: string | null;
  inspectionPhotoUrl: string | null;
  status: string;
  createdAt: string;
}

export const PurchaseWorkflowView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PO' | 'GRN'>('PO');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<Grn[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);
  const [deleteCandidatePo, setDeleteCandidatePo] = useState<PurchaseOrder | null>(null);
  const [isDeletePoModalOpen, setIsDeletePoModalOpen] = useState(false);

  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [editingGrn, setEditingGrn] = useState<Grn | null>(null);
  const [deleteCandidateGrn, setDeleteCandidateGrn] = useState<Grn | null>(null);
  const [isDeleteGrnModalOpen, setIsDeleteGrnModalOpen] = useState(false);

  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<PurchaseOrder | null>(null);

  // PO Form
  const [supplierName, setSupplierName] = useState('Rajasthan Copper & Stamping Works');
  const [supplierGstin, setSupplierGstin] = useState('08AABCR1234F1Z8');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% against GRN Approval');
  const [specialInstructions, setSpecialInstructions] = useState(
    'BIS Grade Copper Wire & ISI certified heating components'
  );

  // PO Line Items State
  const [poItems, setPoItems] = useState<TransactionLineItem[]>([]);
  const [poSummary, setPoSummary] = useState<FinancialSummary>({
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    isInterState: false,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    freightCharges: 0,
    packagingCharges: 0,
    roundOff: 0,
    grandTotal: 0,
    advancePercentage: 30,
    advanceAmount: 0,
    balanceAmount: 0,
  });

  // GRN Form
  const [grnReceivedQty, setGrnReceivedQty] = useState('1000');
  const [grnAcceptedQty, setGrnAcceptedQty] = useState('980');
  const [grnRejectedQty, setGrnRejectedQty] = useState('20');
  const [grnChallan, setGrnChallan] = useState('CH-SUP-2026-9921');
  const [grnNotes, setGrnNotes] = useState('20 coils rejected due to surface oxidation during transit. Balance accepted.');
  const [grnPhotoUrl, setGrnPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPo, resGrn] = await Promise.all([
        fetch('/api/purchase/orders').then((r) => r.json()),
        fetch('/api/purchase/grn').then((r) => r.json()),
      ]);
      setPurchaseOrders(Array.isArray(resPo) ? resPo : []);
      setGrns(Array.isArray(resGrn) ? resGrn : []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load purchase data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNewPo = () => {
    setEditingPo(null);
    setSupplierName('Rajasthan Copper & Stamping Works');
    setDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setPaymentTerms('30% Advance, 70% against GRN inspection');
    setSpecialInstructions('BIS Grade Copper Wire & ISI certified heating components');
    setPoItems([]);
    setPoSummary({
      subtotal: 0,
      totalDiscount: 0,
      taxableAmount: 0,
      isInterState: false,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      freightCharges: 0,
      packagingCharges: 0,
      roundOff: 0,
      grandTotal: 0,
      advancePercentage: 30,
      advanceAmount: 0,
      balanceAmount: 0,
    });
    setIsPoModalOpen(true);
  };

  const handleOpenEditPo = (po: PurchaseOrder) => {
    setEditingPo(po);
    setSupplierName(po.supplierName);
    setDeliveryDate(po.deliveryDate || new Date().toISOString().split('T')[0]);
    setPaymentTerms(po.paymentTerms || '30% Advance, 70% against GRN Approval');
    setSpecialInstructions(po.specialInstructions || '');

    // Parse itemsJson if present
    if (po.itemsJson) {
      try {
        const parsed = JSON.parse(po.itemsJson);
        if (Array.isArray(parsed)) {
          setPoItems(parsed);
        } else {
          setPoItems([]);
        }
      } catch (err) {
        setPoItems([]);
      }
    } else {
      setPoItems([]);
    }

    setIsPoModalOpen(true);
  };

  const handleSavePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      showToast('Please add at least one line item to the purchase order.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const tax = poSummary.isInterState ? poSummary.igstTotal : poSummary.cgstTotal + poSummary.sgstTotal;

      const payload = {
        supplierName,
        deliveryDate,
        paymentTerms,
        specialInstructions,
        subtotal: String(poSummary.taxableAmount),
        taxAmount: String(tax),
        grandTotal: String(poSummary.grandTotal),
        itemsJson: JSON.stringify(poItems),
      };

      let res;
      if (editingPo) {
        res = await fetch(`/api/purchase/orders/${editingPo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/purchase/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsPoModalOpen(false);
        setEditingPo(null);
        showToast(editingPo ? `Purchase Order ${editingPo.poNumber} updated successfully!` : 'New Multi-Item Purchase Order issued successfully!');
        fetchData();
        setActiveTab('PO');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save PO', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeletePo = (po: PurchaseOrder) => {
    setDeleteCandidatePo(po);
    setIsDeletePoModalOpen(true);
  };

  const handleConfirmDeletePo = async () => {
    if (!deleteCandidatePo) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/purchase/orders/${deleteCandidatePo.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsDeletePoModalOpen(false);
        setDeleteCandidatePo(null);
        showToast(data.message || `PO ${deleteCandidatePo.poNumber} deleted successfully!`);
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete PO', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error deleting PO', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenGrnForPo = (po: PurchaseOrder) => {
    setEditingGrn(null);
    setSelectedPoForGrn(po);
    setSupplierName(po.supplierName);
    setGrnReceivedQty('500');
    setGrnAcceptedQty('500');
    setGrnRejectedQty('0');
    setGrnChallan(`CH-${po.poNumber}`);
    setGrnNotes('All material verified against quality specs.');
    setGrnPhotoUrl('');
    setIsGrnModalOpen(true);
  };

  const handleOpenEditGrn = (grn: Grn) => {
    setEditingGrn(grn);
    setSelectedPoForGrn(null);
    setSupplierName(grn.supplierName);
    setGrnReceivedQty(grn.receivedQty);
    setGrnAcceptedQty(grn.acceptedQty);
    setGrnRejectedQty(grn.rejectedQty);
    setGrnChallan(grn.challanNumber || '');
    setGrnNotes(grn.inspectionNotes || '');
    setGrnPhotoUrl(grn.inspectionPhotoUrl || '');
    setIsGrnModalOpen(true);
  };

  const handleSaveGrn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let res;
      if (editingGrn) {
        res = await fetch(`/api/purchase/grn/${editingGrn.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receivedQty: grnReceivedQty,
            acceptedQty: grnAcceptedQty,
            rejectedQty: grnRejectedQty,
            shortageQty: '0.00',
            challanNumber: grnChallan,
            inspectionNotes: grnNotes,
            status: Number(grnRejectedQty) > 0 ? 'PARTIALLY_ACCEPTED' : 'ACCEPTED',
          }),
        });
      } else {
        res = await fetch('/api/purchase/grn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poId: selectedPoForGrn?.id || null,
            supplierName: selectedPoForGrn?.supplierName || supplierName,
            receivedQty: grnReceivedQty,
            acceptedQty: grnAcceptedQty,
            rejectedQty: grnRejectedQty,
            shortageQty: '0.00',
            challanNumber: grnChallan,
            inspectionNotes: grnNotes,
            inspectionPhotoUrl: grnPhotoUrl,
          }),
        });
      }

      if (res.ok) {
        setIsGrnModalOpen(false);
        setEditingGrn(null);
        showToast(editingGrn ? `GRN ${editingGrn.grnNumber} updated successfully!` : 'Inward Goods Receipt Note logged!');
        fetchData();
        setActiveTab('GRN');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save GRN', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteGrn = (grn: Grn) => {
    setDeleteCandidateGrn(grn);
    setIsDeleteGrnModalOpen(true);
  };

  const handleConfirmDeleteGrn = async () => {
    if (!deleteCandidateGrn) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/purchase/grn/${deleteCandidateGrn.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsDeleteGrnModalOpen(false);
        setDeleteCandidateGrn(null);
        showToast(data.message || `GRN ${deleteCandidateGrn.grnNumber} deleted successfully!`);
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete GRN', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Procurement Management & Goods Receipt Note (GRN)
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Raw Material Requisition to Purchase Order & Goods Receipt Note (GRN). Full <strong>Edit and Delete</strong> capabilities for all Purchase Orders and Inward Receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewPo}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Create Multi-Item PO
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 rounded-xl gap-2">
        <button
          onClick={() => setActiveTab('PO')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'PO' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Purchase Orders ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('GRN')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'GRN' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Goods Receipt Notes (GRN) ({grns.length})
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'PO' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">PO Number</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">Expected Delivery</th>
                <th className="py-3 px-3 text-right">Taxable Subtotal</th>
                <th className="py-3 px-3 text-right">GST Total</th>
                <th className="py-3 px-3 text-right font-bold text-white">Grand Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No purchase orders issued yet. Click "+ Create Multi-Item PO" above.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{po.poNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{po.supplierName}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">{po.deliveryDate || 'Standard'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatINR(parseFloat(po.subtotal))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatINR(parseFloat(po.taxAmount))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(parseFloat(po.grandTotal))}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        po.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPoForPrint(po)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          title="View / Print PO"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        
                        {/* EDIT PO BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditPo(po)}
                          className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Edit PO & Line Items"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>

                        {/* DELETE PO BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeletePo(po)}
                          className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Delete PO"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenGrnForPo(po)}
                          className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Receive GRN
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: GRN INWARD */}
      {activeTab === 'GRN' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">GRN Number</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Challan #</th>
                <th className="py-3 px-3 text-right">Received Qty</th>
                <th className="py-3 px-3 text-right text-emerald-400">Accepted</th>
                <th className="py-3 px-3 text-right text-red-400">Rejected</th>
                <th className="py-3 px-3">Inspection Proof</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {grns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No Goods Receipt Notes logged yet. Receive a PO from Tab 1 to generate inward GRN.
                  </td>
                </tr>
              ) : (
                grns.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{grn.grnNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{grn.supplierName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{grn.challanNumber || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200">{grn.receivedQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{grn.acceptedQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400">{grn.rejectedQty}</td>
                    <td className="py-2.5 px-3">
                      {grn.inspectionPhotoUrl ? (
                        <img
                          src={grn.inspectionPhotoUrl}
                          alt="QC Inspection"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No Photo</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {grn.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditGrn(grn)}
                          className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Edit GRN Inward Counts"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteGrn(grn)}
                          className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Delete GRN"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Multi-Item Purchase Order Generator & Editor */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl relative max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img src="/electromax-logo.png" alt="Electromax" className="w-8 h-8 object-contain" />
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingPo ? `Edit Purchase Order (${editingPo.poNumber})` : 'Create Purchase Order (PO)'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Electromax Global • VKIA Jaipur • Official Procurement Authorization
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPoModalOpen(false);
                  setEditingPo(null);
                }}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Supplier Commercial Name</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Factory Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Payment & Credit Terms</label>
                  <input
                    type="text"
                    required
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Comprehensive Line Items Table */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Requisitioned Materials, Components & Raw Material Items</span>
                  <span className="text-[11px] text-amber-400 font-normal">
                    Add, remove or modify rates, discounts, GST% and quantities
                  </span>
                </label>
                <TransactionItemsTable
                  items={poItems}
                  onItemsChange={setPoItems}
                  onSummaryChange={setPoSummary}
                  documentType="PURCHASE"
                  isInterStateDefault={false}
                  showAdvanceControl={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Technical Specifications & Instructions</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsPoModalOpen(false);
                    setEditingPo(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Saving...' : editingPo ? 'Update Purchase Order' : 'Authorize & Issue PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PO CONFIRMATION POPUP */}
      {isDeletePoModalOpen && deleteCandidatePo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Purchase Order?</h3>
                <p className="text-xs text-rose-300 font-semibold">क्या आप इस Purchase Order को हटाना चाहते हैं?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">PO Number:</span>
                <span className="font-mono font-bold text-amber-400">{deleteCandidatePo.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supplier:</span>
                <span className="font-bold text-white">{deleteCandidatePo.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grand Total:</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(parseFloat(deleteCandidatePo.grandTotal))}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeletePoModalOpen(false);
                  setDeleteCandidatePo(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePo}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Yes, Delete PO (हटाएं)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Goods Receipt Note (GRN) Inward / Edit */}
      {isGrnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingGrn ? `Edit GRN Inward #${editingGrn.grnNumber}` : `Material Inward GRN: ${selectedPoForGrn?.poNumber || 'Inward'}`}
                  </h3>
                  <p className="text-xs text-slate-400">QC Inspection & Physical Store Acceptance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGrnModalOpen(false);
                  setEditingGrn(null);
                }}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrn} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Supplier Name</label>
                <input
                  type="text"
                  readOnly
                  value={supplierName}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Supplier Delivery Challan #</label>
                <input
                  type="text"
                  required
                  value={grnChallan}
                  onChange={(e) => setGrnChallan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Received Qty</label>
                  <input
                    type="number"
                    required
                    value={grnReceivedQty}
                    onChange={(e) => setGrnReceivedQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-emerald-400">Accepted Qty</label>
                  <input
                    type="number"
                    required
                    value={grnAcceptedQty}
                    onChange={(e) => setGrnAcceptedQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-red-400">Rejected Qty</label>
                  <input
                    type="number"
                    required
                    value={grnRejectedQty}
                    onChange={(e) => setGrnRejectedQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">QC Inspection & Rejection Reason Notes</label>
                <textarea
                  rows={2}
                  required
                  value={grnNotes}
                  onChange={(e) => setGrnNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              {!editingGrn && (
                <PhotoCaptureField
                  label="Unloading / Inspection Photograph Proof"
                  value={grnPhotoUrl}
                  onChange={setGrnPhotoUrl}
                  placeholder="Capture photo of delivery truck or material coils"
                />
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsGrnModalOpen(false);
                    setEditingGrn(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Saving...' : editingGrn ? 'Update GRN' : 'Confirm Inward Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE GRN CONFIRMATION POPUP */}
      {isDeleteGrnModalOpen && deleteCandidateGrn && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Goods Receipt Note?</h3>
                <p className="text-xs text-rose-300 font-semibold">क्या आप इस GRN को हटाना चाहते हैं?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">GRN Number:</span>
                <span className="font-mono font-bold text-emerald-400">{deleteCandidateGrn.grnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supplier:</span>
                <span className="font-bold text-white">{deleteCandidateGrn.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accepted Qty:</span>
                <span className="font-mono font-bold text-white">{deleteCandidateGrn.acceptedQty} Units</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteGrnModalOpen(false);
                  setDeleteCandidateGrn(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGrn}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Yes, Delete GRN (हटाएं)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Document Modal */}
      {selectedPoForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img src="/electromax-logo.png" alt="Electromax" className="w-10 h-10 object-contain" />
                <div>
                  <h3 className="text-base font-bold text-white">ELECTROMAX GLOBAL</h3>
                  <p className="text-xs text-slate-400">Official Purchase Order • VKIA Jaipur • Founder & Director: Mr. Sushil Goyal</p>
                </div>
              </div>
              <button onClick={() => setSelectedPoForPrint(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-500 block">PO Number:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedPoForPrint.poNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Supplier:</span>
                <span className="text-white font-semibold">{selectedPoForPrint.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Expected Date:</span>
                <span className="text-slate-300">{selectedPoForPrint.deliveryDate || 'Standard'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Payment Terms:</span>
                <span className="text-amber-400 font-medium">{selectedPoForPrint.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Grand Total:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {formatINR(parseFloat(selectedPoForPrint.grandTotal))}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Official Computer Generated PO</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                Print Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
