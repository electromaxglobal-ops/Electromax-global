import React, { useState } from 'react';
import {
  Building2,
  Factory,
  Warehouse,
  Plus,
  Save,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Layers,
  ShieldAlert,
  Coins,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Company, Branch, Warehouse as WarehouseType } from '../../types/erp.ts';
import { formatIndianNumber } from '../../utils/formatters.ts';

interface CompanyManagementProps {
  company: Company | null;
  branches: Branch[];
  warehouses: WarehouseType[];
  onUpdateCompany: (updated: Partial<Company>) => Promise<void>;
  onAddBranch: (branchData: Partial<Branch>) => Promise<void>;
  onAddWarehouse: (warehouseData: Partial<WarehouseType>) => Promise<void>;
  onRefreshData?: () => void;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({
  company,
  branches,
  warehouses,
  onUpdateCompany,
  onAddBranch,
  onAddWarehouse,
  onRefreshData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    legalName: company?.legalName || '',
    tradeName: company?.tradeName || '',
    gstin: company?.gstin || '',
    pan: company?.pan || '',
    cin: company?.cin || '',
    email: company?.email || '',
    phone: company?.phone || '',
    address: company?.address || '',
    city: company?.city || 'Jaipur',
    stateCode: company?.stateCode || '08',
    stateName: company?.stateName || 'Rajasthan',
    pincode: company?.pincode || '302013',
  });

  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    code: '',
    name: '',
    branchType: 'FACTORY' as 'FACTORY' | 'HEAD_OFFICE' | 'REGIONAL_OFFICE',
    gstin: company?.gstin || '',
    address: '',
    stateCode: '08',
    isFactory: true,
    isActive: true,
  });

  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [whForm, setWhForm] = useState({
    branchId: branches[0]?.id || 1,
    code: '',
    name: '',
    warehouseType: 'FINISHED_GOODS' as 'FINISHED_GOODS' | 'RAW_MATERIALS' | 'WIP' | 'SPARE_PARTS',
    location: '',
    capacitySqFt: 10000,
    managerName: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCompany(formData);
      setIsEditing(false);
      setSuccessMsg('Company profile updated successfully in PostgreSQL');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      code: '',
      name: '',
      branchType: 'FACTORY',
      gstin: company?.gstin || '',
      address: '',
      stateCode: '08',
      isFactory: true,
      isActive: true,
    });
    setShowAddBranchModal(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchForm({
      code: b.code,
      name: b.name,
      branchType: b.branchType as any,
      gstin: b.gstin || company?.gstin || '',
      address: b.address,
      stateCode: b.stateCode || '08',
      isFactory: b.isFactory ?? true,
      isActive: b.isActive ?? true,
    });
    setShowAddBranchModal(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBranch) {
        const res = await fetch(`/api/branches/${editingBranch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(branchForm),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update branch');
        }
        setSuccessMsg(`Branch ${branchForm.name} updated successfully.`);
      } else {
        await onAddBranch(branchForm);
        setSuccessMsg('New factory plant added successfully');
      }
      setShowAddBranchModal(false);
      setTimeout(() => setSuccessMsg(''), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save branch');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async (b: Branch) => {
    if (b.isHeadOffice) {
      alert('Cannot delete corporate Head Office branch.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete or deactivate branch "${b.name}" (${b.code})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/branches/${b.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete branch');
      }
      setSuccessMsg(data.message || 'Branch processed successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddWarehouse(whForm);
      setShowAddWhModal(false);
      setWhForm({ branchId: branches[0]?.id || 1, code: '', name: '', warehouseType: 'FINISHED_GOODS', location: '', capacitySqFt: 10000, managerName: '' });
      setSuccessMsg('Warehouse created successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add warehouse');
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

      {/* Company Legal Profile Card */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/electromax-logo.png"
                alt="ELECTROMAX GLOBAL Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
                  ELECTROMAX GLOBAL
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Active Legal Entity
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {company?.legalName || 'Electromax Global Enterprises Pvt. Ltd.'}
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-0.5 flex items-center gap-2">
                <span>Founder & Director: <strong>Mr. Sushil Goyal</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-normal">Jaipur, Rajasthan, India</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Trade Name</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Legal Name</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">GSTIN (Rajasthan 08)</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">CIN</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Official Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Registered Factory / HQ Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">City & State</label>
              <input
                type="text"
                value={`${formData.city}, ${formData.stateName} (${formData.stateCode})`}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Registered Office & Plants</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed block mt-0.5">
                  {company?.address}, {company?.city}, {company?.stateName} - {company?.pincode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Official Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {company?.email} • {company?.phone}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">GSTIN (Rajasthan)</span>
                <span className="font-mono font-bold text-sm text-orange-600 dark:text-orange-400 block mt-0.5">
                  {company?.gstin}
                </span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">PAN</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {company?.pan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">CIN</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {company?.cin || 'U31909RJ2018PTC062145'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Indian Financial Year</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  01 April 2026 to 31 March 2027
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Founder & Director</span>
                <span className="font-bold text-orange-500 block mt-0.5">
                  Mr. Sushil Goyal
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Functional Currency</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  INR (₹) — Indian Rupee
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* About Us & Corporate Leadership Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B192C] to-[#1E3E62] rounded-xl border border-slate-800 p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-white/20 shrink-0">
              <img
                src="/electromax-logo.png"
                alt="ELECTROMAX GLOBAL"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
                Corporate Governance & About Us
              </span>
              <h2 className="text-lg font-black tracking-wide">
                ELECTROMAX GLOBAL
              </h2>
              <p className="text-xs text-slate-300">
                Manufacturing, OEM, Wholesale & Distribution
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Founder & Director</div>
            <div className="text-sm font-extrabold text-orange-400">Mr. Sushil Goyal</div>
            <div className="text-[11px] text-slate-300">Jaipur, Rajasthan, India</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>Vision & Leadership</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Under the strategic leadership of <strong>Mr. Sushil Goyal</strong>, Electromax Global has established itself as an engineering and manufacturing force in small domestic appliances across Northern and Western India.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>Manufacturing Hub</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Operating precision assembly lines in Vishwakarma Industrial Area (VKI), Jaipur, Rajasthan, producing Snow Wave brand room heaters, electric kettles, pedestal, table, and wall fans, and rechargeable mosquito bats.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>Distribution & OEM</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Serving hundreds of wholesale distributors and institutional clients across India with statutory Indian GST compliance, weighted-average inventory accounting, and strict quality verification.
            </p>
          </div>
        </div>
      </div>

      {/* Branches & Factory Plants Section */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Factory className="w-4 h-4 text-orange-500" />
              <span>Branches & Manufacturing Plants</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multiple factories and assembly lines across Vishwakarma Industrial Area (VKI), Jaipur
            </p>
          </div>
          <button
            onClick={handleOpenAddBranch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plant / Branch</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Branch / Plant Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Location Address</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{b.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{b.name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.branchType === 'HEAD_OFFICE'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                    }`}>
                      {b.branchType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{b.gstin || company?.gstin}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{b.address}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${b.isActive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditBranch(b)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 cursor-pointer"
                      title="Edit Branch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!b.isHeadOffice && (
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                        title="Delete / Deactivate Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouses and Bins Section */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-orange-500" />
              <span>Multi-Warehouse Inventory Hubs</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Raw materials, finished goods, and shop floor WIP storage depots
            </p>
          </div>
          <button
            onClick={() => setShowAddWhModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Warehouse</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-orange-500 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                    {wh.code}
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">
                    {wh.name}
                  </h3>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div>Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{wh.warehouseType.replace('_', ' ')}</span></div>
                <div>Capacity: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatIndianNumber(wh.capacitySqFt)} sq.ft</span></div>
                <div>Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{wh.location || 'Central Floor'}</span></div>
                <div>Manager: <span className="font-semibold text-slate-700 dark:text-slate-300">{wh.managerName || 'Assigned Lead'}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingBranch ? `Edit Plant / Branch (${editingBranch.code})` : 'Add Factory Plant / Branch'}
            </h3>
            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Plant / Branch Code</label>
                <input
                  type="text"
                  placeholder="e.g. VKI-PLANT3"
                  value={branchForm.code}
                  onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. VKI Unit 3: Injection Molding & Tool Room"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Branch Type</label>
                  <select
                    value={branchForm.branchType}
                    onChange={(e) => setBranchForm({ ...branchForm, branchType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="FACTORY">Manufacturing Factory</option>
                    <option value="HEAD_OFFICE">Corporate Head Office</option>
                    <option value="REGIONAL_OFFICE">Regional Depot / Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Active Status</label>
                  <select
                    value={branchForm.isActive ? 'true' : 'false'}
                    onChange={(e) => setBranchForm({ ...branchForm, isActive: e.target.value === 'true' })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="true">Active Operational</option>
                    <option value="false">Inactive / Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Branch Specific GSTIN</label>
                <input
                  type="text"
                  placeholder="08AABCE9876K1Z2"
                  value={branchForm.gstin}
                  onChange={(e) => setBranchForm({ ...branchForm, gstin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Address in Jaipur</label>
                <input
                  type="text"
                  placeholder="Plot No. 46, VKI Area, Road No. 6, Jaipur"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingBranch ? 'Update Plant Details' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {showAddWhModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Warehouse Depot</h3>
            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Associated Plant / Branch</label>
                <select
                  value={whForm.branchId}
                  onChange={(e) => setWhForm({ ...whForm, branchId: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Warehouse Code</label>
                <input
                  type="text"
                  placeholder="e.g. WH-PACK-01"
                  value={whForm.code}
                  onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Warehouse Name</label>
                <input
                  type="text"
                  placeholder="e.g. Corrugated Packaging & Master Carton Depot"
                  value={whForm.name}
                  onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Type</label>
                  <select
                    value={whForm.warehouseType}
                    onChange={(e) => setWhForm({ ...whForm, warehouseType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="FINISHED_GOODS">Finished Goods</option>
                    <option value="RAW_MATERIALS">Raw Materials</option>
                    <option value="WIP">Shop Floor WIP</option>
                    <option value="SPARE_PARTS">Spare Parts & Warranty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Capacity (Sq. Ft)</label>
                  <input
                    type="number"
                    value={whForm.capacitySqFt}
                    onChange={(e) => setWhForm({ ...whForm, capacitySqFt: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Warehouse In-Charge Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Prajapat"
                  value={whForm.managerName}
                  onChange={(e) => setWhForm({ ...whForm, managerName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {isSaving ? 'Creating...' : 'Create Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
