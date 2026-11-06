import React, { useState, useEffect } from 'react';
import {
  Users,
  Fingerprint,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Briefcase,
  UserCheck,
  Building,
  Edit2,
  Trash2,
  Eye,
  Camera,
  FileText,
  DollarSign,
  AlertCircle,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  UserX,
  X,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';

interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string;
  designation: string;
  reportingManager: string | null;
  salary: string | null;
  joiningDate: string | null;
  shift: string | null;
  photoUrl?: string | null;
  isActive: boolean;
}

interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  overtimeHours?: string | null;
  source: string;
}

interface LeaveRequest {
  id: string;
  employeeId: number;
  employeeName: string;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
}

export const HrmsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'EMPLOYEES' | 'ATTENDANCE' | 'LEAVES' | 'PAYROLL' | 'SHIFTS'>('EMPLOYEES');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Modal State
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+91 ',
    department: 'Production',
    designation: 'Assembly Specialist',
    salary: '25000',
    shift: 'Morning General (09:00 - 18:00)',
    reportingManager: 'Mr. Sushil Goyal',
    joiningDate: new Date().toISOString().split('T')[0],
    photoUrl: '',
    isActive: true,
  });

  // Punch Form State
  const [punchForm, setPunchForm] = useState({
    employeeId: 1,
    status: 'PRESENT',
    checkInTime: '',
    checkOutTime: '',
    overtimeHours: '0.0',
    source: 'Facial Recognition / Biometric Gate 1',
  });

  // Leaves Mock State (stored in local storage for session persistence)
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('emg_hrms_leaves');
      return saved ? JSON.parse(saved) : [
        {
          id: 'LV-101',
          employeeId: 1,
          employeeName: 'Mohit Sharma',
          leaveType: 'CASUAL',
          startDate: '2026-11-10',
          endDate: '2026-11-11',
          days: 2,
          reason: 'Family function in Ajmer',
          status: 'APPROVED',
          appliedOn: '2026-11-02',
        },
      ];
    } catch {
      return [];
    }
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: 1,
    leaveType: 'CASUAL' as 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: '',
  });

  const saveLeaves = (updated: LeaveRequest[]) => {
    setLeaves(updated);
    try {
      localStorage.setItem('emg_hrms_leaves', JSON.stringify(updated));
    } catch {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEmp, resAtt] = await Promise.all([
        fetch('/api/hrms/employees').then((r) => r.json()),
        fetch('/api/hrms/attendance').then((r) => r.json()),
      ]);
      const empList = Array.isArray(resEmp) ? resEmp : [];
      setEmployees(empList);
      setAttendance(Array.isArray(resAtt) ? resAtt : []);
      if (empList.length > 0 && !punchForm.employeeId) {
        setPunchForm((prev) => ({ ...prev, employeeId: empList[0].id }));
        setLeaveForm((prev) => ({ ...prev, employeeId: empList[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '+91 ',
      department: 'Production',
      designation: 'Assembly Specialist',
      salary: '25000',
      shift: 'Morning General (09:00 - 18:00)',
      reportingManager: 'Mr. Sushil Goyal',
      joiningDate: new Date().toISOString().split('T')[0],
      photoUrl: '',
      isActive: true,
    });
    setIsAddEmployeeOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email || '',
      phone: emp.phone || '+91 ',
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary || '25000',
      shift: emp.shift || 'Morning General (09:00 - 18:00)',
      reportingManager: emp.reportingManager || 'Mr. Sushil Goyal',
      joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
      photoUrl: emp.photoUrl || '',
      isActive: emp.isActive,
    });
    setIsAddEmployeeOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingEmployee) {
        res = await fetch(`/api/hrms/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/hrms/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (res.ok) {
        setIsAddEmployeeOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save employee profile');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate employee ${emp.fullName} (${emp.employeeCode})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/hrms/employees/${emp.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete employee');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBiometricPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hrms/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: punchForm.employeeId,
          checkInTime: punchForm.checkInTime || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
          checkOutTime: punchForm.checkOutTime || null,
          status: punchForm.status,
          source: punchForm.source,
        }),
      });
      if (res.ok) {
        setIsPunchModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === Number(leaveForm.employeeId));
    const newReq: LeaveRequest = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      employeeId: Number(leaveForm.employeeId),
      employeeName: emp?.fullName || 'Employee',
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: Number(leaveForm.days) || 1,
      reason: leaveForm.reason || 'Personal reasons',
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    saveLeaves([newReq, ...leaves]);
    setIsLeaveModalOpen(false);
  };

  const handleUpdateLeaveStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const updated = leaves.map((lv) => (lv.id === id ? { ...lv, status: newStatus } : lv));
    saveLeaves(updated);
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Calculate Salary Components
  const calculateSalaryBreakdown = (grossSalary: number) => {
    const basic = grossSalary * 0.5;
    const hra = grossSalary * 0.2;
    const conveyance = grossSalary * 0.1;
    const specialAllowance = grossSalary * 0.2;
    // Statutory Deductions (Indian Standard)
    const pf = Math.min(basic * 0.12, 1800); // PF 12% capped
    const esic = grossSalary <= 21000 ? grossSalary * 0.0075 : 0; // 0.75% for salary <= 21000
    const professionalTax = 200; // Standard monthly PT in Rajasthan
    const totalDeductions = pf + esic + professionalTax;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      basic,
      hra,
      conveyance,
      specialAllowance,
      pf,
      esic,
      professionalTax,
      totalDeductions,
      netSalary,
    };
  };

  // Metrics
  const activeCount = employees.filter((e) => e.isActive).length;
  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter((a) => a.date === today && a.status === 'PRESENT').length;
  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.salary || '0') || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Human Resource Management (HRMS & Payroll)
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Workforce roster, biometric attendance, camera punch, shifts, Indian statutory payroll (PF/ESIC/PT), and leave administration for Electromax Global, Jaipur.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-all cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            Log Biometric Punch
          </button>
          <button
            onClick={handleOpenAddEmployee}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Employee
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'EMPLOYEES', label: 'Employee Master', icon: Users, count: employees.length },
          { id: 'ATTENDANCE', label: 'Attendance & In/Out', icon: Clock, count: attendance.length },
          { id: 'LEAVES', label: 'Leave Management', icon: Calendar, count: leaves.filter((l) => l.status === 'PENDING').length },
          { id: 'PAYROLL', label: 'Payroll & Salary Slips', icon: DollarSign },
          { id: 'SHIFTS', label: 'Shifts & Overtime', icon: Briefcase },
          { id: 'DASHBOARD', label: 'HR Analytics', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: EMPLOYEES MASTER */}
      {activeTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, employee code, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                {['ALL', 'Production', 'Quality', 'Stores', 'Accounts', 'Sales', 'Dispatch', 'HR'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedDept === dept
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Cards Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No Employees Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'No employee matched your search query.'
                  : 'No employees have been added to the master roster yet. Click "+ Add Employee" to register staff.'}
              </p>
              <button
                onClick={handleOpenAddEmployee}
                className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold hover:bg-amber-500/30 cursor-pointer"
              >
                + Register First Employee
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className={`bg-slate-900/80 border rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between ${
                    emp.isActive ? 'border-slate-800' : 'border-red-900/30 bg-slate-950/60 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={emp.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                            {emp.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                              {emp.employeeCode}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                                emp.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {emp.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">{emp.fullName}</h3>
                          <p className="text-xs text-slate-400">{emp.designation}</p>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                        {emp.department}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 py-3 border-y border-slate-800/80 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Gross Salary:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatINR(parseFloat(emp.salary || '0'))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Assigned Shift:</span>
                        <span className="text-slate-300 truncate max-w-[170px]">{emp.shift || 'General Office'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Reporting To:</span>
                        <span className="text-slate-300">{emp.reportingManager || 'Mr. Sushil Goyal'}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-2 pt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-300 font-mono text-[11px]">{emp.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setViewingEmployee(emp)}
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Generate Salary Slip"
                        onClick={() => setSelectedPayslipEmp(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit Profile"
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete / Deactivate"
                        onClick={() => handleDeleteEmployee(emp)}
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
        </div>
      )}

      {/* Tab 2: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Today's Date: <strong className="text-white">{today}</strong></span>
              <span className="text-slate-600">|</span>
              <span>Present Today: <strong className="text-emerald-400">{presentToday}</strong> of {activeCount} active staff</span>
            </div>

            <button
              onClick={() => setIsPunchModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              Record Live Punch
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">In Time</th>
                  <th className="py-3 px-3">Out Time</th>
                  <th className="py-3 px-3">Overtime</th>
                  <th className="py-3 px-3">Terminal / Source</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No attendance punches recorded yet. Click "Record Live Punch" to log an employee punch.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => {
                    const emp = employees.find((e) => e.id === att.employeeId);
                    return (
                      <tr key={att.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-300">{att.date}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{emp?.fullName || `Employee #${att.employeeId}`}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp?.employeeCode}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">{att.checkInTime || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{att.checkOutTime || 'On Duty'}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">
                          {att.overtimeHours && parseFloat(att.overtimeHours) > 0 ? `+${att.overtimeHours} hrs` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{att.source}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              att.status === 'PRESENT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : att.status === 'OVERTIME'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: LEAVES */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Leave Applications & Approval Matrix</h3>
              <p className="text-[11px] text-slate-400">Authorised under Rajasthan Factories Act & Electromax HR Policy.</p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Apply Leave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { type: 'Casual Leave (CL)', quota: '12 / year', desc: 'Personal urgent matters' },
              { type: 'Sick Leave (SL)', quota: '10 / year', desc: 'Medical emergency with prescription' },
              { type: 'Earned Leave (EL)', quota: '15 / year', desc: 'Annual planned vacation' },
              { type: 'Maternity / Special', quota: 'Statutory', desc: 'As per labor laws' },
            ].map((card, i) => (
              <div key={i} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-amber-400 block mb-0.5">{card.type}</span>
                <span className="text-sm font-bold text-white font-mono block">{card.quota}</span>
                <span className="text-[10px] text-slate-500 block mt-1">{card.desc}</span>
              </div>
            ))}
          </div>

          {/* Leave Requests Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Req ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Leave Type</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No leave applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{lv.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{lv.employeeName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{lv.leaveType}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {lv.startDate} {lv.startDate !== lv.endDate && `to ${lv.endDate}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">{lv.days} day(s)</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{lv.reason}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            lv.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : lv.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {lv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {lv.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'APPROVED')}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-semibold border border-emerald-500/30 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'REJECTED')}
                              className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-semibold border border-red-500/30 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: PAYROLL */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Payroll Register – Indian Statutory Compliance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates Basic (50%), HRA (20%), Special Allowances, Employee PF (12%), ESIC (0.75%), and Rajasthan Professional Tax.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Monthly Gross Liability:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{formatINR(totalMonthlyPayroll)}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3 text-right">Gross (₹)</th>
                  <th className="py-3 px-3 text-right">Basic (50%)</th>
                  <th className="py-3 px-3 text-right">HRA (20%)</th>
                  <th className="py-3 px-3 text-right">PF (12%)</th>
                  <th className="py-3 px-3 text-right">ESIC</th>
                  <th className="py-3 px-3 text-right">Prof Tax</th>
                  <th className="py-3 px-3 text-right text-emerald-400 font-bold">Net Pay (₹)</th>
                  <th className="py-3 px-3 text-center">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No employees registered for payroll generation.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const gross = parseFloat(emp.salary || '0') || 0;
                    const breakdown = calculateSalaryBreakdown(gross);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white">{emp.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp.employeeCode} • {emp.department}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-white font-semibold">{formatINR(gross)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatINR(breakdown.basic)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatINR(breakdown.hra)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-400">-{formatINR(breakdown.pf)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-400">
                          {breakdown.esic > 0 ? `-${formatINR(breakdown.esic)}` : 'Exempt'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-400">-{formatINR(breakdown.professionalTax)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                          {formatINR(breakdown.netSalary)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedPayslipEmp(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: SHIFTS */}
      {activeTab === 'SHIFTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 font-bold">SHIFT 01</span>
              <h3 className="text-base font-bold text-white mt-2">Morning General Shift</h3>
              <p className="text-xs text-slate-400 mt-1">Management, Engineering, Stores & Accounts</p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Timing:</span>
                  <span className="font-mono text-amber-400 font-bold">09:00 AM – 06:00 PM</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Lunch Break:</span>
                  <span>01:00 PM – 01:45 PM (45 min)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 font-bold">SHIFT 02</span>
              <h3 className="text-base font-bold text-white mt-2">Assembly Line Shift A</h3>
              <p className="text-xs text-slate-400 mt-1">Room Heater & Fan Winding Lines</p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Timing:</span>
                  <span className="font-mono text-blue-400 font-bold">07:00 AM – 03:30 PM</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tea & Meal Breaks:</span>
                  <span>2 × 15 min + 30 min meal</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 font-bold">SHIFT 03</span>
              <h3 className="text-base font-bold text-white mt-2">Assembly Line Shift B</h3>
              <p className="text-xs text-slate-400 mt-1">Kettle & Mosquito Bat Assembly & Packaging</p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Timing:</span>
                  <span className="font-mono text-purple-400 font-bold">03:30 PM – 12:00 AM</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Evening Tea:</span>
                  <span>07:00 PM – 07:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Active Staff</span>
              <div className="text-2xl font-bold text-white mt-1">{activeCount}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Full-time payroll active</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Today's Attendance</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {activeCount > 0 ? `${Math.round((presentToday / activeCount) * 100)}%` : '0%'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{presentToday} present today</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pending Leaves</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {leaves.filter((l) => l.status === 'PENDING').length}
              </div>
              <span className="text-[11px] text-amber-400/80 mt-1 block">Awaiting supervisor approval</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monthly Payroll</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{formatINR(totalMonthlyPayroll)}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Gross statutory outlay</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {editingEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98290 12345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Production">Production & Assembly</option>
                    <option value="Quality">Quality Control (QA/QC)</option>
                    <option value="Stores">Stores & Warehouse</option>
                    <option value="Accounts">Accounts & Finance</option>
                    <option value="Sales">Sales & Marketing</option>
                    <option value="Dispatch">Dispatch & Logistics</option>
                    <option value="HR">HR & Admin</option>
                    <option value="Management">Executive Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Heater Assembly Incharge"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Gross Salary (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Shift *</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Morning General (09:00 - 18:00)">Morning General (09:00 - 18:00)</option>
                    <option value="Assembly Shift A (07:00 - 15:30)">Assembly Shift A (07:00 - 15:30)</option>
                    <option value="Assembly Shift B (15:30 - 00:00)">Assembly Shift B (15:30 - 00:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    placeholder="Mr. Sushil Goyal"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photo Capture with Hardware Camera */}
              <div className="pt-2">
                <PhotoCaptureField
                  label="Employee Identity Photo"
                  value={formData.photoUrl}
                  onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                  helperText="Capture employee portrait photo directly via device camera for biometric and ID badge."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emp-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="emp-active" className="text-xs text-slate-300 cursor-pointer">
                  Active Employee (Enabled for attendance biometric, shift roster, and payroll)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingEmployee ? 'Update Profile' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Biometric Punch Modal */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log Attendance Punch</h3>
              </div>
              <button
                onClick={() => setIsPunchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBiometricPunch} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Employee *</label>
                <select
                  value={punchForm.employeeId}
                  onChange={(e) => setPunchForm({ ...punchForm, employeeId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) – {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Punch Status *</label>
                <select
                  value={punchForm.status}
                  onChange={(e) => setPunchForm({ ...punchForm, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="PRESENT">PRESENT (Full Day)</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="OVERTIME">OVERTIME SHIFT</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Punch Source / Device</label>
                <select
                  value={punchForm.source}
                  onChange={(e) => setPunchForm({ ...punchForm, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Biometric Optical Terminal (Main Factory Gate 1)">Biometric Optical Terminal (Main Factory Gate 1)</option>
                  <option value="Facial Recognition Gate 2 (VKIA)">Facial Recognition Gate 2 (VKIA)</option>
                  <option value="Mobile Camera Geofenced Punch">Mobile Camera Geofenced Punch</option>
                  <option value="Supervisor Manual Regularization">Supervisor Manual Regularization</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPunchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Apply for Leave</h3>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Employee *</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Leave Category *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="EARNED">Earned / Privilege Leave (EL)</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Provide brief explanation for leave approval..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Viewer Modal */}
      {selectedPayslipEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img src="/electromax-logo.png" alt="Electromax Global" className="w-9 h-9 object-contain" />
                <div>
                  <h3 className="text-base font-bold text-white">ELECTROMAX GLOBAL</h3>
                  <span className="text-[11px] text-slate-400">Jaipur, Rajasthan, India • Official Monthly Pay Slip</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslipEmp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Payslip Header Info */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-500 block">Employee Name:</span>
                <span className="text-white font-bold">{selectedPayslipEmp.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Employee Code:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedPayslipEmp.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department:</span>
                <span className="text-white">{selectedPayslipEmp.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Designation:</span>
                <span className="text-slate-300">{selectedPayslipEmp.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pay Period:</span>
                <span className="text-slate-300">November 2026</span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorized By:</span>
                <span className="text-amber-400 font-semibold">Mr. Sushil Goyal</span>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            {(() => {
              const gross = parseFloat(selectedPayslipEmp.salary || '0') || 0;
              const b = calculateSalaryBreakdown(gross);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Earnings */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-2">
                      Earnings & Allowances
                    </h4>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Basic Salary (50%):</span>
                      <span className="font-mono text-white">{formatINR(b.basic)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>House Rent Allowance (HRA):</span>
                      <span className="font-mono text-white">{formatINR(b.hra)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Conveyance Allowance:</span>
                      <span className="font-mono text-white">{formatINR(b.conveyance)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Special Allowance:</span>
                      <span className="font-mono text-white">{formatINR(b.specialAllowance)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
                      <span>Gross Earnings:</span>
                      <span className="font-mono text-emerald-400">{formatINR(gross)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-red-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-2">
                      Statutory Deductions
                    </h4>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Provident Fund (EPF 12%):</span>
                      <span className="font-mono text-red-400">-{formatINR(b.pf)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Employee State Insurance (ESIC):</span>
                      <span className="font-mono text-red-400">{b.esic > 0 ? `-${formatINR(b.esic)}` : 'Exempt'}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1">
                      <span>Rajasthan Professional Tax:</span>
                      <span className="font-mono text-red-400">-{formatINR(b.professionalTax)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-red-400">-{formatINR(b.totalDeductions)}</span>
                    </div>
                  </div>

                  {/* Net Payable Highlight */}
                  <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Net Take-Home Salary</span>
                      <span className="text-[11px] text-slate-500">Credited to registered bank account by 7th of every month</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-emerald-400">{formatINR(b.netSalary)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>This is a computer generated pay advice under Electromax Global ERP 2.0.</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
