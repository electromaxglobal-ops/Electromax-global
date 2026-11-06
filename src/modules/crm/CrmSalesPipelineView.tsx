import React, { useState, useEffect } from 'react';
import {
  Users2,
  PhoneCall,
  MessageSquare,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Building,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Search,
  CheckCheck,
  Printer,
  Eye,
  Camera,
  Layers,
  Percent,
  Download,
  Clock,
  X,
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';
import { TransactionItemsTable, TransactionLineItem, FinancialSummary } from '../../components/common/TransactionItemsTable.tsx';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface Lead {
  id: number;
  customerName: string;
  companyName: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  source: string | null;
  status: string;
  assignedExecutive: string | null;
  expectedValue: string;
  notes: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

interface Quotation {
  id: number;
  quotationNo: string;
  customerName: string;
  customerPhone: string | null;
  subtotal: string;
  taxAmount: string;
  grandTotal: string;
  paymentTerms: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  itemsJson?: string | null;
  status: string;
  createdAt: string;
}

interface ProformaInvoice {
  id: number;
  piNo: string;
  customerName: string;
  totalAmount: string;
  advancePercent: string;
  advanceRequired: string;
  advanceReceived: string;
  balanceAmount: string;
  paymentLink: string | null;
  qrCodeUrl: string | null;
  paymentStatus: string;
  paymentRef: string | null;
  bankDetails: string | null;
  itemsJson?: string | null;
  createdAt: string;
}

interface SalesOrder {
  id: number;
  orderNo: string;
  customerName: string;
  totalAmount: string;
  advancePaid: string;
  status: string;
  trackingToken: string;
  expectedDeliveryDate: string | null;
  createdAt: string;
}

export const CrmSalesPipelineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'QUOTATIONS' | 'PI' | 'ORDERS'>('LEADS');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewQuotationOpen, setIsNewQuotationOpen] = useState(false);
  const [isVerifyPaymentOpen, setIsVerifyPaymentOpen] = useState(false);
  const [selectedPi, setSelectedPi] = useState<ProformaInvoice | null>(null);
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState<Quotation | null>(null);
  const [paymentUtr, setPaymentUtr] = useState('');

  // Lead Form
  const [leadCustomer, setLeadCustomer] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCity, setLeadCity] = useState('Jaipur');
  const [leadSource, setLeadSource] = useState('Direct Inquiry');
  const [leadValue, setLeadValue] = useState('250000.00');
  const [leadNotes, setLeadNotes] = useState('Wholesale requirement for Snow Wave Pedestal Fans & Heaters');
  const [leadPhotoUrl, setLeadPhotoUrl] = useState('');

  // Multi-Product Quotation Form
  const [qtnCustomer, setQtnCustomer] = useState('');
  const [qtnCompany, setQtnCompany] = useState('');
  const [qtnPhone, setQtnPhone] = useState('');
  const [qtnEmail, setQtnEmail] = useState('');
  const [qtnCity, setQtnCity] = useState('Jaipur');
  const [qtnDeliveryTerms, setQtnDeliveryTerms] = useState('Ex-Factory Jaipur (VKIA Unit)');
  const [qtnNotes, setQtnNotes] = useState('1 Year Standard Warranty. Delivery 5-7 working days after advance.');
  const [qtnItems, setQtnItems] = useState<TransactionLineItem[]>([]);
  const [qtnSummary, setQtnSummary] = useState<FinancialSummary>({
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    isInterState: false, // Default Intra-State Rajasthan (CGST+SGST)
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    freightCharges: 0,
    packagingCharges: 0,
    roundOff: 0,
    grandTotal: 0,
    advancePercentage: 30,
    advanceAmount: 0,
    balanceAmount: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLeads, resQtns, resPis, resSos] = await Promise.all([
        fetch('/api/crm/leads').then((r) => r.json()),
        fetch('/api/sales/quotations').then((r) => r.json()),
        fetch('/api/sales/proforma-invoices').then((r) => r.json()),
        fetch('/api/sales/orders').then((r) => r.json()),
      ]);
      setLeads(Array.isArray(resLeads) ? resLeads : []);
      setQuotations(Array.isArray(resQtns) ? resQtns : []);
      setProformaInvoices(Array.isArray(resPis) ? resPis : []);
      setSalesOrders(Array.isArray(resSos) ? resSos : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: leadCustomer,
          companyName: leadCompany,
          phone: leadPhone,
          email: leadEmail,
          city: leadCity,
          source: leadSource,
          expectedValue: leadValue,
          notes: leadNotes,
          assignedExecutive: 'Mr. Sushil Goyal',
        }),
      });
      if (res.ok) {
        setIsNewLeadOpen(false);
        setLeadCustomer('');
        setLeadPhone('');
        setLeadPhotoUrl('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNewQuotation = (lead?: Lead) => {
    if (lead) {
      setQtnCustomer(lead.customerName);
      setQtnCompany(lead.companyName || '');
      setQtnPhone(lead.phone);
      setQtnEmail(lead.email || '');
      setQtnCity(lead.city || 'Jaipur');
    } else {
      setQtnCustomer('');
      setQtnCompany('');
      setQtnPhone('');
      setQtnEmail('');
      setQtnCity('Jaipur');
    }

    setQtnItems([]);
    setQtnSummary({
      subtotal: 0,
      totalDiscount: 0,
      taxableAmount: 0,
      isInterState: false,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      freightCharges: 0,
      packagingCharges: 0,
      roundOff: 0,
      grandTotal: 0,
      advancePercentage: 30,
      advanceAmount: 0,
      balanceAmount: 0,
    });
    setIsNewQuotationOpen(true);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qtnItems.length === 0) {
      alert('Please add at least one product line item to generate the quotation.');
      return;
    }

    try {
      const taxTotal = qtnSummary.isInterState ? qtnSummary.igstTotal : qtnSummary.cgstTotal + qtnSummary.sgstTotal;

      const res = await fetch('/api/sales/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: qtnCompany ? `${qtnCustomer} (${qtnCompany})` : qtnCustomer,
          customerPhone: qtnPhone,
          subtotal: String(qtnSummary.taxableAmount),
          taxAmount: String(taxTotal),
          grandTotal: String(qtnSummary.grandTotal),
          paymentTerms: `${qtnSummary.advancePercentage}% Advance (₹${formatIndianNumber(qtnSummary.advanceAmount)}), Balance ${100 - qtnSummary.advancePercentage}% on Dispatch (₹${formatIndianNumber(qtnSummary.balanceAmount)})`,
          deliveryTerms: qtnDeliveryTerms,
          notes: qtnNotes,
          itemsJson: JSON.stringify(qtnItems),
        }),
      });

      if (res.ok) {
        setIsNewQuotationOpen(false);
        fetchData();
        setActiveTab('QUOTATIONS');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save quotation');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConvertToPi = async (quotationId: number) => {
    try {
      const res = await fetch(`/api/sales/quotations/${quotationId}/convert-to-pi`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
        setActiveTab('PI');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyAdvancePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPi) return;
    try {
      const res = await fetch(`/api/sales/proforma-invoices/${selectedPi.id}/verify-advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentRef: paymentUtr || `UTR-SBI-${Date.now().toString().slice(-6)}`,
          amountReceived: selectedPi.advanceRequired,
        }),
      });
      if (res.ok) {
        setIsVerifyPaymentOpen(false);
        setSelectedPi(null);
        await fetchData();
        setActiveTab('ORDERS');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              B2B Sales Pipeline & Order Automation
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            End-to-end B2B sales cycle with multi-product catalog selector, 30% advance split, online customer portal, and order release.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            + New Lead
          </button>
          <button
            onClick={() => handleOpenNewQuotation()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            + Create Multi-Item Quotation
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'LEADS', label: '1. Inquiries & Leads', icon: Users2, count: leads.length },
          { id: 'QUOTATIONS', label: '2. Sales Quotations', icon: FileText, count: quotations.length },
          { id: 'PI', label: '3. Proforma Invoices (30% Adv)', icon: Receipt, count: proformaInvoices.length },
          { id: 'ORDERS', label: '4. Confirmed Sales Orders', icon: CheckCircle2, count: salesOrders.length },
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
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LEADS */}
      {activeTab === 'LEADS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              No leads currently in the pipeline. Click "+ New Lead" to log customer inquiry.
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{lead.customerName}</h3>
                      {lead.companyName && (
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {lead.companyName}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-3 line-clamp-2">
                    {lead.notes || 'Inquiry logged for Electromax appliances.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80 mb-3">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Expected Deal:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {formatINR(parseFloat(lead.expectedValue))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Location:</span>
                      <span className="text-slate-300 font-medium">{lead.city || 'Rajasthan'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500">{lead.phone}</span>
                  <button
                    onClick={() => handleOpenNewQuotation(lead)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer"
                  >
                    Generate Quotation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: QUOTATIONS */}
      {activeTab === 'QUOTATIONS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Quotation No</th>
                <th className="py-3 px-3">Customer / Firm</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">GST</th>
                <th className="py-3 px-3 text-right font-bold text-white">Grand Total</th>
                <th className="py-3 px-3">Payment Terms</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No quotations generated yet. Click "+ Create Multi-Item Quotation" above.
                  </td>
                </tr>
              ) : (
                quotations.map((qtn) => (
                  <tr key={qtn.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{qtn.quotationNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div>{qtn.customerName}</div>
                      <div className="text-[10px] text-slate-500">{qtn.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatINR(parseFloat(qtn.subtotal))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatINR(parseFloat(qtn.taxAmount))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(parseFloat(qtn.grandTotal))}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {qtn.paymentTerms}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {qtn.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedQuotationForPrint(qtn)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          title="View & Print Official Quotation"
                        >
                          <Eye className="w-4 h-4 text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConvertToPi(qtn.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Convert to PI
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PROFORMA INVOICES */}
      {activeTab === 'PI' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">PI Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-right text-amber-400 font-bold">30% Advance Req</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Payment Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {proformaInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No proforma invoices generated yet. Convert a quotation from Tab 2.
                  </td>
                </tr>
              ) : (
                proformaInvoices.map((pi) => (
                  <tr key={pi.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{pi.piNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{pi.customerName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">
                      {formatINR(parseFloat(pi.totalAmount))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {formatINR(parseFloat(pi.advanceRequired))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatINR(parseFloat(pi.balanceAmount))}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pi.paymentStatus === 'ADVANCE_VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {pi.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {pi.paymentStatus !== 'ADVANCE_VERIFIED' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPi(pi);
                            setIsVerifyPaymentOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Verify 30% Advance
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1">
                          <CheckCheck className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: SALES ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3 text-right">Order Value</th>
                <th className="py-3 px-3 text-right text-emerald-400">Advance Paid</th>
                <th className="py-3 px-3">Tracking Token</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No confirmed sales orders yet. Verify 30% advance on a Proforma Invoice to release order.
                  </td>
                </tr>
              ) : (
                salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{so.orderNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{so.customerName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatINR(parseFloat(so.totalAmount))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {formatINR(parseFloat(so.advancePaid))}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {so.trackingToken}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Multi-Product Quotation Generator */}
      {isNewQuotationOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl relative max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img src="/electromax-logo.png" alt="Electromax" className="w-8 h-8 object-contain" />
                <div>
                  <h2 className="text-base font-bold text-white">Generate Multi-Item Sales Quotation</h2>
                  <p className="text-xs text-slate-400">
                    Electromax Global • Road No. 14, VKIA, Jaipur • Founder & Director: Mr. Sushil Goyal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewQuotationOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-5">
              {/* Customer Details Grid */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Customer / Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={qtnCustomer}
                    onChange={(e) => setQtnCustomer(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={qtnCompany}
                    onChange={(e) => setQtnCompany(e.target.value)}
                    placeholder="e.g. Goyal Electronics Traders"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={qtnPhone}
                    onChange={(e) => setQtnPhone(e.target.value)}
                    placeholder="+91 98290 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">City & State</label>
                  <input
                    type="text"
                    value={qtnCity}
                    onChange={(e) => setQtnCity(e.target.value)}
                    placeholder="Jaipur, Rajasthan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Multi-Row Line Items Table */}
              <TransactionItemsTable
                items={qtnItems}
                onChangeItems={setQtnItems}
                summary={qtnSummary}
                onChangeSummary={setQtnSummary}
                priceType="SALE"
                documentType="QUOTATION"
              />

              {/* Delivery Terms and Special Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Delivery / Transport Terms</label>
                  <input
                    type="text"
                    value={qtnDeliveryTerms}
                    onChange={(e) => setQtnDeliveryTerms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quotation Notes / Warranty Terms</label>
                  <input
                    type="text"
                    value={qtnNotes}
                    onChange={(e) => setQtnNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewQuotationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save & Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Lead with Camera Support */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-amber-500" />
                Register Sales Lead / B2B Inquiry
              </h2>
              <button onClick={() => setIsNewLeadOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={leadCustomer}
                    onChange={(e) => setLeadCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={leadCity}
                    onChange={(e) => setLeadCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Deal Value (₹)</label>
                  <input
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Camera Photo for Visiting Card / Customer Store */}
              <PhotoCaptureField
                label="Visiting Card / Storefront Camera Photo"
                value={leadPhotoUrl}
                onChange={setLeadPhotoUrl}
                helperText="Capture business card or shop entrance using live device camera."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLeadOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Verify 30% Advance */}
      {isVerifyPaymentOpen && selectedPi && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Verify 30% Advance Payment
              </h2>
              <button onClick={() => setIsVerifyPaymentOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleVerifyAdvancePayment} className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Proforma Invoice:</span>
                  <span className="font-mono font-bold text-white">{selectedPi.piNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-white">{selectedPi.customerName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-emerald-400 font-bold">
                  <span>30% Advance Required:</span>
                  <span className="font-mono text-sm">{formatINR(parseFloat(selectedPi.advanceRequired))}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bank UTR / Transaction Reference Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-98234123"
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVerifyPaymentOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Confirm & Release Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View & Print Quotation Document */}
      {selectedQuotationForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img src="/electromax-logo.png" alt="Electromax" className="w-10 h-10 object-contain" />
                <div>
                  <h3 className="text-base font-bold text-white">ELECTROMAX GLOBAL</h3>
                  <p className="text-xs text-slate-400">Road No. 14, VKIA, Jaipur, Rajasthan • Founder & Director: Mr. Sushil Goyal</p>
                </div>
              </div>
              <button onClick={() => setSelectedQuotationForPrint(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-500 block">Quotation No:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedQuotationForPrint.quotationNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Customer:</span>
                <span className="text-white font-semibold">{selectedQuotationForPrint.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date:</span>
                <span className="text-slate-300">{new Date(selectedQuotationForPrint.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Payment Terms:</span>
                <span className="text-amber-400 font-medium">{selectedQuotationForPrint.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Grand Total:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {formatINR(parseFloat(selectedQuotationForPrint.grandTotal))}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Official Computer Generated Quotation</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                Print Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
