import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  Boxes,
  ScrollText,
  ShieldCheck,
  Users,
  Handshake,
  History,
  Settings,
  ChevronRight,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck2,
  Palette,
  Package,
  ShoppingCart,
  Truck,
  Fingerprint,
  Sparkles,
  Calculator,
  Globe,
  Sliders,
  Wand2,
} from 'lucide-react';
import { Language, translations } from '../../utils/translations.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  isOpen,
  onCloseMobile,
}) => {
  const t = translations[lang];

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: t.executiveDashboard, icon: LayoutDashboard },
        { id: 'wizard', label: t.wizard, icon: Wand2, badge: 'Setup' },
        { id: 'about', label: t.aboutLeadership, icon: Building2 },
      ],
    },
    {
      group: 'COMMERCIAL & SALES PIPELINE',
      items: [
        { id: 'crm', label: t.crmSales, icon: TrendingUp, badge: '30% Adv' },
        { id: 'dispatch', label: t.dispatchBilty, icon: Truck, badge: 'Bilty/LR' },
        { id: 'portals', label: t.portals, icon: Globe, badge: 'Portal' },
      ],
    },
    {
      group: 'MANUFACTURING & OPERATIONS',
      items: [
        { id: 'production', label: t.production, icon: Cpu, badge: '9-Stage' },
        { id: 'bom', label: t.bom, icon: Cpu, badge: 'BOM' },
        { id: 'skus', label: t.colorSkus, icon: Palette, badge: 'Colors' },
        { id: 'packing', label: t.cartonPacking, icon: Package, badge: 'CBM' },
        { id: 'purchase', label: t.purchaseWorkflow, icon: ShoppingCart },
        { id: 'challans', label: t.challans, icon: FileCheck2 },
      ],
    },
    {
      group: 'FINANCIAL ACCOUNTING & GST',
      items: [
        { id: 'accounting', label: t.accounting, icon: Calculator, badge: 'GST' },
      ],
    },
    {
      group: 'MASTER CONFIGURATION',
      items: [
        { id: 'company', label: t.companyMaster, icon: Building2 },
        { id: 'warehouses', label: t.warehouses, icon: Warehouse },
        { id: 'products', label: t.productCatalog, icon: Boxes, badge: 'Snow Wave' },
        { id: 'parties', label: t.parties, icon: Handshake },
        { id: 'settings', label: t.masterSettings, icon: Sliders, badge: 'Fields' },
      ],
    },
    {
      group: 'LIVE INVENTORY ENGINE',
      items: [
        { id: 'balances', label: t.inventoryBalances, icon: Layers },
        { id: 'ledger', label: t.stockLedger, icon: ScrollText, badge: 'ACID' },
      ],
    },
    {
      group: 'HUMAN RESOURCES',
      items: [
        { id: 'hrms', label: t.hrms, icon: Fingerprint, badge: 'Punch' },
      ],
    },
    {
      group: 'SECURITY & COMPLIANCE',
      items: [
        { id: 'roles', label: t.rolesPermissions, icon: ShieldCheck },
        { id: 'users', label: t.userAccounts, icon: Users },
        { id: 'audit', label: t.auditTrail, icon: History },
        { id: 'clean-slate', label: t.cleanSlate, icon: Sparkles, badge: 'Reset' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B192C] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Company Header */}
        <div className="p-3.5 border-b border-slate-800/80 bg-[#081322]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-white/5 p-1 flex items-center justify-center border border-slate-700/60 shrink-0">
              <img
                src="/electromax-logo.png"
                alt="Electromax Global"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-white uppercase truncate">
                  Electromax
                </span>
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-500/30">
                  ERP 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                <span className="text-orange-400 font-semibold">Global</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">Jaipur, India</span>
              </p>
            </div>
          </div>
        </div>

        {/* Database Status Ribbon */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">Cloud SQL (asia-south1)</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            PG 15
          </span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/15 to-transparent text-orange-400 border-l-3 border-orange-500'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-slate-800/90 text-orange-300 px-1.5 py-0.5 rounded font-semibold border border-orange-500/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Phase 2-5 Upcoming Modules Badge */}
          <div className="pt-2 px-3">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold text-xs">
                <span>Phase Roadmap</span>
                <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                  P1 Active
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>P1: Architecture & Masters</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span>P2: Purchase & GRN</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span>P3: BOM & Production</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span>P4: Sales & GST Invoices</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span>P5: Double-Entry P&L / B/S</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Company Leadership */}
        <div className="p-3 border-t border-slate-800 bg-[#081322] space-y-1.5">
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <div>
              <div className="text-slate-200 font-bold tracking-wide">ELECTROMAX GLOBAL</div>
              <div className="text-[10px] text-orange-400 font-medium">Founder & Director: Mr. Sushil Goyal</div>
              <div className="text-[10px] text-slate-500">Jaipur, Rajasthan, India</div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold self-start">
              v2.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
