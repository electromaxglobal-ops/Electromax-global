import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Flame,
  Coffee,
  Fan,
  Wind,
  Maximize2,
  Zap,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  IndianRupee,
  Edit2,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types/erp.ts';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';

interface ProductCatalogProps {
  products: Product[];
  categories: ProductCategory[];
  onAddProduct: (prodData: Partial<Product>) => Promise<void>;
  onEditProduct?: (id: number, prodData: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (id: number) => Promise<void>;
  onQuickAdjust: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickAdjust,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 1,
    brand: 'Snow Wave',
    code: '',
    name: '',
    itemType: 'FINISHED_GOOD' as any,
    hsnCode: '8516',
    gstRate: '18.00',
    uom: 'PCS',
    minStockLevel: 50,
    maxStockLevel: 2000,
    reorderPoint: 100,
    standardCost: '800.00',
    mrp: '1999.00',
    dealerPrice: '1250.00',
    specifications: '',
    imageUrl: '',
  });

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'RH': return Flame;
      case 'EK': return Coffee;
      case 'PF': return Fan;
      case 'TF': return Wind;
      case 'WF': return Maximize2;
      case 'MB': return Zap;
      default: return Boxes;
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || String(p.categoryId) === selectedCat;
    const matchesType = selectedType === 'ALL' || p.itemType === selectedType;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesType && matchesSearch;
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      categoryId: categories[0]?.id || 1,
      brand: 'Snow Wave',
      code: '',
      name: '',
      itemType: 'FINISHED_GOOD',
      hsnCode: '8516',
      gstRate: '18.00',
      uom: 'PCS',
      minStockLevel: 50,
      maxStockLevel: 2000,
      reorderPoint: 100,
      standardCost: '800.00',
      mrp: '1999.00',
      dealerPrice: '1250.00',
      specifications: '',
      imageUrl: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      categoryId: p.categoryId,
      brand: p.brand || 'Snow Wave',
      code: p.code,
      name: p.name,
      itemType: p.itemType,
      hsnCode: p.hsnCode,
      gstRate: p.gstRate,
      uom: p.uom,
      minStockLevel: p.minStockLevel || 50,
      maxStockLevel: p.maxStockLevel || 2000,
      reorderPoint: p.reorderPoint || 100,
      standardCost: p.standardCost || '0.00',
      mrp: p.mrp || '0.00',
      dealerPrice: p.dealerPrice || '0.00',
      specifications: p.specifications || '',
      imageUrl: p.imageUrl || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to deactivate or delete product "${name}"?`)) return;
    try {
      if (onDeleteProduct) {
        await onDeleteProduct(id);
      } else {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || 'Failed to delete product');
          return;
        }
      }
      setSuccessMsg(`Product "${name}" removed from active catalog`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct && onEditProduct) {
        await onEditProduct(editingProduct.id, formData);
        setSuccessMsg('Product model updated successfully');
      } else {
        await onAddProduct(formData);
        setSuccessMsg('Product model added successfully to catalog');
      }
      setShowAddModal(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Product Master & Appliance Model Catalog
              </h1>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                Electromax Global
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Centralized definition of Room Heaters, Electric Kettles, Pedestal, Table & Wall Fans, and Mosquito Bats with HSN codes, GST slabs, and colour-wise SKUs.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product Model
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="ALL">All Item Types</option>
            <option value="FINISHED_GOOD">Finished Goods (Appliances)</option>
            <option value="RAW_MATERIAL">Raw Materials</option>
            <option value="SEMI_FINISHED">Semi-Finished</option>
            <option value="PACKING">Packing Materials</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, model, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Product List Table or Empty State */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl mx-auto flex items-center justify-center border border-orange-500/20">
              <Boxes className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Products in Catalog (Clean Blank State)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your database is ready for real Electromax Global production data. Add your first appliance model (Room Heater, Electric Kettle, Pedestal Fan, Table Fan, Wall Fan, or Mosquito Bat).
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Product Model
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">SKU / Model</th>
                  <th className="py-3 px-4">Brand & Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">HSN / GST</th>
                  <th className="py-3 px-4 text-right">Standard Cost</th>
                  <th className="py-3 px-4 text-right">Dealer Price</th>
                  <th className="py-3 px-4 text-right">MRP</th>
                  <th className="py-3 px-4 text-right">Current Stock</th>
                  <th className="py-3 px-4 text-right">Valuation</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredProducts.map((p) => {
                  const Icon = getCategoryIcon(p.category?.code || '');
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {p.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                          ) : (
                            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Brand: <span className="text-orange-500 font-semibold">{p.brand}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {p.category?.name || 'Appliance'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                        <div>HSN: {p.hsnCode}</div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {p.gstRate}% GST
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                        {formatINR(Number(p.standardCost) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {formatINR(Number(p.dealerPrice) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 line-through text-[11px] whitespace-nowrap">
                        {formatINR(Number(p.mrp) || 0)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatIndianNumber(p.totalStock || 0)} {p.uom}
                        </div>
                        {p.isLowStock && (
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">
                            Reorder Alert
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                        {formatINR(p.stockValuation || 0)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onQuickAdjust(p)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-orange-500 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 rounded text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Deactivate / Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" />
                <span>{editingProduct ? 'Edit Product Model' : 'Add New Product Model'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Product Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">SKU / Model Code</label>
                <input
                  type="text"
                  placeholder="e.g. SW-RH-OIL11FIN"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Full Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Snow Wave 11-Fin Oil Filled Radiator Heater"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Item Type</label>
                <select
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                >
                  <option value="FINISHED_GOOD">Finished Good (Appliance)</option>
                  <option value="RAW_MATERIAL">Raw Material / Component</option>
                  <option value="SEMI_FINISHED">Semi-Finished Assembly</option>
                  <option value="SPARE_PARTS">Spare Part</option>
                  <option value="PACKING">Packing Material</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">HSN Code (Indian GST)</label>
                <input
                  type="text"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">GST Tax Rate (%)</label>
                <select
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                >
                  <option value="18.00">18% (9% CGST + 9% SGST)</option>
                  <option value="12.00">12% (6% CGST + 6% SGST)</option>
                  <option value="28.00">28% (14% CGST + 14% SGST)</option>
                  <option value="5.00">5% (2.5% CGST + 2.5% SGST)</option>
                  <option value="0.00">0% (Nil Rated / Exempt)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Unit of Measurement (UOM)</label>
                <select
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="SET">SET (Unit Sets)</option>
                  <option value="BOX">BOX (Cartons)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="MTR">MTR (Meters)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Standard Production Cost (₹)</label>
                <input
                  type="text"
                  value={formData.standardCost}
                  onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Dealer Wholesale Price (₹)</label>
                <input
                  type="text"
                  value={formData.dealerPrice}
                  onChange={(e) => setFormData({ ...formData, dealerPrice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Maximum Retail Price MRP (₹)</label>
                <input
                  type="text"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Reorder Alert Level</label>
                <input
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              {/* Photo Upload */}
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Product Photograph (Camera / Desktop Upload)</label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-4 h-4 text-orange-500" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                  {formData.imageUrl && (
                    <div className="flex items-center gap-2">
                      <img src={formData.imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-orange-500" />
                      <span className="text-[11px] text-emerald-500 font-bold">Image Loaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Technical Specifications & Features</label>
                <textarea
                  rows={2}
                  placeholder="Heating element, wattage, speed settings, thermal cut-off, BIS certifications..."
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
