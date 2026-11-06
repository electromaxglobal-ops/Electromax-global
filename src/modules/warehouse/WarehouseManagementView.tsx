import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Filter,
  MapPin,
  Boxes,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  QrCode,
  Layers,
  ArrowRight,
  RefreshCw,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { Warehouse, Branch, StockBalance } from '../../types/erp.ts';
import { formatIndianNumber } from '../../utils/formatters.ts';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface WarehouseManagementViewProps {
  warehouses: Warehouse[];
  branches: Branch[];
  onRefresh: () => void;
  onNavigateToStock?: (warehouseId: number) => void;
}

export const WarehouseManagementView: React.FC<WarehouseManagementViewProps> = ({
  warehouses,
  branches,
  onRefresh,
  onNavigateToStock,
}) => {
  const [whList, setWhList] = useState<Warehouse[]>(warehouses || []);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    branchId: branches[0]?.id || 1,
    warehouseType: 'FINISHED_GOODS',
    location: 'VKIA, Jaipur, Rajasthan',
    capacitySqFt: '15000',
    managerName: 'Praveen Sharma',
    photoUrl: '',
    isActive: true,
  });

  useEffect(() => {
    setWhList(warehouses);
  }, [warehouses]);

  const loadWarehouses = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/warehouses');
      if (res.ok) {
        const data = await res.json();
        setWhList(data);
      }
    } catch (err: any) {
      setActionError('Failed to fetch warehouses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: `WH-${String(whList.length + 1).padStart(3, '0')}`,
      name: '',
      branchId: branches[0]?.id || 1,
      warehouseType: 'FINISHED_GOODS',
      location: 'Jaipur, Rajasthan',
      capacitySqFt: '10000',
      managerName: '',
      photoUrl: '',
      isActive: true,
    });
    setEditingWarehouse(null);
    setIsAddModalOpen(true);
    setActionError(null);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      branchId: wh.branchId || branches[0]?.id || 1,
      warehouseType: wh.warehouseType,
      location: wh.location || '',
      capacitySqFt: wh.capacitySqFt ? String(wh.capacitySqFt) : '',
      managerName: wh.managerName || '',
      photoUrl: '',
      isActive: wh.isActive ?? true,
    });
    setIsAddModalOpen(true);
    setActionError(null);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setLoading(true);

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        branchId: Number(formData.branchId),
        warehouseType: formData.warehouseType,
        location: formData.location,
        capacitySqFt: formData.capacitySqFt ? Number(formData.capacitySqFt) : null,
        managerName: formData.managerName,
        isActive: formData.isActive,
      };

      let res;
      if (editingWarehouse) {
        res = await fetch(`/api/warehouses/${editingWarehouse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save warehouse');
      }

      setActionSuccess(editingWarehouse ? 'Warehouse updated successfully!' : 'Warehouse registered successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
      setIsAddModalOpen(false);
      loadWarehouses();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      return;
    }
    setActionError(null);
    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete warehouse');
      }
      setActionSuccess('Warehouse removed successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
      loadWarehouses();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredWarehouses = whList.filter((wh) => {
    const matchesType = selectedType === 'ALL' || wh.warehouseType === selectedType;
    const matchesSearch =
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wh.location && wh.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wh.managerName && wh.managerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalCapacity = whList.reduce((sum, w) => sum + (w.capacitySqFt || 0), 0);
  const activeCount = whList.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs tracking-wider uppercase mb-1">
              <WarehouseIcon className="w-4 h-4" />
              <span>Multi-Warehouse Logistics & Storage Master</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Warehouse Management
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Electromax Global manufacturing plants, finished goods warehouses, raw material yards, and transit depots across Jaipur, Rajasthan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadWarehouses}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add New Warehouse
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Warehouses</span>
            <div className="text-xl font-bold text-white mt-0.5">{whList.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active Locations</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Storage Area</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {formatIndianNumber(totalCapacity)} <span className="text-xs text-slate-400 font-normal">Sq. Ft</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">State & Zone</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">Rajasthan (RJ-08)</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search warehouse by name, code, manager, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Warehouses' },
              { id: 'FINISHED_GOODS', label: 'Finished Goods' },
              { id: 'RAW_MATERIALS', label: 'Raw Materials' },
              { id: 'WIP', label: 'WIP / Assembly' },
              { id: 'PACKING_MATERIAL', label: 'Packing Yard' },
              { id: 'SPARE_PARTS', label: 'Spares Depot' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouses Grid */}
      {filteredWarehouses.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <WarehouseIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Warehouses Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No warehouse matched your search criteria.'
              : 'You have not registered any warehouse yet. Click "+ Add New Warehouse" to set up your Jaipur factories and storage yards.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold hover:bg-amber-500/30 cursor-pointer"
          >
            + Add Warehouse Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWarehouses.map((wh) => (
            <div
              key={wh.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between ${
                wh.isActive ? 'border-slate-800' : 'border-red-900/40 bg-slate-950/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {wh.code}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          wh.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {wh.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{wh.name}</h3>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700">
                    {wh.warehouseType.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{wh.location || 'Jaipur, Rajasthan'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>In-charge: <strong className="text-slate-200">{wh.managerName || 'Plant Supervisor'}</strong></span>
                  </div>

                  {wh.capacitySqFt && (
                    <div className="flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Capacity: <strong className="text-slate-200 font-mono">{formatIndianNumber(wh.capacitySqFt)}</strong> Sq. Ft</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewingWarehouse(wh)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Edit Warehouse"
                    onClick={() => handleOpenEdit(wh)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete Warehouse"
                    onClick={() => handleDelete(wh.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <WarehouseIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {editingWarehouse ? 'Edit Warehouse Location' : 'Register New Warehouse'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. WH-VKIA-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Warehouse Type *
                  </label>
                  <select
                    value={formData.warehouseType}
                    onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FINISHED_GOODS">Finished Goods Warehouse</option>
                    <option value="RAW_MATERIALS">Raw Materials Yard</option>
                    <option value="WIP">WIP / Assembly Shopfloor</option>
                    <option value="PACKING_MATERIAL">Packaging Material Store</option>
                    <option value="SPARE_PARTS">Spare Parts Depot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Warehouse Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VKIA Main Manufacturing & FG Depot"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Complete Facility Address / Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Road No. 14, Vishwakarma Industrial Area (VKIA), Jaipur, Rajasthan - 302013"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Facility Manager / In-Charge
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="e.g. Praveen Sharma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Storage Capacity (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    value={formData.capacitySqFt}
                    onChange={(e) => setFormData({ ...formData, capacitySqFt: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Camera Photo Capture Field (Strict User Rule: Device Camera, No Manual URL Link) */}
              <div className="pt-2">
                <PhotoCaptureField
                  label="Warehouse Bay / Facility Photo"
                  value={formData.photoUrl}
                  onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                  helperText="Capture gate, bay or premises using device camera for logistics identification."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="wh-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="wh-active" className="text-xs text-slate-300 cursor-pointer">
                  Active Facility (Available for receiving, production storage, and dispatch allocations)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {loading ? 'Saving...' : editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Warehouse Details Modal */}
      {viewingWarehouse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <WarehouseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewingWarehouse.name}</h3>
                  <span className="font-mono text-xs text-amber-400">{viewingWarehouse.code}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingWarehouse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Facility Type</span>
                <span className="text-white font-semibold">{viewingWarehouse.warehouseType}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Capacity</span>
                <span className="text-amber-400 font-mono font-semibold">
                  {viewingWarehouse.capacitySqFt ? formatIndianNumber(viewingWarehouse.capacitySqFt) : 'N/A'} Sq. Ft
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Manager</span>
                <span className="text-white font-semibold">{viewingWarehouse.managerName || 'Plant Incharge'}</span>
              </div>
            </div>

            {/* Storage Zones and Bins Structure */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Configured Storage Zones & Racks
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Zone A: Heating Appliances</span>
                  <p className="text-[11px] text-slate-400">Halogen & Quartz Heaters, Heat Blowers</p>
                  <span className="inline-block mt-2 font-mono text-[10px] text-slate-500">Racks A1 - A08</span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Zone B: Air Movement</span>
                  <p className="text-[11px] text-slate-400">Pedestal, Table & Wall Mounted Fans</p>
                  <span className="inline-block mt-2 font-mono text-[10px] text-slate-500">Racks B1 - B12</span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Zone C: Kitchen & Mosquito</span>
                  <p className="text-[11px] text-slate-400">Electric Kettles, Rechargeable Mosquito Bats</p>
                  <span className="inline-block mt-2 font-mono text-[10px] text-slate-500">Racks C1 - C06</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingWarehouse(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
