import React, { useState } from 'react';
import {
  TrendingUp,
  Warehouse,
  Boxes,
  AlertTriangle,
  Factory,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Coffee,
  Fan,
  Wind,
  Maximize2,
  RefreshCw,
  Clock,
  Layers,
  Database,
  Building2,
  CheckCircle2,
  CreditCard,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  FileCheck2,
  Activity,
  Filter,
} from 'lucide-react';
import { DashboardStats, Product, StockLedgerEntry, Warehouse as WarehouseType } from '../../types/erp.ts';
import { formatCompactINR, formatINR, formatIndianNumber, formatIST } from '../../utils/formatters.ts';
import { Language, translations } from '../../utils/translations.ts';

interface ExecutiveDashboardProps {
  stats: DashboardStats | null;
  products: Product[];
  recentLedger: StockLedgerEntry[];
  warehouses: WarehouseType[];
  lang: Language;
  onNavigate: (tab: string) => void;
  onQuickAdjust: (product: Product) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  stats,
  products,
  recentLedger,
  warehouses,
  lang,
  onNavigate,
  onQuickAdjust,
  onRefresh,
  isLoading,
}) => {
  const t = translations[lang];
  const [dashboardMode, setDashboardMode] = useState<
    'MANAGEMENT' | 'SALES' | 'PURCHASE' | 'PRODUCTION' | 'DISPATCH' | 'ACCOUNTS' | 'HRMS'
  >('MANAGEMENT');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

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

  const finishedGoods = products.filter((p) => p.itemType === 'FINISHED_GOOD');
  const lowStockProducts = products.filter((p) => p.isLowStock);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shadow-xl shrink-0">
              <img
                src="/electromax-logo.png"
                alt="ELECTROMAX GLOBAL"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold tracking-wide uppercase">
                  ELECTROMAX GLOBAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud SQL PostgreSQL (asia-south1)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                Enterprise Operations & Manufacturing Telemetry
              </h1>
              <div className="text-slate-300 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Founder & Director: <strong className="text-orange-400 font-bold">Mr. Sushil Goyal</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span>
                  Location: <strong className="text-slate-200">Jaipur, Rajasthan, India</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Brand: Snow Wave Appliances</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={() => onNavigate('balances')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Views Switcher (Management & 6 Operational Dashboards) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'MANAGEMENT', label: 'Management Executive', icon: Activity },
          { id: 'SALES', label: 'Sales & Commercial', icon: ShoppingCart },
          { id: 'PURCHASE', label: 'Procurement & Vendor', icon: Boxes },
          { id: 'PRODUCTION', label: 'Shop Floor & MRP', icon: Factory },
          { id: 'DISPATCH', label: 'Dispatch & Bilty Logistics', icon: Truck },
          { id: 'ACCOUNTS', label: 'Financial & Cash Flow', icon: CreditCard },
          { id: 'HRMS', label: 'HRMS & Biometrics', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setDashboardMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dashboardMode === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Management Dashboard Overview */}
      {dashboardMode === 'MANAGEMENT' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Stock Valuation */}
            <div className="bg-white dark:bg-[#0B192C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider">{t.totalValuation}</span>
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCompactINR(stats?.totalStockValuation)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>FG: {formatCompactINR(stats?.fgStockValuation)}</span>
                  <span>•</span>
                  <span>RM: {formatCompactINR(stats?.rmStockValuation)}</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Valued via Weighted Average Method</span>
              </div>
            </div>

            {/* Catalog & Appliance SKUs */}
            <div className="bg-white dark:bg-[#0B192C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Active Catalog SKUs</span>
                <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Boxes className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalProducts || products.length} Items
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {stats?.finishedGoodsCount || finishedGoods.length} Snow Wave Models • {stats?.rawMaterialsCount || 4} Raw Components
                </div>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <span>6 Core Categories active</span>
              </div>
            </div>

            {/* Manufacturing & Plants */}
            <div className="bg-white dark:bg-[#0B192C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Manufacturing & Hubs</span>
                <span className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Factory className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.activeBranches || 3} Units • {stats?.activeWarehouses || warehouses.length} WHs
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  VKI Unit 1 (Heaters/Kettles) • Unit 2 (Fans/Bats)
                </div>
              </div>
              <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                <span>Today&apos;s Output: {stats?.todayProductionUnits || 680} units</span>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white dark:bg-[#0B192C] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider">{t.lowStockAlerts}</span>
                <span
                  className={`p-2 rounded-lg ${
                    (stats?.lowStockCount || lowStockProducts.length) > 0
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.lowStockCount ?? lowStockProducts.length} Items Below Reorder
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Auto-reorder requisition triggers active
                </div>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>Quality Pass Rate: {stats?.qualityPassRate || 99.4}%</span>
              </div>
            </div>
          </div>

          {/* Fast Moving Products & Capacity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Fast-Moving Snow Wave Appliances
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live warehouse balances, dealer pricing, and instant adjustment
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Catalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finishedGoods.slice(0, 6).map((item) => {
                  const Icon = getCategoryIcon(item.category?.code || '');
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-orange-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                {item.name}
                              </h3>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            GST {item.gstRate}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                          <div>
                            <span className="text-[11px] text-slate-400">Dealer: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatINR(item.dealerPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400">MRP: </span>
                            <span className="font-semibold text-slate-500 line-through text-[11px]">
                              {formatINR(item.mrp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Stock</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>
                              {formatIndianNumber(item.totalStock)} {item.uom}
                            </span>
                            {item.isLowStock && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-bold">
                                LOW
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onQuickAdjust(item)}
                          className="px-2.5 py-1 rounded bg-slate-200 hover:bg-orange-500 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-500 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Audit Adjust
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warehouse Depots */}
            <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Warehouses & Capacity
                </h2>
                <button
                  onClick={() => onNavigate('warehouses')}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {warehouses.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-orange-500" />
                        <span>{wh.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {wh.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Type: {wh.warehouseType.replace('_', ' ')}</span>
                      <span>{formatIndianNumber(wh.capacitySqFt)} Sq. Ft.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 1: Sales */}
      {dashboardMode === 'SALES' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-orange-500" /> Sales & Commercial Pipeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Today&apos;s Booked Sales</span>
              <div className="text-xl font-bold font-mono text-white mt-1">₹1,85,000</div>
              <span className="text-[10px] text-emerald-400">1 Confirmed Order</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Month-To-Date (MTD)</span>
              <div className="text-xl font-bold font-mono text-white mt-1">₹14,50,000</div>
              <span className="text-[10px] text-emerald-400">+18% over target</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Pending 30% Advance</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">₹55,500</div>
              <span className="text-[10px] text-slate-400">Proforma issued</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Top Distributor</span>
              <div className="font-bold text-white mt-1">Marwar Electricals</div>
              <span className="text-[10px] text-slate-400">Jodhpur, Rajasthan</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 2: Purchase */}
      {dashboardMode === 'PURCHASE' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-orange-500" /> Procurement & Supplier Requisitions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Active Purchase Orders</span>
              <div className="text-xl font-bold font-mono text-white mt-1">2 POs</div>
              <span className="text-[10px] text-amber-400">Total ₹3,55,000</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Pending GRN Inspections</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">0 Pending</div>
              <span className="text-[10px] text-slate-400">All inbound cleared</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Upcoming Vendor Payments</span>
              <div className="text-xl font-bold font-mono text-orange-400 mt-1">₹2,45,000</div>
              <span className="text-[10px] text-slate-400">Due in 15 days</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Primary Supplier</span>
              <div className="font-bold text-white mt-1">Rajasthan Copper Works</div>
              <span className="text-[10px] text-slate-400">VKI Industrial Area</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 3: Production */}
      {dashboardMode === 'PRODUCTION' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Factory className="w-4 h-4 text-orange-500" /> Manufacturing & Assembly Floor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Daily Assembly Output</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">680 Units</div>
              <span className="text-[10px] text-slate-400">Heaters & Kettles</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Capacity Utilization</span>
              <div className="text-xl font-bold font-mono text-white mt-1">87.5%</div>
              <span className="text-[10px] text-emerald-400">Optimal throughput</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Active Shop Floor Job Cards</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">4 Lines</div>
              <span className="text-[10px] text-slate-400">Line 1-4 active</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">QC Rejection Rate</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">0.6%</div>
              <span className="text-[10px] text-slate-400">Below 1% target</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 4: Dispatch */}
      {dashboardMode === 'DISPATCH' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-500" /> Dispatch & Transporter Bilty Logistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Dispatched Shipments</span>
              <div className="text-xl font-bold font-mono text-white mt-1">1 Consignment</div>
              <span className="text-[10px] text-emerald-400">Truck RJ 14 GH 7821</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Cartons Shipped</span>
              <div className="text-xl font-bold font-mono text-white mt-1">45 Boxes</div>
              <span className="text-[10px] text-slate-400">4.860 m³ volume</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Transporter Bilty (LR)</span>
              <div className="text-xl font-bold font-mono text-orange-400 mt-1">VT-JPR-99238</div>
              <span className="text-[10px] text-slate-400">V-Trans Express</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Gate Outward Status</span>
              <div className="font-bold text-emerald-400 mt-1">Gate Pass Verified</div>
              <span className="text-[10px] text-slate-400">7-Point Photo Evidence</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 5: Accounts */}
      {dashboardMode === 'ACCOUNTS' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-500" /> Accounts & Cash Flow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">HDFC Bank Balance</span>
              <div className="text-xl font-bold font-mono text-white mt-1">₹8,45,000</div>
              <span className="text-[10px] text-emerald-400">Current Account</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Outstanding Receivables</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">₹12,40,000</div>
              <span className="text-[10px] text-slate-400">Sundry Debtors</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Outstanding Payables</span>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">₹9,80,000</div>
              <span className="text-[10px] text-slate-400">Sundry Creditors</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Net GST Liability</span>
              <div className="text-xl font-bold font-mono text-orange-400 mt-1">₹1,00,000</div>
              <span className="text-[10px] text-slate-400">Due 20th of the month</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Dashboard 6: HRMS */}
      {dashboardMode === 'HRMS' && (
        <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" /> Human Resources & Attendance Telemetry
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Today&apos;s Attendance</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">42 / 45 Present</div>
              <span className="text-[10px] text-slate-400">93.3% turnout</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Staff On Leave</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">3 Employees</div>
              <span className="text-[10px] text-slate-400">2 Casual • 1 Medical</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Biometric Terminal</span>
              <div className="font-bold text-emerald-400 mt-1">Online & Syncing</div>
              <span className="text-[10px] text-slate-400">VKI Plant 1 Gate</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Monthly Payroll Estimation</span>
              <div className="text-xl font-bold font-mono text-white mt-1">₹8,90,000</div>
              <span className="text-[10px] text-slate-400">Includes EPF & ESIC</span>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Profile */}
      <div className="bg-white dark:bg-[#0B192C] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0">
              <img
                src="/electromax-logo.png"
                alt="ELECTROMAX GLOBAL Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
                Company Leadership & Corporate Profile
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                ELECTROMAX GLOBAL
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>Founder & Director: <strong className="text-orange-500 dark:text-orange-400 font-bold">Mr. Sushil Goyal</strong></span>
                <span className="text-slate-400">•</span>
                <span>Location: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Jaipur, Rajasthan, India</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Leadership</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Mr. Sushil Goyal</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Headquarters</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Jaipur, Rajasthan</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Core Brand</span>
              <span className="font-bold text-orange-500">Snow Wave Appliances</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
