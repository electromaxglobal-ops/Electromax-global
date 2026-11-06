import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Calendar,
  Warehouse,
  ShieldCheck,
  FileText,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
  Coffee,
  Fan,
  Wind,
  Maximize2,
  Zap,
} from 'lucide-react';
import { Company, Warehouse as WarehouseType, User } from '../../types/erp.ts';

interface SetupWizardProps {
  company: Company | null;
  onComplete: () => void;
  onRefreshData: () => Promise<void>;
}

export const FirstTimeSetupWizard: React.FC<SetupWizardProps> = ({
  company,
  onComplete,
  onRefreshData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Company Profile
  const [companyData, setCompanyData] = useState({
    legalName: company?.legalName || 'Electromax Global Enterprises Pvt. Ltd.',
    tradeName: company?.tradeName || 'Electromax Global',
    gstin: company?.gstin || '08AABCE9876K1Z2',
    pan: company?.pan || 'AABCE9876K',
    cin: company?.cin || 'U31909RJ2018PTC062145',
    founderName: 'Mr. Sushil Goyal',
    founderDesignation: 'Founder & Director',
    email: company?.email || 'electromaxglobal@gmail.com',
    phone: company?.phone || '+91 141 2334455',
    address: company?.address || 'Plot No. 42-45, Phase 1, Vishwakarma Industrial Area (VKI)',
    city: company?.city || 'Jaipur',
    stateName: company?.stateName || 'Rajasthan',
    stateCode: company?.stateCode || '08',
    pincode: company?.pincode || '302013',
  });

  // Step 2: Financial Year & Tax Configuration
  const [financialData, setFinancialData] = useState({
    financialYear: '2026-2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    baseCurrency: 'INR',
    currencySymbol: '₹',
    defaultGstRate: '18.00',
    cgstRate: '9.00',
    sgstRate: '9.00',
    igstRate: '18.00',
    advancePaymentPercent: '30',
  });

  // Step 3: Warehouses & Factory Locations
  const [warehousesList, setWarehousesList] = useState([
    {
      code: 'WH-FG-01',
      name: 'Central Finished Goods Depot',
      type: 'FINISHED_GOODS',
      address: 'Plot 42, Road No. 5, VKI Area, Jaipur, Rajasthan 302013',
    },
    {
      code: 'WH-RM-01',
      name: 'VKI Raw Material & Component Store',
      type: 'RAW_MATERIAL',
      address: 'Plot 43-44, Road No. 5, VKI Area, Jaipur, Rajasthan 302013',
    },
    {
      code: 'WH-WIP-01',
      name: 'Plant 1 Assembly & WIP Buffer',
      type: 'WIP',
      address: 'VKI Unit 1 Shopfloor, Jaipur, Rajasthan 302013',
    },
  ]);

  // Step 4: Document Numbering Series
  const [docSeries, setDocSeries] = useState({
    quotationPrefix: 'EMG/QT/26-27/',
    piPrefix: 'EMG/PI/26-27/',
    soPrefix: 'EMG/SO/26-27/',
    poPrefix: 'EMG/PO/26-27/',
    challanPrefix: 'EMG/DC/26-27/',
    dispatchPrefix: 'EMG/DSP/26-27/',
    invoicePrefix: 'EMG/INV/26-27/',
  });

  // Step 5: Initial Product Categories to Activate
  const [activeCategories, setActiveCategories] = useState<string[]>([
    'Room Heater',
    'Electric Kettle',
    'Pedestal Fan',
    'Table Fan',
    'Wall Fan',
    'Mosquito Bat',
  ]);

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
      if (activeCategories.length > 1) {
        setActiveCategories(activeCategories.filter((c) => c !== cat));
      }
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
  };

  const handleFinishWizard = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        company: companyData,
        financial: financialData,
        warehouses: warehousesList,
        docSeries,
        activeCategories,
      };

      const res = await fetch('/api/wizard/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        await onRefreshData();
        setTimeout(() => {
          onComplete();
        }, 1800);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save setup configuration');
      }
    } catch (err: any) {
      alert('Error saving setup: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">
                Electromax Global – First-Time Factory Setup Wizard
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Clean Blank State
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Configure your official company profile, GSTIN, warehouse locations, document prefixes, and active appliance categories for live factory operations under <strong>Mr. Sushil Goyal (Founder & Director)</strong>.
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
          {[
            { num: 1, label: 'Company Profile' },
            { num: 2, label: 'FY & GST' },
            { num: 3, label: 'Warehouses' },
            { num: 4, label: 'Document Series' },
            { num: 5, label: 'Categories' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === s.num
                  ? 'text-orange-400 scale-105'
                  : currentStep > s.num
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                  currentStep === s.num
                    ? 'bg-orange-500 text-white border-orange-400'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex items-center gap-3 text-xs font-semibold shadow-lg animate-pulse">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Setup completed successfully! Initializing Electromax Global live blank workspace...</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* STEP 1: Company Profile */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                Step 1: Company Profile & Legal Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ensure official business registration details and leadership information are exact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Trade Name (Branding)</label>
                <input
                  type="text"
                  value={companyData.tradeName}
                  onChange={(e) => setCompanyData({ ...companyData, tradeName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Legal Registered Entity Name</label>
                <input
                  type="text"
                  value={companyData.legalName}
                  onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Founder & Director Name</label>
                <input
                  type="text"
                  value={companyData.founderName}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-orange-500 font-extrabold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Official Designation</label>
                <input
                  type="text"
                  value={companyData.founderDesignation}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Indian GSTIN (15-Digit)</label>
                <input
                  type="text"
                  value={companyData.gstin}
                  onChange={(e) => setCompanyData({ ...companyData, gstin: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Company PAN</label>
                <input
                  type="text"
                  value={companyData.pan}
                  onChange={(e) => setCompanyData({ ...companyData, pan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Registered Factory / Corporate Address</label>
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">City & State</label>
                <input
                  type="text"
                  value={`${companyData.city}, ${companyData.stateName} (Code: ${companyData.stateCode})`}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">PIN Code</label>
                <input
                  type="text"
                  value={companyData.pincode}
                  onChange={(e) => setCompanyData({ ...companyData, pincode: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Financial Year & GST */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                Step 2: Indian Financial Year & GST Tax Structure
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set active financial accounting year and default commercial GST slabs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Financial Year Code</label>
                <input
                  type="text"
                  value={financialData.financialYear}
                  onChange={(e) => setFinancialData({ ...financialData, financialYear: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Base Currency</label>
                <input
                  type="text"
                  value={`${financialData.baseCurrency} (${financialData.currencySymbol})`}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-emerald-500 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">FY Start Date</label>
                <input
                  type="date"
                  value={financialData.startDate}
                  onChange={(e) => setFinancialData({ ...financialData, startDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">FY End Date</label>
                <input
                  type="date"
                  value={financialData.endDate}
                  onChange={(e) => setFinancialData({ ...financialData, endDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Default Appliance GST Rate (%)</label>
                <input
                  type="number"
                  value={financialData.defaultGstRate}
                  onChange={(e) => setFinancialData({ ...financialData, defaultGstRate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">CGST 9% + SGST 9% (Intra-state) / IGST 18% (Inter-state)</span>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Default Advance Payment Required (%)</label>
                <input
                  type="number"
                  value={financialData.advancePaymentPercent}
                  onChange={(e) => setFinancialData({ ...financialData, advancePaymentPercent: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-orange-500 font-extrabold text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default 30% advance on Proforma Invoices prior to production allocation</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Warehouses */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-orange-500" />
                Step 3: Initial Factory Warehouses & Storage Depots
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These stock locations will be ready for entering physical opening inventory.
              </p>
            </div>

            <div className="space-y-3">
              {warehousesList.map((wh, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded text-[11px]">
                        {wh.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{wh.name}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                        {wh.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{wh.address}</p>
                  </div>
                  <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Live Stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Document Series */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Step 4: Statutory Document Numbering Series
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Standardized prefixes for Quotations, PIs, Orders, Challans, and Invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Sales Quotation Prefix</label>
                <input
                  type="text"
                  value={docSeries.quotationPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, quotationPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Proforma Invoice (PI) Prefix</label>
                <input
                  type="text"
                  value={docSeries.piPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, piPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Sales Order (SO) Prefix</label>
                <input
                  type="text"
                  value={docSeries.soPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, soPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Purchase Order (PO) Prefix</label>
                <input
                  type="text"
                  value={docSeries.poPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, poPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Delivery Challan (DC) Prefix</label>
                <input
                  type="text"
                  value={docSeries.challanPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, challanPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Dispatch / Bilty Prefix</label>
                <input
                  type="text"
                  value={docSeries.dispatchPrefix}
                  onChange={(e) => setDocSeries({ ...docSeries, dispatchPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Categories */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                Step 5: Activate Appliance Categories for Electromax Global
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select product categories to make available in your blank master catalog.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Room Heater', icon: Flame },
                { name: 'Electric Kettle', icon: Coffee },
                { name: 'Pedestal Fan', icon: Fan },
                { name: 'Table Fan', icon: Wind },
                { name: 'Wall Fan', icon: Maximize2 },
                { name: 'Mosquito Bat', icon: Zap },
              ].map((item) => {
                const isSelected = activeCategories.includes(item.name);
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => toggleCategory(item.name)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`p-2 rounded-lg ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isSelected ? '✓ Active' : 'Off'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Snow Wave & OEM Brand</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishWizard}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Configuration...' : 'Save & Launch Clean ERP'} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
