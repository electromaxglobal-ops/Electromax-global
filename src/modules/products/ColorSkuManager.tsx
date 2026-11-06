import React, { useState, useEffect } from 'react';
import {
  Palette,
  QrCode,
  Barcode as BarcodeIcon,
  Plus,
  Search,
  Upload,
  Camera,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Box,
  IndianRupee,
  ShieldAlert,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface ColorSku {
  id: number;
  productId: number;
  colorId: number | null;
  skuCode: string;
  colorName: string;
  barcode: string | null;
  qrCode: string | null;
  purchaseRate: string;
  sellingRate: string;
  mrp: string;
  stockQuantity: string;
  minStockLevel: number;
  weightKg: string;
  imageUrl: string | null;
  status: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
  itemType: string;
}

interface ProductColor {
  id: number;
  code: string;
  name: string;
  hexCode: string;
}

export const ColorSkuManager: React.FC = () => {
  const [skus, setSkus] = useState<ColorSku[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Active targets
  const [selectedSku, setSelectedSku] = useState<ColorSku | null>(null);
  const [editingSku, setEditingSku] = useState<ColorSku | null>(null);
  const [deleteCandidateSku, setDeleteCandidateSku] = useState<ColorSku | null>(null);

  // Stock Adjustment Form
  const [newStock, setNewStock] = useState('');
  const [stockReason, setStockReason] = useState('Physical Floor Verification');

  // Add Form State
  const [formProductId, setFormProductId] = useState<number>(1);
  const [formColorName, setFormColorName] = useState('Jet Black');
  const [formSkuCode, setFormSkuCode] = useState('');
  const [formPurchaseRate, setFormPurchaseRate] = useState('450.00');
  const [formSellingRate, setFormSellingRate] = useState('720.00');
  const [formMrp, setFormMrp] = useState('1299.00');
  const [formStock, setFormStock] = useState('100.00');
  const [formMinStock, setFormMinStock] = useState('25');
  const [formWeight, setFormWeight] = useState('1.150');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Edit Form State
  const [editSkuCode, setEditSkuCode] = useState('');
  const [editColorName, setEditColorName] = useState('');
  const [editPurchaseRate, setEditPurchaseRate] = useState('');
  const [editSellingRate, setEditSellingRate] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [editMinStockLevel, setEditMinStockLevel] = useState('');
  const [editWeightKg, setEditWeightKg] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editBarcode, setEditBarcode] = useState('');
  const [editQrCode, setEditQrCode] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSkus, resProds, resColors] = await Promise.all([
        fetch('/api/skus').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/colors').then((r) => r.json()),
      ]);
      setSkus(Array.isArray(resSkus) ? resSkus : []);
      const fg = Array.isArray(resProds) ? resProds.filter((p) => p.itemType === 'FINISHED_GOOD') : [];
      setProducts(fg);
      if (fg.length > 0 && !formProductId) {
        setFormProductId(fg[0].id);
      }
      setColors(Array.isArray(resColors) ? resColors : []);
    } catch (e) {
      console.error('Failed to load Color SKUs:', e);
      showToast('Failed to load Color SKUs from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductChange = (prodId: number) => {
    setFormProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const colorAbbr = formColorName.slice(0, 3).toUpperCase();
      setFormSkuCode(`${prod.code}-${colorAbbr}`);
    }
  };

  const handleColorNameChange = (name: string) => {
    setFormColorName(name);
    const prod = products.find((p) => p.id === formProductId);
    if (prod) {
      const colorAbbr = name.slice(0, 3).toUpperCase();
      setFormSkuCode(`${prod.code}-${colorAbbr}`);
    }
  };

  const handleCreateSku = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const colorObj = colors.find((c) => c.name.toLowerCase() === formColorName.toLowerCase());
      const res = await fetch('/api/skus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formProductId,
          colorId: colorObj?.id || null,
          skuCode: formSkuCode,
          colorName: formColorName,
          purchaseRate: formPurchaseRate,
          sellingRate: formSellingRate,
          mrp: formMrp,
          stockQuantity: formStock,
          minStockLevel: Number(formMinStock),
          weightKg: formWeight,
          imageUrl: formImageUrl || null,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        showToast(`SKU ${formSkuCode} (${formColorName}) created successfully!`);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create SKU', 'error');
      }
    } catch (err: any) {
      console.error('Failed to create SKU:', err);
      showToast(err.message || 'Network error while creating SKU', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditModal = (sku: ColorSku) => {
    setEditingSku(sku);
    setEditSkuCode(sku.skuCode);
    setEditColorName(sku.colorName);
    setEditPurchaseRate(sku.purchaseRate);
    setEditSellingRate(sku.sellingRate);
    setEditMrp(sku.mrp);
    setEditStockQuantity(sku.stockQuantity);
    setEditMinStockLevel(String(sku.minStockLevel));
    setEditWeightKg(sku.weightKg);
    setEditStatus(sku.status || 'ACTIVE');
    setEditBarcode(sku.barcode || '');
    setEditQrCode(sku.qrCode || '');
    setEditImageUrl(sku.imageUrl || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSku) return;
    setIsSaving(true);
    try {
      const colorObj = colors.find((c) => c.name.toLowerCase() === editColorName.toLowerCase());
      const res = await fetch(`/api/skus/${editingSku.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuCode: editSkuCode,
          colorName: editColorName,
          colorId: colorObj?.id || null,
          purchaseRate: editPurchaseRate,
          sellingRate: editSellingRate,
          mrp: editMrp,
          stockQuantity: editStockQuantity,
          minStockLevel: Number(editMinStockLevel),
          weightKg: editWeightKg,
          status: editStatus,
          barcode: editBarcode,
          qrCode: editQrCode,
          imageUrl: editImageUrl || null,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingSku(null);
        showToast(`SKU ${editSkuCode} updated successfully!`);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update SKU', 'error');
      }
    } catch (err: any) {
      console.error('Failed to update SKU:', err);
      showToast(err.message || 'Network error while updating SKU', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteModal = (sku: ColorSku) => {
    setDeleteCandidateSku(sku);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateSku) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/skus/${deleteCandidateSku.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setDeleteCandidateSku(null);
        showToast(data.message || `SKU ${deleteCandidateSku.skuCode} deleted successfully!`);
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete SKU', 'error');
      }
    } catch (err: any) {
      console.error('Failed to delete SKU:', err);
      showToast(err.message || 'Network error while deleting SKU', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) return;
    try {
      const res = await fetch(`/api/skus/${selectedSku.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockQuantity: newStock,
          reason: stockReason,
        }),
      });
      if (res.ok) {
        setIsStockModalOpen(false);
        setSelectedSku(null);
        showToast(`Stock updated to ${newStock} PCS`);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const filteredSkus = skus.filter((item) => {
    const matchesProduct = selectedProductId === 'ALL' || item.productId === selectedProductId;
    const matchesSearch =
      item.skuCode.toLowerCase().includes(search.toLowerCase()) ||
      item.colorName.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));
    return matchesProduct && matchesSearch;
  });

  const getColorHex = (name: string) => {
    const c = colors.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (c) return c.hexCode;
    const lower = name.toLowerCase();
    if (lower.includes('black')) return '#18181B';
    if (lower.includes('white')) return '#F8FAFC';
    if (lower.includes('red')) return '#DC2626';
    if (lower.includes('blue')) return '#2563EB';
    if (lower.includes('silver')) return '#94A3B8';
    if (lower.includes('grey') || lower.includes('gray')) return '#475569';
    if (lower.includes('yellow') || lower.includes('gold')) return '#EAB308';
    if (lower.includes('green')) return '#16A34A';
    if (lower.includes('orange')) return '#EA580C';
    return '#64748B';
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
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
              <Palette className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Color Master & Independent SKU Engine
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Strict Multi-Variant Architecture: Every color variant maintains independent physical stock, dedicated barcodes, and separate bin allocations. Complete <strong>Edit & Delete</strong> options with audit trails are available for every SKU.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (products.length > 0) handleProductChange(products[0].id);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Color Variant SKU
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Model:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-2 outline-hidden focus:border-orange-500 w-full sm:w-64"
          >
            <option value="ALL">All Finished Goods Models</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} • {p.code} ({p.name})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU code, color, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-xs text-slate-100 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-slate-700 outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Grid of Color Variants */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 text-xs gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
          Loading Color Variants...
        </div>
      ) : filteredSkus.length === 0 ? (
        <div className="bg-slate-900/50 p-12 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
          No color SKUs found. Click &quot;Add Color Variant SKU&quot; to register color codes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkus.map((sku) => {
            const hex = getColorHex(sku.colorName);
            const parentProd = products.find((p) => p.id === sku.productId);
            const isLowStock = Number(sku.stockQuantity) <= sku.minStockLevel;

            return (
              <div
                key={sku.id}
                className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 shadow-md p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Header with Color Swatch & Top Quick Action Buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {sku.colorName}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({sku.skuCode})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          {parentProd ? parentProd.name : 'Finished Good'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sku.status === 'INACTIVE' ? (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                          INACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                          {parentProd?.code || 'SKU'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Level Card */}
                  <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Independent Stock:</span>
                      <span className={`font-mono font-bold text-sm ${isLowStock ? 'text-amber-400 flex items-center gap-1' : 'text-emerald-400'}`}>
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                        {Number(sku.stockQuantity).toLocaleString('en-IN')} PCS
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Reorder Threshold:</span>
                      <span className="font-mono text-slate-400">{sku.minStockLevel} PCS</span>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Dealer Price</span>
                      <span className="font-mono font-semibold text-slate-200">
                        ₹{Number(sku.sellingRate).toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">MRP</span>
                      <span className="font-mono font-semibold text-orange-400">
                        ₹{Number(sku.mrp).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Barcode & QR Code Section */}
                  <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                      <BarcodeIcon className="w-4 h-4 text-orange-400" />
                      <span>{sku.barcode || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                      <QrCode className="w-3 h-3 text-emerald-400" />
                      <span>{sku.qrCode}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions: EDIT, DELETE, and ADJUST STOCK */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Weight: {sku.weightKg} kg</span>
                    <span className="font-mono text-slate-500">Pur: ₹{Number(sku.purchaseRate).toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(sku)}
                      className="px-2 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Edit Color Variant Details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(sku)}
                      className="px-2 py-1.5 bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Delete Color Variant SKU"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSku(sku);
                        setNewStock(sku.stockQuantity);
                        setIsStockModalOpen(true);
                      }}
                      className="px-2 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Adjust Stock Balance"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Stock</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD COLOR VARIANT SKU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-400" />
                Register New Color Variant & SKU
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSku} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Appliance Model</label>
                <select
                  value={formProductId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} • {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Color Variant Name</label>
                  <input
                    type="text"
                    required
                    value={formColorName}
                    onChange={(e) => handleColorNameChange(e.target.value)}
                    placeholder="e.g. Jet Black, Fire Red"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Unique SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formSkuCode}
                    onChange={(e) => setFormSkuCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-orange-400 outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Purchase Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPurchaseRate}
                    onChange={(e) => setFormPurchaseRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Dealer Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSellingRate}
                    onChange={(e) => setFormSellingRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Initial Stock (PCS)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Reorder Level</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Unit Wt (KG)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <PhotoCaptureField
                label="Variant Product Photograph"
                value={formImageUrl}
                onChange={setFormImageUrl}
                placeholder="Upload or capture finish & packaging photo"
              />

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg transition-all cursor-pointer"
                >
                  {isSaving ? 'Registering...' : 'Register Color SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COLOR VARIANT SKU (USER DIRECTIVE: ALL DETAILS EDITABLE) */}
      {isEditModalOpen && editingSku && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Edit Color Variant SKU: <span className="font-mono text-orange-400">{editingSku.skuCode}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSku(null);
                }}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSku} className="p-6 space-y-4">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Parent Finished Good Model:</span>
                  <span className="font-bold text-white">
                    {products.find((p) => p.id === editingSku.productId)?.name || 'Finished Good'} (
                    {products.find((p) => p.id === editingSku.productId)?.code})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: getColorHex(editColorName) }}
                  />
                  <span className="font-semibold text-slate-200">{editColorName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Color Variant Name</label>
                  <input
                    type="text"
                    required
                    value={editColorName}
                    onChange={(e) => setEditColorName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Unique SKU Code</label>
                  <input
                    type="text"
                    required
                    value={editSkuCode}
                    onChange={(e) => setEditSkuCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-orange-400 outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Purchase Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPurchaseRate}
                    onChange={(e) => setEditPurchaseRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Dealer Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editSellingRate}
                    onChange={(e) => setEditSellingRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Current Stock (PCS)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editStockQuantity}
                    onChange={(e) => setEditStockQuantity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Reorder Level</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editMinStockLevel}
                    onChange={(e) => setEditMinStockLevel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Unit Weight (KG)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Variant Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (In Production)</option>
                    <option value="INACTIVE">INACTIVE (Discontinued)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Barcode</label>
                  <input
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">QR Code</label>
                  <input
                    type="text"
                    value={editQrCode}
                    onChange={(e) => setEditQrCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <PhotoCaptureField
                label="Product Finish & Color Photo"
                value={editImageUrl}
                onChange={setEditImageUrl}
                placeholder="Upload or capture finish photo"
              />

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSku(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION POPUP (USER DIRECTIVE: CONFIRMATION POPUP BEFORE DELETE) */}
      {isDeleteModalOpen && deleteCandidateSku && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Color Variant SKU?</h3>
                <p className="text-xs text-rose-300 font-semibold">क्या आप इस Color Variant SKU को हटाना चाहते हैं?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">SKU Code:</span>
                <span className="font-mono font-bold text-orange-400">{deleteCandidateSku.skuCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Color Name:</span>
                <span className="font-bold text-white">{deleteCandidateSku.colorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stock:</span>
                <span className="font-mono font-bold text-emerald-400">{deleteCandidateSku.stockQuantity} PCS</span>
              </div>
            </div>

            {Number(deleteCandidateSku.stockQuantity) > 0 && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Note:</strong> This SKU currently holds {deleteCandidateSku.stockQuantity} units in physical inventory. Deleting it will mark it as INACTIVE to protect historical balance records.
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteCandidateSku(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Yes, Delete SKU (हटाएं)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADJUST STOCK */}
      {isStockModalOpen && selectedSku && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-orange-400" />
                Physical Stock Adjustment: {selectedSku.skuCode}
              </h2>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 block">Color Variant:</span>
                <span className="font-bold text-white text-sm">{selectedSku.colorName}</span>
                <span className="text-slate-400 block mt-2">Current System Balance:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedSku.stockQuantity} PCS</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Physical Verified Count</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Reason / Audit Justification</label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g. Month-end floor audit, damaged during assembly"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg transition-all cursor-pointer"
                >
                  Confirm Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
