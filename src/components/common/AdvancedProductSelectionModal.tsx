import React, { useState, useEffect } from 'react';
import {
  Search,
  Boxes,
  Plus,
  CheckCircle2,
  Tag,
  Flame,
  Coffee,
  Fan,
  Wind,
  Maximize2,
  Zap,
  Filter,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types/erp.ts';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';

export interface SelectedItemPayload {
  productId: number;
  productName: string;
  modelCode: string;
  colorName: string;
  skuCode: string;
  hsnCode: string;
  gstRate: number;
  unit: string;
  rate: number;
  quantity: number;
  availableStock: number;
  imageUrl?: string;
  specifications?: string;
}

interface AdvancedProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (item: SelectedItemPayload) => void;
  priceType?: 'SALE' | 'PURCHASE';
}

export const AdvancedProductSelectionModal: React.FC<AdvancedProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  priceType = 'SALE',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; hexCode: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Active Item Configuration before adding
  const [configuredProduct, setConfiguredProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('Jet Black');
  const [selectedQuantity, setSelectedQuantity] = useState(10);
  const [customRate, setCustomRate] = useState<string>('0');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => []),
        fetch('/api/categories').then((r) => r.json()).catch(() => []),
        fetch('/api/colors').then((r) => r.json()).catch(() => []),
      ]).then(([pList, cList, colList]) => {
        setProducts(Array.isArray(pList) ? pList : []);
        setCategories(Array.isArray(cList) ? cList : []);
        setColors(Array.isArray(colList) ? colList : []);
        setLoading(false);
      });
    } else {
      setConfiguredProduct(null);
      setSearch('');
    }
  }, [isOpen]);

  const handlePickProduct = (p: Product) => {
    setConfiguredProduct(p);
    const initialRate =
      priceType === 'SALE'
        ? Number(p.dealerPrice) || Number(p.mrp) || 1250
        : Number(p.standardCost) || 850;
    setCustomRate(String(initialRate));
    setSelectedQuantity(10);
  };

  const handleConfirmAdd = () => {
    if (!configuredProduct) return;
    const colorSuffix = selectedColor.slice(0, 3).toUpperCase();
    const skuCode = `${configuredProduct.code}-${colorSuffix}`;

    const payload: SelectedItemPayload = {
      productId: configuredProduct.id,
      productName: configuredProduct.name,
      modelCode: configuredProduct.code,
      colorName: selectedColor,
      skuCode,
      hsnCode: configuredProduct.hsnCode || '8516',
      gstRate: Number(configuredProduct.gstRate) || 18,
      unit: configuredProduct.uom || 'PCS',
      rate: Number(customRate) || 0,
      quantity: Number(selectedQuantity) || 1,
      availableStock: configuredProduct.totalStock || 0,
      imageUrl: configuredProduct.imageUrl,
      specifications: configuredProduct.specifications,
    };

    onSelectProduct(payload);
    setConfiguredProduct(null);
    onClose();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || String(p.categoryId) === selectedCategory;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.hsnCode && p.hsnCode.includes(search));
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-500/15 text-orange-500 rounded-lg">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select Product / SKU Line Item
              </h3>
              <p className="text-[11px] text-slate-400">
                Search appliances, heating elements, fan models, HSN codes, and color SKUs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Product Name, Model, SKU, HSN, Brand, Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid / List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              Loading Electromax Global product catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
              No matching products found. Try a different search term or add a product in Product Catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const isConfiguring = configuredProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePickProduct(p)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isConfiguring
                        ? 'bg-orange-500/10 border-orange-500 shadow-md ring-1 ring-orange-500'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-orange-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <Boxes className="w-6 h-6 text-orange-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-orange-500">
                            {p.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {p.category?.name || 'Appliance'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-1">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span>HSN: <strong>{p.hsnCode}</strong></span>
                          <span>GST: <strong className="text-emerald-500">{p.gstRate}%</strong></span>
                          <span>Stock: <strong className="text-slate-800 dark:text-slate-200">{formatIndianNumber(p.totalStock || 0)} {p.uom}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {priceType === 'SALE' ? formatINR(Number(p.dealerPrice) || 0) : formatINR(Number(p.standardCost) || 0)}
                      </span>
                      <span className="text-[10px] font-bold text-orange-500">
                        {isConfiguring ? '✓ Selected' : 'Select Item'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Product Configuration Drawer / Footer */}
        {configuredProduct && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Configure Line Item: <strong>{configuredProduct.name}</strong> ({configuredProduct.code})
              </span>
              <span className="text-[11px] text-slate-400">HSN {configuredProduct.hsnCode} • {configuredProduct.gstRate}% GST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Color Variant / SKU</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Jet Black">Jet Black (BLK)</option>
                  <option value="Ivory White">Ivory White (WHT)</option>
                  <option value="Crimson Red">Crimson Red (RED)</option>
                  <option value="Royal Blue">Royal Blue (BLU)</option>
                  <option value="Brushed Steel">Brushed Steel (STL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Quantity ({configuredProduct.uom || 'PCS'})</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Unit Rate (₹) {priceType === 'SALE' ? '(Dealer Price)' : '(Purchase Cost)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-orange-500/20">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Item Line Total (before tax):{' '}
                <strong className="font-mono text-orange-500">
                  {formatINR((Number(selectedQuantity) || 0) * (Number(customRate) || 0))}
                </strong>
              </span>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Item to Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
