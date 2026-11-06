import React, { useState } from 'react';
import {
  Globe,
  Truck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
  Building,
  UserCheck,
  ExternalLink,
  Search,
  Bell,
  Phone,
  Mail,
  MessageSquare,
  PackageCheck,
  Receipt,
  FileCheck2,
  Box,
  Layers,
  Camera,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';

export const CustomerSupplierPortalView: React.FC = () => {
  const [portalMode, setPortalMode] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');

  // Customer Portal State
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-JOD-042');
  const [customerSubTab, setCustomerSubTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'QUOTATIONS' | 'PI_PAY' | 'INVOICES' | 'CHALLANS' | 'TRACKING' | 'WARRANTY' | 'CONTACT'
  >('DASHBOARD');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [payAmount, setPayAmount] = useState('55500');
  const [complaintPhoto, setComplaintPhoto] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [quotationActionMsg, setQuotationActionMsg] = useState<string | null>(null);

  // Supplier Portal State
  const [selectedSupplierId, setSelectedSupplierId] = useState('SUPP-JPR-011');
  const [supplierSubTab, setSupplierSubTab] = useState<
    'DASHBOARD' | 'POS' | 'DISPATCH_NOTICE' | 'GRN_STATUS' | 'PAYMENTS'
  >('DASHBOARD');
  const [poConfirmed, setPoConfirmed] = useState(false);
  const [vendorDispatchSent, setVendorDispatchSent] = useState(false);
  const [vendorInvoicePhoto, setVendorInvoicePhoto] = useState('');
  const [vendorBiltyPhoto, setVendorBiltyPhoto] = useState('');

  // Mock Active Commercial Orders for Customer
  const customerOrders = [
    {
      id: 'SO-2026-0891',
      date: '2026-11-02',
      items: 'Snow Wave Instant Room Heater 1000W (100 Pcs) + Electric Kettle 1.8L (100 Pcs)',
      total: 185000,
      advanceRequired: 55500,
      advanceStatus: paymentSuccess ? 'PAID' : 'PENDING',
      stage: paymentSuccess ? 'ASSEMBLY & TESTING' : 'AWAITING 30% ADVANCE',
      progress: paymentSuccess ? 65 : 20,
      transporter: 'V-Trans Express Logistics Ltd.',
      lrNumber: 'VT-JPR-99238',
      vehicleNo: 'RJ 14 GH 7821',
      boxes: 30,
      cbm: 1.95,
      weight: 704,
      biltyStatus: 'INSPECTION PASSED - READY TO DISPATCH',
    },
    {
      id: 'SO-2026-0740',
      date: '2026-10-18',
      items: 'Snow Wave Pedestal Fan High Speed 400mm (80 Pcs)',
      total: 144000,
      advanceRequired: 43200,
      advanceStatus: 'PAID',
      stage: 'DELIVERED',
      progress: 100,
      transporter: 'Jaipur Golden Transport Co.',
      lrNumber: 'JGT-JPR-98214',
      vehicleNo: 'RJ 14 ED 4412',
      boxes: 20,
      cbm: 1.4,
      weight: 480,
      biltyStatus: 'DELIVERED - POD ATTACHED',
    },
  ];

  // Mock Vendor POs
  const vendorPOs = [
    {
      id: 'PO-2026-0412',
      date: '2026-11-01',
      item: 'Nichrome Heating Element Wire 1000W (Grade A)',
      qty: '500 Rolls',
      deliveryDate: '2026-11-10',
      amount: 245000,
      status: poConfirmed ? 'CONFIRMED BY VENDOR' : 'PENDING ACCEPTANCE',
    },
    {
      id: 'PO-2026-0398',
      date: '2026-10-25',
      item: 'Thermostat Safety Bi-Metal Switch 16A',
      qty: '2000 Units',
      deliveryDate: '2026-11-05',
      amount: 110000,
      status: 'DISPATCHED IN TRANSIT',
    },
  ];

  const handleSimulatePayment = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const handleRegisterComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSubmitted(true);
    setTimeout(() => setComplaintSubmitted(false), 5000);
  };

  const handleVendorDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVendorDispatchSent(true);
    setTimeout(() => setVendorDispatchSent(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                External Client & Vendor Self-Service Portals
              </h1>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                24/7 Digital Self-Service
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Dedicated isolated workspaces for trade distributors and component suppliers. Razorpay UPI advance payments, live stage tracking, bilty LR proofs, PO confirmations & GRN inspections.
            </p>
          </div>
        </div>

        {/* Portal Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setPortalMode('CUSTOMER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalMode === 'CUSTOMER'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer / Distributor Portal
          </button>
          <button
            onClick={() => setPortalMode('SUPPLIER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalMode === 'SUPPLIER'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supplier / Vendor Portal
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: CUSTOMER / DISTRIBUTOR PORTAL
         ========================================================================= */}
      {portalMode === 'CUSTOMER' && (
        <div className="space-y-6">
          {/* Customer Context Bar & Sub-Nav */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                ME
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Logged In Customer Context:</span>
                <span className="font-bold text-white text-xs">
                  Marwar Electricals & Hardware Depot (CUST-JOD-042)
                </span>
                <span className="text-[10px] text-slate-400 block">Jodhpur, Rajasthan • GSTIN: 08AABCM1234D1Z5</span>
              </div>
            </div>

            {/* Notification Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> 2 Active Notifications
              </span>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'DASHBOARD', label: 'Overview Dashboard' },
              { id: 'ORDERS', label: 'Sales Orders & Stage Tracking' },
              { id: 'QUOTATIONS', label: 'Quotations' },
              { id: 'PI_PAY', label: 'Proforma Invoice & Advance Pay' },
              { id: 'INVOICES', label: 'Tax Invoices' },
              { id: 'CHALLANS', label: 'Delivery Challans & Packing CBM' },
              { id: 'TRACKING', label: 'Vehicle & Bilty (LR) Tracking' },
              { id: 'WARRANTY', label: 'Register RMA / Warranty Claim' },
              { id: 'CONTACT', label: 'Account Manager' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCustomerSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  customerSubTab === tab.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Customer Sub-View 1: Dashboard */}
          {customerSubTab === 'DASHBOARD' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders Placed</span>
                  <div className="text-xl font-mono font-bold text-white mt-1">2 Shipments</div>
                  <span className="text-[10px] text-emerald-400 font-medium">1 In Production • 1 Delivered</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Order Value</span>
                  <div className="text-xl font-mono font-bold text-white mt-1">₹3,29,000</div>
                  <span className="text-[10px] text-slate-400 font-medium">FY 2026-27</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Advance Paid</span>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    {paymentSuccess ? '₹98,700' : '₹43,200'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Razorpay Verified</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance Outstanding</span>
                  <div className="text-xl font-mono font-bold text-orange-400 mt-1">
                    {paymentSuccess ? '₹1,29,500' : '₹1,85,000'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Due against Bilty delivery</span>
                </div>
              </div>

              {/* Order Status Cards */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Commercial Order #SO-2026-0891 Live Stages
                </h3>

                <div className="relative pt-4 pb-2">
                  <div className="flex justify-between text-center text-xs">
                    {[
                      { name: '1. Confirmed', done: true },
                      { name: '2. 30% Advance', done: paymentSuccess },
                      { name: '3. Raw Materials', done: paymentSuccess },
                      { name: '4. Assembly & QC', done: paymentSuccess },
                      { name: '5. Packed & CBM', done: false },
                      { name: '6. Loaded in Truck', done: false },
                      { name: '7. Delivered', done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            step.done
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] mt-1.5 ${step.done ? 'text-white font-semibold' : 'text-slate-500'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Sub-View 2: Proforma Invoice & 30% Advance Pay */}
          {customerSubTab === 'PI_PAY' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <span className="text-orange-400 font-mono text-xs font-bold">PROFORMA INVOICE #PI-2627-0891</span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Order Value: ₹1,85,000 • 30% Production Advance: ₹55,500
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    paymentSuccess
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {paymentSuccess ? '✓ 30% Advance Confirmed' : 'Action Required: Pay 30% Advance'}
                </span>
              </div>

              {/* Payment Box */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-slate-950 p-6 rounded-xl border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    <span className="font-extrabold text-white text-sm">
                      Razorpay Smart Gateway • UPI / NetBanking / Corporate Cards
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Pay mandatory 30% advance deposit to release order into shop floor assembly. Instant digital receipt and SMS confirmation sent to registered mobile.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Accounts Department will receive automatic credit note ledger posting upon verification.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <div>
                    {paymentSuccess ? (
                      <div className="space-y-1">
                        <span className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-4 h-4" /> Advance Received
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono block">Txn: RZP-EMG-99214A</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isProcessingPay}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {isProcessingPay ? 'Verifying Gateway...' : 'Pay ₹55,500 Advance'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Sub-View 3: Quotations */}
          {customerSubTab === 'QUOTATIONS' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Official Commercial Quotations
              </h3>

              {quotationActionMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
                  {quotationActionMsg}
                </div>
              )}

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-orange-400 font-mono font-bold">QT-2026-0891</span>
                    <h4 className="font-bold text-white text-sm mt-0.5">
                      Wholesale Supply of Snow Wave Winter Heating Appliances
                    </h4>
                    <p className="text-slate-400 text-[11px]">Valid Until: 30 November 2026</p>
                  </div>
                  <span className="font-mono font-bold text-white text-base">₹1,85,000</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setQuotationActionMsg('Quotation #QT-2026-0891 accepted! Sales department notified.')}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Quotation
                  </button>
                  <button
                    onClick={() => setQuotationActionMsg('Quotation #QT-2026-0891 marked for price revision.')}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer"
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Sub-View 4: Vehicle & Bilty (LR) Tracking */}
          {customerSubTab === 'TRACKING' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" /> Transporter & Bilty (LR) Consignment Tracking
              </h3>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Carrier Transporter:</span>
                    <strong className="text-white">V-Trans Express Logistics Ltd.</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Official LR Number:</span>
                    <strong className="font-mono text-orange-400">VT-JPR-99238</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Assigned Truck Number:</span>
                    <strong className="font-mono text-white">RJ 14 GH 7821</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Driver Contact:</span>
                    <strong className="text-slate-200">Mohan Ram Gujjar (+91 94140 98765)</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    ✓ Physical paper bilty uploaded & verified by Electromax Logistics desk.
                  </span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Simulating direct link to V-Trans online consignment GPS tracking system.');
                    }}
                    className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded font-semibold text-xs flex items-center gap-1 hover:bg-orange-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Carrier Web Tracking
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Customer Sub-View 5: Register RMA / Warranty Claim */}
          {customerSubTab === 'WARRANTY' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" /> Register Product Complaint / Warranty Claim
              </h3>

              {complaintSubmitted && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
                  ✓ Warranty claim ticket registered successfully! Service engineer assigned.
                </div>
              )}

              <form onSubmit={handleRegisterComplaint} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Select Purchased Appliance</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                      <option>Snow Wave Instant Glow Room Heater (1000W)</option>
                      <option>Snow Wave Electric Kettle 1.8L Stainless Steel</option>
                      <option>Snow Wave Pedestal Fan High Speed 400mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Serial Number / Batch Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SNW-26-0891"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nature of Issue</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                      <option>Heating element not turning on</option>
                      <option>Thermostat cut-off trip</option>
                      <option>Transit carton damaged / dented piece</option>
                      <option>Switch or wire defect</option>
                    </select>
                  </div>
                </div>

                <PhotoCaptureField
                  label="Upload Defective Piece Photo / Damage Evidence"
                  value={complaintPhoto}
                  onChange={setComplaintPhoto}
                  helperText="Capture clear photograph of serial sticker & defective part."
                />

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Submit Warranty Replacement Request
                </button>
              </form>
            </div>
          )}

          {/* Customer Sub-View 6: Account Manager Contact Card */}
          {customerSubTab === 'CONTACT' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Dedicated Electromax Global Account Representative
              </h3>

              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-base">
                    SG
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Sunil Goyal</h4>
                    <span className="text-xs text-orange-400 font-medium">Senior Regional Sales Manager (Rajasthan & Gujarat)</span>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +91 98290 12345</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> sales@electromaxglobal.com</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Direct WhatsApp messaging initiated with Regional Sales Manager.')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    WhatsApp Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODE 2: SUPPLIER / VENDOR SELF-SERVICE PORTAL
         ========================================================================= */}
      {portalMode === 'SUPPLIER' && (
        <div className="space-y-6">
          {/* Supplier Context Bar */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                VN
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Logged In Supplier Context:</span>
                <span className="font-bold text-white text-xs">
                  Rajasthan Copper & Electrical Component Works (SUPP-JPR-011)
                </span>
                <span className="text-[10px] text-slate-400 block">VKI Industrial Area, Jaipur • GSTIN: 08AAACR8821B1Z9</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[11px] font-semibold">
                Vendor Status: Tier-1 Approved
              </span>
            </div>
          </div>

          {/* Supplier Sub Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'DASHBOARD', label: 'Supplier Dashboard' },
              { id: 'POS', label: 'Purchase Orders & Confirmations' },
              { id: 'DISPATCH_NOTICE', label: 'Send Outward Dispatch Notice (ASN)' },
              { id: 'GRN_STATUS', label: 'Factory GRN & Quality Inspections' },
              { id: 'PAYMENTS', label: 'Payment Ledger & Statements' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSupplierSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  supplierSubTab === tab.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Supplier Sub-View 1: Dashboard */}
          {supplierSubTab === 'DASHBOARD' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Open Purchase Orders</span>
                <div className="text-xl font-mono font-bold text-white mt-1">2 POs</div>
                <span className="text-[10px] text-amber-400 font-medium">₹3,55,000 Total Value</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Deliveries Dispatched</span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">1 Shipment</div>
                <span className="text-[10px] text-slate-400 font-medium">In Transit to Jaipur Plant</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">GRN Quality Rating</span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">99.4%</div>
                <span className="text-[10px] text-slate-400 font-medium">Zero Rejections in Oct</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Released</span>
                <div className="text-xl font-mono font-bold text-white mt-1">₹4,20,000</div>
                <span className="text-[10px] text-emerald-400 font-medium">Paid via RTGS / NEFT</span>
              </div>
            </div>
          )}

          {/* Supplier Sub-View 2: POs & Confirmation */}
          {supplierSubTab === 'POS' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Issued Purchase Orders from Electromax Global
              </h3>

              <div className="space-y-3 text-xs">
                {vendorPOs.map((po) => (
                  <div key={po.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-orange-400">{po.id}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{po.item}</h4>
                      <p className="text-slate-400 text-[11px]">
                        Quantity: <strong>{po.qty}</strong> • Target Delivery Date: <strong>{po.deliveryDate}</strong>
                      </p>
                    </div>

                    <div className="text-right space-y-2">
                      <span className="font-mono font-bold text-white text-base block">{formatINR(po.amount)}</span>
                      {po.id === 'PO-2026-0412' && !poConfirmed ? (
                        <button
                          onClick={() => setPoConfirmed(true)}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Confirm & Accept Delivery Date
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[11px]">
                          ✓ Confirmed by Vendor
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supplier Sub-View 3: Dispatch Notice (ASN) */}
          {supplierSubTab === 'DISPATCH_NOTICE' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" /> Send Advance Shipping Notice (ASN) & Vehicle Details
              </h3>

              {vendorDispatchSent && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
                  ✓ Dispatch notice submitted! Electromax factory gate and inventory team notified.
                </div>
              )}

              <form onSubmit={handleVendorDispatchSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Against PO #</label>
                    <input
                      type="text"
                      defaultValue="PO-2026-0412"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Supplier Invoice Number</label>
                    <input
                      type="text"
                      placeholder="RCW/2627/089"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="RJ 14 TB 9021"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Driver Contact</label>
                    <input
                      type="text"
                      placeholder="+91 98290 88214"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PhotoCaptureField
                    label="Supplier Stamped Tax Invoice Photo"
                    value={vendorInvoicePhoto}
                    onChange={setVendorInvoicePhoto}
                    helperText="Upload or photograph supplier GST invoice"
                  />
                  <PhotoCaptureField
                    label="Transporter LR / Bilty Copy"
                    value={vendorBiltyPhoto}
                    onChange={setVendorBiltyPhoto}
                    helperText="Capture lorry receipt from carrier"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Notify Electromax Factory of Dispatched Goods
                </button>
              </form>
            </div>
          )}

          {/* Supplier Sub-View 4: GRN Status */}
          {supplierSubTab === 'GRN_STATUS' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Factory Goods Receipt (GRN) Inspection Results
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-mono font-bold text-orange-400">GRN-2026-0398</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold">100% ACCEPTED</span>
                </div>
                <p className="text-white font-semibold">Thermostat Safety Bi-Metal Switch 16A (2,000 Units)</p>
                <p className="text-slate-400 text-[11px]">
                  Inspected by QA Lab at Vishwakarma Industrial Area Plant. Electrical continuity and thermal cutoff resistance verified.
                </p>
              </div>
            </div>
          )}

          {/* Supplier Sub-View 5: Payments */}
          {supplierSubTab === 'PAYMENTS' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Vendor Payment Statements & UTR References
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-emerald-400 font-bold">UTR: HDFCR520261028004128</span>
                  <span className="font-mono font-bold text-white">₹4,20,000</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Paid on 28 October 2026 via RTGS from State Bank of India • Authorized Signatory: Mr. Sushil Goyal
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
