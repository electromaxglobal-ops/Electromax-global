import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { ExecutiveDashboard } from './modules/dashboard/ExecutiveDashboard.tsx';
import { CompanyManagement } from './modules/company/CompanyManagement.tsx';
import { ProductCatalog } from './modules/products/ProductCatalog.tsx';
import { StockBalancesView } from './modules/inventory/StockBalancesView.tsx';
import { StockLedgerView } from './modules/inventory/StockLedgerView.tsx';
import { RolesAndPermissions } from './modules/users/RolesAndPermissions.tsx';
import { UserManagement } from './modules/users/UserManagement.tsx';
import { PartiesView } from './modules/parties/PartiesView.tsx';
import { AuditView } from './modules/audit/AuditView.tsx';
import { AboutUsView } from './modules/company/AboutUsView.tsx';
import { ColorSkuManager } from './modules/products/ColorSkuManager.tsx';
import { CartonCbmView } from './modules/packing/CartonCbmView.tsx';
import { CrmSalesPipelineView } from './modules/crm/CrmSalesPipelineView.tsx';
import { ProductionLiveDashboard } from './modules/production/ProductionLiveDashboard.tsx';
import { PurchaseWorkflowView } from './modules/purchase/PurchaseWorkflowView.tsx';
import { ChallanGeneratorView } from './modules/challans/ChallanGeneratorView.tsx';
import { DispatchLogisticsView } from './modules/dispatch/DispatchLogisticsView.tsx';
import { HrmsView } from './modules/hrms/HrmsView.tsx';
import { CleanSlateView } from './modules/admin/CleanSlateView.tsx';
import { FirstTimeSetupWizard } from './modules/wizard/FirstTimeSetupWizard.tsx';
import { BomManagementView } from './modules/bom/BomManagementView.tsx';
import { AccountingLedgersView } from './modules/accounting/AccountingLedgersView.tsx';
import { CustomerSupplierPortalView } from './modules/portals/CustomerSupplierPortalView.tsx';
import { MasterSettingsView } from './modules/settings/MasterSettingsView.tsx';
import { WarehouseManagementView } from './modules/warehouse/WarehouseManagementView.tsx';
import {
  Lock,
  Shield,
  CheckCircle2,
  X,
  LogIn,
  Building2,
} from 'lucide-react';
import {
  Company,
  Branch,
  Warehouse,
  Product,
  ProductCategory,
  StockBalance,
  StockLedgerEntry,
  Role,
  RolePermission,
  User,
  Party,
  AuditLog,
  DashboardStats,
} from './types/erp.ts';
import { Language } from './utils/translations.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Enterprise Data States - Default strictly to official Founder & Director Mr. Sushil Goyal
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    uid: 'sys-admin-001',
    fullName: 'Mr. Sushil Goyal',
    email: 'electromaxglobal@gmail.com',
    designation: 'Founder & Director',
    phoneNumber: '+91 98290 12345',
    companyId: 1,
    branchId: 1,
    roleId: 1,
    employeeCode: 'EMG-DIR-001',
    isActive: true,
  });
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Quick adjust modal state
  const [quickAdjustProduct, setQuickAdjustProduct] = useState<Product | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Purge any stale client-side caches or legacy data on mount
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          if (val && val.toLowerCase().includes('kailash')) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const cacheBust = Date.now();
      const [
        authRes,
        companyRes,
        branchesRes,
        warehousesRes,
        categoriesRes,
        productsRes,
        balancesRes,
        ledgerRes,
        rolesRes,
        usersRes,
        partiesRes,
        statsRes,
        auditRes,
      ] = await Promise.all([
        fetch(`/api/auth/me?_t=${cacheBust}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/companies/active?_t=${cacheBust}`).then((r) => r.json()).catch(() => null),
        fetch('/api/branches').then((r) => r.json()).catch(() => []),
        fetch('/api/warehouses').then((r) => r.json()).catch(() => []),
        fetch('/api/categories').then((r) => r.json()).catch(() => []),
        fetch('/api/products').then((r) => r.json()).catch(() => []),
        fetch('/api/stock/balances').then((r) => r.json()).catch(() => []),
        fetch('/api/stock/ledger').then((r) => r.json()).catch(() => []),
        fetch('/api/roles').then((r) => r.json()).catch(() => []),
        fetch('/api/users').then((r) => r.json()).catch(() => []),
        fetch('/api/parties').then((r) => r.json()).catch(() => []),
        fetch('/api/dashboard/stats').then((r) => r.json()).catch(() => null),
        fetch('/api/audit-logs').then((r) => r.json()).catch(() => []),
      ]);

      if (authRes?.user) {
        const u = { ...authRes.user };
        // Permanently ensure Founder & Director is Mr. Sushil Goyal and eliminate any legacy placeholder
        if (!u.fullName || u.fullName.toLowerCase().includes('kailash') || u.id === 1) {
          u.fullName = 'Mr. Sushil Goyal';
          u.designation = 'Founder & Director';
          u.email = 'electromaxglobal@gmail.com';
        }
        setCurrentUser(u);
      }
      if (companyRes) setCompany(companyRes);
      if (Array.isArray(branchesRes)) setBranches(branchesRes);
      if (Array.isArray(warehousesRes)) setWarehouses(warehousesRes);
      if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      if (Array.isArray(productsRes)) setProducts(productsRes);
      if (Array.isArray(balancesRes)) setBalances(balancesRes);
      if (Array.isArray(ledgerRes)) setLedger(ledgerRes);
      if (Array.isArray(rolesRes)) setRoles(rolesRes);
      if (Array.isArray(usersRes)) setUsers(usersRes);
      if (Array.isArray(partiesRes)) setParties(partiesRes);
      if (statsRes) setStats(statsRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
    } catch (error) {
      console.error('Error fetching ERP telemetry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handler: Update Company
  const handleUpdateCompany = async (updatedData: Partial<Company>) => {
    const res = await fetch('/api/companies/active', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update company');
    }
    const saved = await res.json();
    setCompany(saved);
  };

  // Handler: Add Branch / Plant
  const handleAddBranch = async (branchData: Partial<Branch>) => {
    const res = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add branch');
    }
    const newBranch = await res.json();
    setBranches((prev) => [...prev, newBranch]);
  };

  // Handler: Add Warehouse
  const handleAddWarehouse = async (warehouseData: Partial<Warehouse>) => {
    const res = await fetch('/api/warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(warehouseData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add warehouse');
    }
    const newWh = await res.json();
    setWarehouses((prev) => [...prev, newWh]);
  };

  // Handler: Add Product
  const handleAddProduct = async (productData: Partial<Product>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add product');
    }
    const newProd = await res.json();
    setProducts((prev) => [newProd, ...prev]);
    fetchAllData();
  };

  // Handler: Edit Product
  const handleEditProduct = async (id: number, productData: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to edit product');
    }
    fetchAllData();
  };

  // Handler: Delete Product
  const handleDeleteProduct = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
    fetchAllData();
  };

  // Handler: Stock Adjustment
  const handleAdjustStock = async (
    warehouseId: number,
    productId: number,
    type: 'ADD' | 'SUBTRACT',
    qty: number,
    reason: string
  ) => {
    const res = await fetch('/api/stock/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        warehouseId,
        productId,
        adjustmentType: type,
        quantity: qty,
        reason,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Stock adjustment rejected');
    }
    const result = await res.json();
    // Refresh balances, ledger, and stats
    fetchAllData();
    return result;
  };

  // Handler: Update Role Permissions
  const handleUpdateRolePermissions = async (roleId: number, perms: RolePermission[]) => {
    const res = await fetch(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: perms }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update permissions');
    }
  };

  // Handler: Add Employee User
  const handleAddUser = async (userData: Partial<User>) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add user');
    }
    const newUser = await res.json();
    setUsers((prev) => [...prev, newUser]);
  };

  // Handler: Add Commercial Party
  const handleAddParty = async (partyData: Partial<Party>) => {
    const res = await fetch('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partyData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add party');
    }
    const newParty = await res.json();
    setParties((prev) => [...prev, newParty]);
  };

  // Handler: Edit Commercial Party
  const handleEditParty = async (id: number, partyData: Partial<Party>) => {
    const res = await fetch(`/api/parties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partyData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to edit party');
    }
    fetchAllData();
  };

  // Handler: Delete Commercial Party
  const handleDeleteParty = async (id: number) => {
    const res = await fetch(`/api/parties/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete party');
    }
    fetchAllData();
  };

  const handleQuickAdjustTrigger = (prod: Product) => {
    setQuickAdjustProduct(prod);
    setCurrentTab('balances');
  };

  // Initial Loading Splash Screen
  if (isLoading && !company) {
    return (
      <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-3 flex items-center justify-center border-2 border-orange-500/40 shadow-2xl shadow-orange-500/20 mb-6 animate-pulse">
          <img
            src="/electromax-logo.png"
            alt="ELECTROMAX GLOBAL Official Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
          ELECTROMAX GLOBAL
        </h1>
        <p className="text-orange-400 font-bold text-xs sm:text-sm mt-1">
          Founder & Director: Mr. Sushil Goyal
        </p>
        <p className="text-slate-400 text-xs mt-0.5">
          Jaipur, Rajasthan, India
        </p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full animate-pulse w-3/4"></div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          Connecting to Cloud SQL (asia-south1)...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          user={currentUser}
          company={company}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <ExecutiveDashboard
              stats={stats}
              products={products}
              recentLedger={ledger}
              warehouses={warehouses}
              lang={lang}
              onNavigate={setCurrentTab}
              onQuickAdjust={handleQuickAdjustTrigger}
              onRefresh={fetchAllData}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'about' && (
            <AboutUsView
              company={company}
              branches={branches}
            />
          )}

          {currentTab === 'company' && (
            <CompanyManagement
              company={company}
              branches={branches}
              warehouses={warehouses}
              onUpdateCompany={handleUpdateCompany}
              onAddBranch={handleAddBranch}
              onAddWarehouse={handleAddWarehouse}
            />
          )}

          {currentTab === 'warehouses' && (
            <WarehouseManagementView
              warehouses={warehouses}
              branches={branches}
              onRefresh={fetchAllData}
              onNavigateToStock={() => setCurrentTab('balances')}
            />
          )}

          {currentTab === 'products' && (
            <ProductCatalog
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickAdjust={handleQuickAdjustTrigger}
            />
          )}

          {currentTab === 'wizard' && (
            <FirstTimeSetupWizard
              company={company}
              onComplete={() => setCurrentTab('dashboard')}
              onRefreshData={fetchAllData}
            />
          )}

          {currentTab === 'bom' && (
            <BomManagementView products={products} />
          )}

          {currentTab === 'accounting' && (
            <AccountingLedgersView />
          )}

          {currentTab === 'portals' && (
            <CustomerSupplierPortalView />
          )}

          {currentTab === 'settings' && (
            <MasterSettingsView
              categories={categories}
              onRefreshCategories={fetchAllData}
            />
          )}

          {currentTab === 'balances' && (
            <StockBalancesView
              balances={balances}
              warehouses={warehouses}
              products={products}
              onAdjustStock={handleAdjustStock}
              preSelectedProduct={quickAdjustProduct}
            />
          )}

          {currentTab === 'ledger' && (
            <StockLedgerView
              ledger={ledger}
              warehouses={warehouses}
            />
          )}

          {currentTab === 'roles' && (
            <RolesAndPermissions
              roles={roles}
              onUpdateRolePermissions={handleUpdateRolePermissions}
            />
          )}

          {currentTab === 'users' && (
            <UserManagement
              users={users}
              roles={roles}
              branches={branches}
              onAddUser={handleAddUser}
              onRefreshUsers={fetchAllData}
            />
          )}

          {currentTab === 'parties' && (
            <PartiesView
              parties={parties}
              onAddParty={handleAddParty}
              onEditParty={handleEditParty}
              onDeleteParty={handleDeleteParty}
            />
          )}

          {currentTab === 'crm' && <CrmSalesPipelineView />}

          {currentTab === 'dispatch' && <DispatchLogisticsView />}

          {currentTab === 'production' && <ProductionLiveDashboard />}

          {currentTab === 'skus' && <ColorSkuManager />}

          {currentTab === 'packing' && <CartonCbmView />}

          {currentTab === 'purchase' && <PurchaseWorkflowView />}

          {currentTab === 'challans' && <ChallanGeneratorView />}

          {currentTab === 'hrms' && <HrmsView />}

          {currentTab === 'clean-slate' && <CleanSlateView />}

          {currentTab === 'audit' && (
            <AuditView
              logs={auditLogs}
              onRefresh={fetchAllData}
            />
          )}
        </main>

        {/* Global Enterprise Footer with Logo and Founder Information */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B192C]/80 py-4 px-6 text-xs transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/electromax-logo.png"
                alt="ELECTROMAX GLOBAL"
                className="w-8 h-8 object-contain"
              />
              <div>
                <div className="font-extrabold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
                  ELECTROMAX GLOBAL
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                  <span>Founder & Director: <strong className="text-orange-500 font-bold">Mr. Sushil Goyal</strong></span>
                  <span>•</span>
                  <span>Location: <strong className="text-slate-700 dark:text-slate-300">Jaipur, Rajasthan, India</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-orange-500" />
                <span>Login Portal</span>
              </button>
              <span>© {new Date().getFullYear()} ELECTROMAX GLOBAL. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Login Screen / Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Logo on Login Screen */}
            <div className="text-center space-y-3">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md">
                <img
                  src="/electromax-logo.png"
                  alt="ELECTROMAX GLOBAL Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  ELECTROMAX GLOBAL
                </h3>
                <div className="text-xs text-orange-500 font-bold mt-0.5">
                  Founder & Director: Mr. Sushil Goyal
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Location: Jaipur, Rajasthan, India
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Logged-in Executive</span>
                <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  AUTHENTICATED
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                {currentUser?.fullName || 'Mr. Sushil Goyal'}
              </div>
              <div className="text-slate-500 text-[11px]">
                {currentUser?.email || 'electromaxglobal@gmail.com'}
              </div>
              <div className="text-[10px] text-orange-500 font-semibold">
                Designation: {currentUser?.designation || 'Founder & Director'}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-500 font-semibold">Switch Active Session Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.slice(0, 4).map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      if (currentUser) {
                        setCurrentUser({ ...currentUser, roleId: r.id, role: r });
                      }
                      setShowLoginModal(false);
                    }}
                    className={`p-2 rounded-lg border text-left font-semibold text-[11px] transition-all cursor-pointer ${
                      currentUser?.roleId === r.id
                        ? 'bg-orange-500 text-white border-orange-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-500/50'
                    }`}
                  >
                    <div>{r.name}</div>
                    <div className="text-[9px] opacity-75">{r.code}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Continue to ERP Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
