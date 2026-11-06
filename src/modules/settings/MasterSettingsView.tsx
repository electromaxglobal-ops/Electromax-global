import React, { useState } from 'react';
import {
  Settings,
  Layers,
  FileText,
  MessageSquare,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Sliders,
  Bell,
  Save,
  Tag,
} from 'lucide-react';
import { ProductCategory } from '../../types/erp.ts';

interface MasterSettingsProps {
  categories: ProductCategory[];
  onRefreshCategories: () => Promise<void>;
}

interface CustomField {
  id: string;
  module: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'DATE' | 'BOOLEAN';
  required: boolean;
  options?: string[];
}

export const MasterSettingsView: React.FC<MasterSettingsProps> = ({
  categories,
  onRefreshCategories,
}) => {
  const [activeSection, setActiveSection] = useState<'CATEGORIES' | 'NUMBERING' | 'TEMPLATES' | 'GATEWAY' | 'FIELDS'>('CATEGORIES');
  const [successMsg, setSuccessMsg] = useState('');

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editCatForm, setEditCatForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const handleOpenEditCategory = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setEditCatForm({
      name: cat.name,
      code: cat.code,
      description: cat.description || '',
    });
    setShowEditCatModal(true);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCatForm),
      });
      if (res.ok) {
        setShowEditCatModal(false);
        setEditingCategory(null);
        await onRefreshCategories();
        setSuccessMsg(`Category ${editCatForm.name} updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update category');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (cat: ProductCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}" (${cat.code})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete category');
        return;
      }
      await onRefreshCategories();
      setSuccessMsg(data.message || 'Category removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Custom Fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: '1', module: 'PRODUCTS', name: 'warranty_months', label: 'Warranty Duration (Months)', type: 'NUMBER', required: true },
    { id: '2', module: 'PRODUCTS', name: 'power_rating_watts', label: 'Power Consumption (Watts)', type: 'NUMBER', required: false },
    { id: '3', module: 'CUSTOMERS', name: 'dealer_tier', label: 'Distributor Tier Class', type: 'DROPDOWN', required: true, options: ['Tier-1 (Super Stockist)', 'Tier-2 (Wholesale)', 'Tier-3 (Retailer)'] },
    { id: '4', module: 'DISPATCH', name: 'e_way_bill_auth_mode', label: 'E-Way Bill Generation Source', type: 'TEXT', required: false },
  ]);

  const [newField, setNewField] = useState<CustomField>({
    id: '',
    module: 'PRODUCTS',
    name: '',
    label: '',
    type: 'TEXT',
    required: false,
  });

  // Notification templates
  const [templates, setTemplates] = useState({
    whatsappAdvanceReq: 'Dear {CUSTOMER_NAME}, your Proforma Invoice {PI_NO} from Electromax Global has been generated for ₹{TOTAL_AMOUNT}. Kindly pay the 30% advance of ₹{ADVANCE_AMOUNT} to start production: {PAYMENT_LINK}. Founder: Mr. Sushil Goyal.',
    whatsappDispatch: 'Dear {CUSTOMER_NAME}, your consignment {ORDER_NO} has been dispatched via {TRANSPORTER_NAME} with Bilty/LR {LR_NO}. Track: {TRACKING_LINK}. Electromax Global, Jaipur.',
    emailPoSupplier: 'Respected Vendor, please find attached official Purchase Order {PO_NO} for {ITEM_NAME}. Kindly acknowledge delivery timeline. Electromax Global Procurement.',
  });

  // Document Numbering
  const [docConfig, setDocConfig] = useState({
    quotationPrefix: 'EMG/QT/26-27/',
    piPrefix: 'EMG/PI/26-27/',
    soPrefix: 'EMG/SO/26-27/',
    poPrefix: 'EMG/PO/26-27/',
    challanPrefix: 'EMG/DC/26-27/',
    dispatchPrefix: 'EMG/DSP/26-27/',
    invoicePrefix: 'EMG/INV/26-27/',
  });

  // Payment Gateway Config
  const [gatewayConfig, setGatewayConfig] = useState({
    provider: 'Razorpay',
    keyId: 'rzp_live_electromax_global',
    keySecret: '••••••••••••••••••••••••••••',
    defaultAdvancePercent: 30,
    webhookSecret: '••••••••••••••••••••••••••••',
    autoVerifyWebhook: true,
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryCode) return;
    setIsAddingCat(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, code: newCategoryCode.toUpperCase() }),
      });
      if (res.ok) {
        setNewCategoryName('');
        setNewCategoryCode('');
        await onRefreshCategories();
        setSuccessMsg('New appliance category added successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add category');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name || !newField.label) return;
    setCustomFields([...customFields, { ...newField, id: String(Date.now()) }]);
    setNewField({
      id: '',
      module: 'PRODUCTS',
      name: '',
      label: '',
      type: 'TEXT',
      required: false,
    });
    setSuccessMsg('Custom field added to dynamic entity schema');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Admin Master Settings & Custom Field Builder
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Zero Code Configuration
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Complete control to configure product categories, document numbering prefixes, notification templates, payment gateways, and custom data fields without coding.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-6">
        {[
          { id: 'CATEGORIES', label: 'Product Categories', icon: Layers },
          { id: 'NUMBERING', label: 'Document Numbering Series', icon: FileText },
          { id: 'TEMPLATES', label: 'WhatsApp & Email Templates', icon: MessageSquare },
          { id: 'GATEWAY', label: 'Payment Gateway (Razorpay)', icon: CreditCard },
          { id: 'FIELDS', label: 'Dynamic Custom Field Builder', icon: Sliders },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeSection === tab.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Categories */}
      {activeSection === 'CATEGORIES' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Appliance & Component Categories ({categories.length})
              </h3>
              <p className="text-xs text-slate-400">
                Categories are available across the product master, inventory, and BOM costing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="font-mono text-[10px] text-orange-500">Code: {c.code}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditCategory(c)}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c)}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Category Modal */}
          {showEditCatModal && editingCategory && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Edit Category ({editingCategory.code})
                  </h3>
                  <button onClick={() => setShowEditCatModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSaveEditCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={editCatForm.name}
                      onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Short Code</label>
                    <input
                      type="text"
                      required
                      value={editCatForm.code}
                      onChange={(e) => setEditCatForm({ ...editCatForm, code: e.target.value.toUpperCase() })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Description / Notes</label>
                    <textarea
                      value={editCatForm.description}
                      onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEditCatModal(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold"
                    >
                      Update Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-orange-500" /> Add New Category
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immersion Rod"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Short Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IR"
                  value={newCategoryCode}
                  onChange={(e) => setNewCategoryCode(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAddingCat}
                  className="w-full p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer transition-colors"
                >
                  {isAddingCat ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Section 2: Document Series */}
      {activeSection === 'NUMBERING' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Document Numbering & Series Prefixes (FY 2026-27)
            </h3>
            <p className="text-xs text-slate-400">
              Customize commercial document numbering formats for GST and audits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Object.entries(docConfig).map(([k, v]) => (
              <div key={k}>
                <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  {k.replace('Prefix', '')} Numbering Prefix
                </label>
                <input
                  type="text"
                  value={v}
                  onChange={(e) => setDocConfig({ ...docConfig, [k]: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSuccessMsg('Document numbering formats updated');
                setTimeout(() => setSuccessMsg(''), 3000);
              }}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Numbering Rules
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Templates */}
      {activeSection === 'TEMPLATES' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              WhatsApp & Email Automated Notification Templates
            </h3>
            <p className="text-xs text-slate-400">
              Supported dynamic tags: <code>{'{CUSTOMER_NAME}'}</code>, <code>{'{ORDER_NO}'}</code>, <code>{'{TOTAL_AMOUNT}'}</code>, <code>{'{ADVANCE_AMOUNT}'}</code>, <code>{'{TRACKING_LINK}'}</code>
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                WhatsApp: Proforma Invoice & 30% Advance Payment Prompt
              </label>
              <textarea
                rows={3}
                value={templates.whatsappAdvanceReq}
                onChange={(e) => setTemplates({ ...templates, whatsappAdvanceReq: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                WhatsApp: Goods Dispatch Confirmation & Transporter LR/Bilty
              </label>
              <textarea
                rows={3}
                value={templates.whatsappDispatch}
                onChange={(e) => setTemplates({ ...templates, whatsappDispatch: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Email: Official Purchase Order Delivery Instruction to Supplier
              </label>
              <textarea
                rows={3}
                value={templates.emailPoSupplier}
                onChange={(e) => setTemplates({ ...templates, emailPoSupplier: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSuccessMsg('Communication templates saved successfully');
                setTimeout(() => setSuccessMsg(''), 3000);
              }}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Templates
            </button>
          </div>
        </div>
      )}

      {/* Section 4: Payment Gateway */}
      {activeSection === 'GATEWAY' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Razorpay Enterprise Payment Gateway Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Configure API keys, webhooks, and default advance percentages for automatic order generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Gateway Provider</label>
              <input
                type="text"
                disabled
                value={gatewayConfig.provider}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Default Advance Payment Percentage (%)</label>
              <input
                type="number"
                value={gatewayConfig.defaultAdvancePercent}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, defaultAdvancePercent: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-orange-500 font-extrabold text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={gatewayConfig.keyId}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, keyId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                value={gatewayConfig.keySecret}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, keySecret: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="webhookVerify"
              checked={gatewayConfig.autoVerifyWebhook}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, autoVerifyWebhook: e.target.checked })}
              className="rounded text-orange-500"
            />
            <label htmlFor="webhookVerify" className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Enable strict server-side cryptographic signature verification on webhook receipt
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSuccessMsg('Payment gateway configuration saved');
                setTimeout(() => setSuccessMsg(''), 3000);
              }}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Gateway Settings
            </button>
          </div>
        </div>
      )}

      {/* Section 5: Dynamic Custom Field Builder */}
      {activeSection === 'FIELDS' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dynamic Custom Field Builder (Zero-Code Entity Extensibility)
            </h3>
            <p className="text-xs text-slate-400">
              Add new fields to Products, Customers, Purchase Orders, or Dispatches without altering database schema.
            </p>
          </div>

          {/* Existing Custom Fields */}
          <div className="space-y-3">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-orange-500">
                    {field.module}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{field.label}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">({field.name})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Type: {field.type}
                  </span>
                  {field.required && (
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Field Form */}
          <form onSubmit={handleAddCustomField} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-orange-500" /> Create New Field
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Target Entity / Module</label>
                <select
                  value={newField.module}
                  onChange={(e) => setNewField({ ...newField, module: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PRODUCTS">Products & SKUs</option>
                  <option value="CUSTOMERS">Customers & Leads</option>
                  <option value="PURCHASE">Purchase Orders</option>
                  <option value="DISPATCH">Dispatch & Bilty</option>
                  <option value="HRMS">Employees & Payroll</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Field Label (Display)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BIS Certification No"
                  value={newField.label}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Field Identifier (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="bis_cert_number"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Data Type</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="TEXT">Text String</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="DROPDOWN">Dropdown List</option>
                  <option value="DATE">Date Picker</option>
                  <option value="BOOLEAN">Checkbox (Yes/No)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded text-orange-500"
                />
                <span>Mandatory / Required Field</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
              >
                Add Field
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
