import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Unlock,
  Save,
  AlertCircle,
  Eye,
  Plus,
  Edit,
  CheckSquare,
  FileCheck,
  XCircle,
  Download,
  UserCheck,
  Search,
  Building,
  Key,
} from 'lucide-react';
import { Role, RolePermission } from '../../types/erp.ts';

interface RolesAndPermissionsProps {
  roles: Role[];
  onUpdateRolePermissions: (roleId: number, perms: RolePermission[]) => Promise<void>;
}

export const RolesAndPermissions: React.FC<RolesAndPermissionsProps> = ({
  roles,
  onUpdateRolePermissions,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<number>(roles[0]?.id || 1);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | 'ALL'>('ALL');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 13 Enterprise Roles
  const all13Roles = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Full System Control & Audit' },
    { code: 'DIRECTOR', name: 'Director', desc: 'Mr. Sushil Goyal - Executive Authority' },
    { code: 'ADMIN', name: 'Admin', desc: 'Operations & Setup Administration' },
    { code: 'ACCOUNTS_MGR', name: 'Accounts Manager', desc: 'Voucher Approval & Schedule III' },
    { code: 'ACCOUNTANT', name: 'Accountant', desc: 'Tally Prime Vouchers & GST Entry' },
    { code: 'SALES_MGR', name: 'Sales Manager', desc: 'Quotations, PIs & Pricing Approvals' },
    { code: 'SALES_EXEC', name: 'Sales Executive', desc: 'Lead Generation & Sales Orders' },
    { code: 'PURCHASE_MGR', name: 'Purchase Manager', desc: 'Vendor Negotiation & PO Authorization' },
    { code: 'PURCHASE_EXEC', name: 'Purchase Executive', desc: 'RFQ & Purchase Inward (GRN)' },
    { code: 'PROD_MGR', name: 'Production Manager', desc: 'Shop Floor Scheduling & BOM Approval' },
    { code: 'PROD_SUPERVISOR', name: 'Production Supervisor', desc: 'Line Assembly, Job Cards & QC' },
    { code: 'DISPATCH_MGR', name: 'Dispatch & Logistics Manager', desc: 'Vehicle Allocation & Bilty (LR)' },
    { code: 'WAREHOUSE_MGR', name: 'Store & Warehouse Manager', desc: 'Bin Transfers & Stock Movement Ledger' },
  ];

  // Fetch users for employee-wise assignment
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    setIsLoading(true);
    fetch(`/api/roles/${selectedRoleId}/permissions`)
      .then((res) => res.json())
      .then((data) => {
        setPermissions(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Failed to load permissions:', err))
      .finally(() => setIsLoading(false));
  }, [selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const selectedUser = users.find((u) => u.id === Number(selectedUserId));

  // If user is selected, switch active role to that user's role
  const handleSelectUser = (uId: number | 'ALL') => {
    setSelectedUserId(uId);
    if (uId !== 'ALL') {
      const u = users.find((usr) => usr.id === uId);
      if (u && u.roleId) {
        setSelectedRoleId(u.roleId);
      }
    }
  };

  const handleAssignRoleToEmployee = async (newRoleId: number) => {
    if (selectedUserId === 'ALL') return;
    try {
      const res = await fetch(`/api/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      if (res.ok) {
        setSelectedRoleId(newRoleId);
        setStatusMsg(`Role updated for employee ${selectedUser?.fullName}`);
        setTimeout(() => setStatusMsg(''), 4000);
        // Refresh users
        const updatedUsers = await fetch('/api/users').then((r) => r.json());
        if (Array.isArray(updatedUsers)) setUsers(updatedUsers);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggle = (id: number, field: keyof RolePermission) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateRolePermissions(selectedRoleId, permissions);
      setStatusMsg('Permissions updated successfully in PostgreSQL RBAC matrix');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const moduleLabels: Record<string, string> = {
    dashboard: 'Executive Dashboard & Telemetry',
    company: 'Company Profile & Factory Plants',
    users: 'Staff Accounts & RBAC Roles',
    inventory: 'Multi-Warehouse Inventory & Stock Ledger',
    purchase: 'Purchase Orders & Supplier Requisitions',
    production: 'BOM Revisions & Shop Floor MRP',
    sales: 'Sales Orders, Quotations & CRM',
    accounting: 'Double-Entry Bookkeeping & Ledgers',
    gst: 'Indian GST Reg. & E-way Bills',
    quality: 'Quality Control (QC) & Lab Testing',
    dispatch: 'Vehicle Loading Outward & Transporter Bilty',
    complaints: 'Customer Warranty & Complaints RMA',
    hr: 'HR & Biometric Attendance Payroll',
    audit: 'System Audit Logs & Security Snapshots',
  };

  const filteredUsers = users.filter(
    (u) =>
      !employeeSearch ||
      u.fullName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Top Header & Employee Selector */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Role-Based Access Control (RBAC) & Employee Matrix</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure granular authorizations (View, Create, Edit, Approve, Post, Cancel, Export) across 13 enterprise subsystems.
            </p>
          </div>

          {/* Select / Search Employee Dropdown */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-orange-500" />
            <select
              value={selectedUserId}
              onChange={(e) => handleSelectUser(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">-- Filter by Role (General Matrix) --</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.employeeCode || u.email}) - {u.designation || 'Staff'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Employee Info Banner */}
        {selectedUser && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-orange-500 font-bold block">
                Selected Employee: {selectedUser.fullName} ({selectedUser.employeeCode})
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Email: {selectedUser.email} • Designation: {selectedUser.designation}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Assigned Role:</span>
              <select
                value={selectedUser.roleId || selectedRoleId}
                onChange={(e) => handleAssignRoleToEmployee(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-bold text-orange-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Roles Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {roles.map((r) => {
            const isSelected = r.id === selectedRoleId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-500/50'
                }`}
              >
                <div className="font-bold text-xs truncate">{r.name}</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                  {r.code}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Subsystem Privileges for {selectedRole?.name}
              </span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                {selectedRole?.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedRole?.description}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Matrix'}</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">ERP Subsystem Module</th>
                <th className="py-2.5 px-3 text-center">View</th>
                <th className="py-2.5 px-3 text-center">Create</th>
                <th className="py-2.5 px-3 text-center">Edit</th>
                <th className="py-2.5 px-3 text-center">Approve</th>
                <th className="py-2.5 px-3 text-center">Post</th>
                <th className="py-2.5 px-3 text-center">Cancel</th>
                <th className="py-2.5 px-3 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {moduleLabels[perm.module] || perm.module}
                  </td>
                  {(['canView', 'canCreate', 'canEdit', 'canApprove', 'canPost', 'canCancel', 'canExport'] as (keyof RolePermission)[]).map((act) => (
                    <td key={act} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(perm[act])}
                        onChange={() => handleToggle(perm.id, act)}
                        className="w-4 h-4 rounded text-orange-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
