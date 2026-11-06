import React, { useState } from 'react';
import {
  History,
  Shield,
  Database,
  Search,
  CheckCircle2,
  Lock,
  HardDrive,
  RefreshCw,
  Clock,
  Server,
  Cloud,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { AuditLog } from '../../types/erp.ts';
import { formatIST } from '../../utils/formatters.ts';

interface AuditViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ logs, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      search === '' ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      (l.userName && l.userName.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || l.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('No audit logs to export.');
      return;
    }

    const headers = ['ID', 'Timestamp IST', 'Action', 'Entity', 'Entity ID', 'User', 'Details'];
    const rows = filtered.map((l) => [
      l.id,
      formatIST(l.createdAt),
      l.action,
      l.entity,
      l.entityId || '',
      l.userName || 'System Administrator',
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `electromax_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cloud SQL Infrastructure & Backup Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Primary RDBMS</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>PostgreSQL 15</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Region: <span className="text-amber-500 font-mono font-semibold">asia-south1</span> (Mumbai/Jaipur Low Latency)
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">WAL Point-in-Time Recovery</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cloud className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>Continuous WAL</span>
            <span className="text-[10px] bg-blue-500/15 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Automated crash recovery & multi-table transaction rollback protection
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Local Server / NAS Sync</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>Encrypted Dump</span>
            <span className="text-[10px] bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-500/30">
              SCHEDULED
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Daily automated AES-256 snapshot for Jaipur Plant 1 local server
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <span>Immutable System Audit Trail</span>
            </h1>
            <p className="text-xs text-slate-400">
              Permanent logging of all operational entries, master creations, stock adjustments, and administrative overrides
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions, user name, or entity details..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE (New Masters & Records)</option>
              <option value="UPDATE">UPDATE (Profile / Permissions / Master)</option>
              <option value="DELETE">DELETE (Record Removal)</option>
              <option value="DEACTIVATE">DEACTIVATE (Status Toggles)</option>
              <option value="POST">POST (Stock Adjustments & Vouchers)</option>
              <option value="APPROVE">APPROVE (Workflow Approvals)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Subsystem Entity</th>
                <th className="py-3 px-4">Audited User</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Operational Event Description</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatIST(l.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          l.action === 'CREATE'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : l.action === 'POST'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : l.action === 'DELETE'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-white">
                      {l.entity}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {l.userName || 'Mr. Sushil Goyal (Founder & Director)'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {l.entityId || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                      {l.details}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        title="View Full Audit Entry"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspection Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Audit Event Inspection</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Log Entry ID:</span>
                <span className="font-mono text-amber-400 font-bold">#{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action Type:</span>
                <span className="font-bold text-white">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subsystem Entity:</span>
                <span className="font-mono text-white">{selectedLog.entity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entity Record ID:</span>
                <span className="font-mono text-slate-300">{selectedLog.entityId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Executed By User:</span>
                <span className="text-white font-semibold">{selectedLog.userName || 'Mr. Sushil Goyal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp (IST):</span>
                <span className="font-mono text-slate-400">{formatIST(selectedLog.createdAt)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block mb-1">Event Description & Parameters:</span>
                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-200 font-mono text-[11px] leading-relaxed break-words">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
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
