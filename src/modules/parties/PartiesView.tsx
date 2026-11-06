import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  CheckCircle2,
  Building,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  AlertCircle,
} from 'lucide-react';
import { Party } from '../../types/erp.ts';
import { formatINR } from '../../utils/formatters.ts';

interface PartiesViewProps {
  parties: Party[];
  onAddParty: (partyData: Partial<Party>) => Promise<void>;
  onEditParty?: (id: number, partyData: Partial<Party>) => Promise<void>;
  onDeleteParty?: (id: number) => Promise<void>;
}

export const PartiesView: React.FC<PartiesViewProps> = ({
  parties,
  onAddParty,
  onEditParty,
  onDeleteParty,
}) => {
  const [partyFilter, setPartyFilter] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCandidateParty, setDeleteCandidateParty] = useState<Party | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Form
  const [formData, setFormData] = useState({
    partyType: 'CUSTOMER' as 'CUSTOMER' | 'SUPPLIER' | 'BOTH',
    code: '',
    legalName: '',
    tradeName: '',
    gstin: '',
    pan: '',
    stateCode: '08',
    stateName: 'Rajasthan',
    email: '',
    phone: '',
    billingAddress: '',
    creditLimit: '2000000',
    creditDays: 30,
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    partyType: 'CUSTOMER' as 'CUSTOMER' | 'SUPPLIER' | 'BOTH',
    code: '',
    legalName: '',
    tradeName: '',
    gstin: '',
    pan: '',
    stateCode: '08',
    stateName: 'Rajasthan',
    email: '',
    phone: '',
    billingAddress: '',
    creditLimit: '2000000',
    creditDays: 30,
  });

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddParty(formData);
      setShowAddModal(false);
      setFormData({
        partyType: 'CUSTOMER',
        code: '',
        legalName: '',
        tradeName: '',
        gstin: '',
        pan: '',
        stateCode: '08',
        stateName: 'Rajasthan',
        email: '',
        phone: '',
        billingAddress: '',
        creditLimit: '2000000',
        creditDays: 30,
      });
      showToast('Party profile created successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to create party', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (p: Party) => {
    setEditingParty(p);
    setEditFormData({
      partyType: p.partyType as any,
      code: p.code,
      legalName: p.legalName,
      tradeName: p.tradeName || '',
      gstin: p.gstin || '',
      pan: p.pan || '',
      stateCode: p.stateCode || '08',
      stateName: p.stateName || 'Rajasthan',
      email: p.email || '',
      phone: p.phone || '',
      billingAddress: p.billingAddress || '',
      creditLimit: String(p.creditLimit || '2000000'),
      creditDays: Number(p.creditDays || 30),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParty || !onEditParty) return;
    setIsSaving(true);
    try {
      await onEditParty(editingParty.id, editFormData);
      setIsEditModalOpen(false);
      setEditingParty(null);
      showToast('Party details updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to update party', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (p: Party) => {
    setDeleteCandidateParty(p);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateParty || !onDeleteParty) return;
    setIsDeleting(true);
    try {
      await onDeleteParty(deleteCandidateParty.id);
      setIsDeleteModalOpen(false);
      setDeleteCandidateParty(null);
      showToast('Party record removed successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete party', true);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = parties.filter((p) => {
    const matchesType = partyFilter === 'ALL' || p.partyType === partyFilter || p.partyType === 'BOTH';
    const matchesSearch =
      search === '' ||
      p.legalName.toLowerCase().includes(search.toLowerCase()) ||
      (p.tradeName && p.tradeName.toLowerCase().includes(search.toLowerCase())) ||
      (p.gstin && p.gstin.toLowerCase().includes(search.toLowerCase())) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Handshake className="w-4 h-4 text-orange-500" />
              <span>Commercial Parties: Suppliers & Wholesale Distributors</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete customer accounts, raw material suppliers, GSTINs, and credit limits. Full <strong>Edit and Delete</strong> controls enabled.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commercial Party</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPartyFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                partyFilter === 'ALL'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              All Parties ({parties.length})
            </button>
            <button
              onClick={() => setPartyFilter('CUSTOMER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                partyFilter === 'CUSTOMER'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Customers & Dealers
            </button>
            <button
              onClick={() => setPartyFilter('SUPPLIER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                partyFilter === 'SUPPLIER'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Suppliers & Vendors
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by legal name, trade name, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.partyType === 'SUPPLIER'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {p.partyType === 'SUPPLIER' ? 'SUPPLIER' : 'DISTRIBUTOR'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{p.code}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {p.tradeName || p.legalName}
                  </h3>
                  <p className="text-[11px] text-slate-400">{p.legalName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">GSTIN</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                    {p.gstin || 'UNREGISTERED'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">State Code</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {p.stateName} ({p.stateCode})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Credit Terms</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatINR(p.creditLimit)} • {p.creditDays || 30} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate block">
                    {p.phone || p.email || 'Jaipur Office'}
                  </span>
                </div>
              </div>

              {p.billingAddress && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span className="line-clamp-1">{p.billingAddress}</span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(p)}
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Edit Commercial Party Profile"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenDelete(p)}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Delete Commercial Party"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Commercial Party</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Party Type</label>
                  <select
                    value={formData.partyType}
                    onChange={(e) => setFormData({ ...formData, partyType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="CUSTOMER">Wholesale Distributor / Customer</option>
                    <option value="SUPPLIER">Raw Material Supplier</option>
                    <option value="BOTH">Both (Customer & Supplier)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Party Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CUST-KOTA-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Trade Name / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Shekhawati Electricals"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Full Registered Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shekhawati Electricals & Appliance Mart LLP"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="08AABCS1234M1Z2"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">State</label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = code === '08' ? 'Rajasthan' : code === '07' ? 'Delhi' : code === '24' ? 'Gujarat' : 'Haryana';
                      setFormData({ ...formData, stateCode: code, stateName: name });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="08">Rajasthan (08)</option>
                    <option value="07">Delhi (07)</option>
                    <option value="24">Gujarat (24)</option>
                    <option value="06">Haryana (06)</option>
                    <option value="09">Uttar Pradesh (09)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="text"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Credit Period (Days)</label>
                  <input
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => setFormData({ ...formData, creditDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Billing & Delivery Address</label>
                <input
                  type="text"
                  placeholder="Gumanpura Market, Kota, Rajasthan 324007"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                  {isSaving ? 'Creating...' : 'Register Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Party Modal */}
      {isEditModalOpen && editingParty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-500" />
                <span>Edit Party: {editingParty.code}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Party Type</label>
                  <select
                    value={editFormData.partyType}
                    onChange={(e) => setEditFormData({ ...editFormData, partyType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="CUSTOMER">Wholesale Distributor / Customer</option>
                    <option value="SUPPLIER">Raw Material Supplier</option>
                    <option value="BOTH">Both (Customer & Supplier)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Party Code</label>
                  <input
                    type="text"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Trade Name / Brand</label>
                <input
                  type="text"
                  value={editFormData.tradeName}
                  onChange={(e) => setEditFormData({ ...editFormData, tradeName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Full Registered Legal Name</label>
                <input
                  type="text"
                  value={editFormData.legalName}
                  onChange={(e) => setEditFormData({ ...editFormData, legalName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editFormData.gstin}
                    onChange={(e) => setEditFormData({ ...editFormData, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">State</label>
                  <select
                    value={editFormData.stateCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = code === '08' ? 'Rajasthan' : code === '07' ? 'Delhi' : code === '24' ? 'Gujarat' : 'Haryana';
                      setEditFormData({ ...editFormData, stateCode: code, stateName: name });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold"
                  >
                    <option value="08">Rajasthan (08)</option>
                    <option value="07">Delhi (07)</option>
                    <option value="24">Gujarat (24)</option>
                    <option value="06">Haryana (06)</option>
                    <option value="09">Uttar Pradesh (09)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="text"
                    value={editFormData.creditLimit}
                    onChange={(e) => setEditFormData({ ...editFormData, creditLimit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Credit Period (Days)</label>
                  <input
                    type="number"
                    value={editFormData.creditDays}
                    onChange={(e) => setEditFormData({ ...editFormData, creditDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Billing & Delivery Address</label>
                <input
                  type="text"
                  value={editFormData.billingAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, billingAddress: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Party Confirmation Modal */}
      {isDeleteModalOpen && deleteCandidateParty && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Commercial Party?</h3>
                <p className="text-xs text-rose-300 font-semibold">क्या आप इस पार्टी को हटाना चाहते हैं?</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Party Code:</span>
                <span className="font-mono font-bold text-orange-400">{deleteCandidateParty.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Legal Name:</span>
                <span className="font-bold text-white">{deleteCandidateParty.legalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono text-slate-300">{deleteCandidateParty.gstin || 'UNREGISTERED'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteCandidateParty(null);
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
                {isDeleting ? 'Deleting...' : 'Yes, Delete Party (हटाएं)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
