import React, { useState, useEffect } from 'react';
import {
  Truck,
  FileCheck2,
  Camera,
  Upload,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Layers,
  ShieldCheck,
  Receipt,
  QrCode,
  MapPin,
  Printer,
  Trash2,
  Box,
  Scale,
  Calendar,
  AlertTriangle,
  UserCheck,
  Building,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';
import { formatINR, formatIndianNumber } from '../../utils/formatters.ts';

interface DispatchItem {
  productId: number;
  productName: string;
  categoryName?: string;
  modelNumber?: string;
  colour?: string;
  skuCode?: string;
  hsnCode?: string;
  availableStock: number;
  quantity: number;
  unit: string;
  cartonCount: number;
  qtyPerCarton: number;
  dimensionsCm: string; // e.g. "45x30x25"
  unitWeightKg: number;
  totalWeightKg: number;
  cbm: number;
  remarks?: string;
}

interface Dispatch {
  id: number;
  dispatchNo: string;
  customerName: string;
  destination: string;
  transporterName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string | null;
  cartonCount: number;
  totalWeightKg: string;
  totalCbm: string;
  freightCharges: string;
  ewayBillNo: string | null;
  biltyNo: string | null;
  trackingToken: string;
  status: string;
  dispatchDate: string;
  createdAt: string;
}

export const DispatchLogisticsView: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [isBiltyModalOpen, setIsBiltyModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDispatch, setReportDispatch] = useState<any>(null);

  // Form State: Consignment Header
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('Marwar Electricals & Hardware Depot');
  const [customerCode, setCustomerCode] = useState('CUST-JOD-042');
  const [destination, setDestination] = useState('Jodhpur, Rajasthan');
  const [salesOrderNo, setSalesOrderNo] = useState('SO-2026-0891');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2627-1044');
  const [transporterName, setTransporterName] = useState('V-Trans Express Logistics Ltd.');
  const [vehicleNo, setVehicleNo] = useState('RJ 14 GH 7821');
  const [driverName, setDriverName] = useState('Mohan Ram Gujjar');
  const [driverPhone, setDriverPhone] = useState('+91 94140 98765');
  const [freightCharges, setFreightCharges] = useState('8500.00');
  const [ewayBillNo, setEwayBillNo] = useState('241198304910');
  const [biltyNo, setBiltyNo] = useState('VT-JPR-99238');

  // Loading & Security Verification
  const [loadingStartTime, setLoadingStartTime] = useState(
    new Date(Date.now() - 3600000).toISOString().slice(11, 16)
  );
  const [loadingCompletionTime, setLoadingCompletionTime] = useState(
    new Date().toISOString().slice(11, 16)
  );
  const [loadingSupervisor, setLoadingSupervisor] = useState('Ramesh Sharma (Warehouse Head)');
  const [securityChecked, setSecurityChecked] = useState(true);
  const [gatePassNumber, setGatePassNumber] = useState(
    `GP-JPR-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [gateOutwardTime, setGateOutwardTime] = useState(new Date().toISOString().slice(11, 16));

  // 7 Hardware Vehicle Loading Evidence Photos
  const [vehicleFrontPhoto, setVehicleFrontPhoto] = useState('');
  const [vehiclePlatePhoto, setVehiclePlatePhoto] = useState('');
  const [vehicleSidePhoto, setVehicleSidePhoto] = useState('');
  const [goodsPhoto, setGoodsPhoto] = useState('');
  const [cartonPhoto, setCartonPhoto] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState('');
  const [finalLoadedVehiclePhoto, setFinalLoadedVehiclePhoto] = useState('');

  // Multi-Product Line Items
  const [lineItems, setLineItems] = useState<DispatchItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bilty Form
  const [officialLr, setOfficialLr] = useState('');
  const [biltyDocUrl, setBiltyDocUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dspRes, whRes, prodRes] = await Promise.all([
        fetch('/api/dispatches').then((r) => r.json()).catch(() => []),
        fetch('/api/warehouses').then((r) => r.json()).catch(() => []),
        fetch('/api/products').then((r) => r.json()).catch(() => []),
      ]);
      setDispatches(Array.isArray(dspRes) ? dspRes : []);
      if (Array.isArray(whRes) && whRes.length > 0) {
        setWarehouses(whRes);
        setSelectedWarehouseId(whRes[0].id);
      }
      if (Array.isArray(prodRes) && prodRes.length > 0) {
        setProducts(prodRes);
        // Default seed items if empty
        if (lineItems.length === 0) {
          const p1 = prodRes[0];
          const p2 = prodRes[1] || prodRes[0];
          setLineItems([
            {
              productId: p1.id,
              productName: p1.name,
              categoryName: p1.category?.name || 'Heaters',
              modelNumber: p1.code,
              colour: 'Jet Black',
              skuCode: `${p1.code}-BLK`,
              hsnCode: p1.hsnCode || '8516',
              availableStock: Number(p1.stockQuantity || 450),
              quantity: 200,
              unit: p1.uom || 'PCS',
              cartonCount: 20,
              qtyPerCarton: 10,
              dimensionsCm: '55x40x35',
              unitWeightKg: 2.8,
              totalWeightKg: 560,
              cbm: 1.54,
              remarks: 'Brand New Snow Wave Packaging',
            },
            {
              productId: p2.id,
              productName: p2.name,
              categoryName: p2.category?.name || 'Kettles',
              modelNumber: p2.code,
              colour: 'Crimson Red',
              skuCode: `${p2.code}-RED`,
              hsnCode: p2.hsnCode || '8516',
              availableStock: Number(p2.stockQuantity || 320),
              quantity: 120,
              unit: p2.uom || 'PCS',
              cartonCount: 10,
              qtyPerCarton: 12,
              dimensionsCm: '48x32x30',
              unitWeightKg: 1.2,
              totalWeightKg: 144,
              cbm: 0.46,
              remarks: 'Export Quality Master Cartons',
            },
          ]);
        }
      }
    } catch (e) {
      console.error('Failed to load dispatch data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Aggregates
  const totalQuantity = lineItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const totalCartons = lineItems.reduce((acc, item) => acc + (Number(item.cartonCount) || 0), 0);
  const totalWeight = lineItems.reduce((acc, item) => acc + (Number(item.totalWeightKg) || 0), 0);
  const totalCbmCalc = lineItems.reduce((acc, item) => acc + (Number(item.cbm) || 0), 0);

  const handleAddProductItem = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === Number(selectedProductToAdd));
    if (!prod) return;

    const newItem: DispatchItem = {
      productId: prod.id,
      productName: prod.name,
      categoryName: prod.category?.name || 'Appliances',
      modelNumber: prod.code,
      colour: 'Standard',
      skuCode: `${prod.code}-STD`,
      hsnCode: prod.hsnCode || '8516',
      availableStock: Number(prod.stockQuantity || 250),
      quantity: 50,
      unit: prod.uom || 'PCS',
      cartonCount: 5,
      qtyPerCarton: 10,
      dimensionsCm: '50x35x30',
      unitWeightKg: 2.5,
      totalWeightKg: 125,
      cbm: 0.26,
      remarks: 'Inspected and verified',
    };

    setLineItems([...lineItems, newItem]);
    setSelectedProductToAdd('');
  };

  const handleUpdateItem = (index: number, field: keyof DispatchItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    // Auto-calculate cartons, weight, and CBM if related values change
    if (field === 'quantity' || field === 'qtyPerCarton') {
      const q = Number(field === 'quantity' ? value : item.quantity) || 0;
      const perBox = Number(field === 'qtyPerCarton' ? value : item.qtyPerCarton) || 1;
      item.cartonCount = Math.ceil(q / perBox);
      item.totalWeightKg = Number((q * (item.unitWeightKg || 1)).toFixed(2));
    }
    if (field === 'unitWeightKg') {
      const uw = Number(value) || 0;
      item.totalWeightKg = Number((item.quantity * uw).toFixed(2));
    }
    if (field === 'dimensionsCm' || field === 'cartonCount') {
      try {
        const parts = String(item.dimensionsCm).split('x').map((n) => Number(n.trim()));
        if (parts.length === 3 && !parts.some(isNaN)) {
          const singleBoxCbm = (parts[0] * parts[1] * parts[2]) / 1000000;
          item.cbm = Number((singleBoxCbm * (item.cartonCount || 1)).toFixed(3));
        }
      } catch (e) {
        // preserve existing cbm
      }
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (lineItems.length === 0) {
      setFormError('Please add at least one product item to dispatch.');
      return;
    }
    if (!selectedWarehouseId) {
      setFormError('Please select source dispatch warehouse.');
      return;
    }
    if (!securityChecked) {
      setFormError('Security outward verification check must be confirmed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName,
        customerCode,
        destination,
        salesOrderNo,
        invoiceNumber,
        warehouseId: Number(selectedWarehouseId),
        transporterName,
        vehicleNo,
        driverName,
        driverPhone,
        cartonCount: totalCartons || 1,
        totalWeightKg: totalWeight.toFixed(2),
        totalCbm: totalCbmCalc.toFixed(3),
        freightCharges,
        ewayBillNo,
        biltyNo,
        loadingStartTime,
        loadingCompletionTime,
        loadingSupervisor,
        gatePassNumber,
        gateOutwardTime,
        vehiclePhotoUrl: vehicleFrontPhoto,
        vehicleFrontPhoto,
        vehiclePlatePhoto,
        vehicleSidePhoto,
        goodsPhoto,
        cartonPhoto,
        loadingPhotoUrl: loadingPhoto,
        loadingPhoto,
        finalLoadedVehiclePhoto,
        items: lineItems.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          skuCode: it.skuCode,
          quantity: it.quantity,
          cartons: it.cartonCount,
          weightKg: it.totalWeightKg,
          cbm: it.cbm,
          unitRate: 1200,
        })),
      };

      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register consignment dispatch');
      }

      const created = await res.json();
      setIsNewDispatchOpen(false);
      fetchData();
      // Show report
      setReportDispatch({ ...created, ...payload, items: lineItems });
      setIsReportModalOpen(true);
    } catch (err: any) {
      setFormError(err.message || 'Dispatch creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadBilty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatch) return;
    try {
      const res = await fetch(`/api/dispatches/${selectedDispatch.id}/bilty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterName: selectedDispatch.transporterName,
          officialLrNumber: officialLr,
          biltyDocumentUrl: biltyDocUrl,
          cartonCount: selectedDispatch.cartonCount,
          weightKg: selectedDispatch.totalWeightKg,
          freightAmount: selectedDispatch.freightCharges,
          destinationCity: selectedDispatch.destination,
        }),
      });
      if (res.ok) {
        setIsBiltyModalOpen(false);
        setSelectedDispatch(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewLiveTracking = async (token: string) => {
    try {
      const res = await fetch(`/api/public/track/${token}`).then((r) => r.json());
      setTrackingData(res);
      setIsTrackingModalOpen(true);
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
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Dispatch, Multi-Product Vehicle Loading & Bilty (LR) Logistics
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Consignment Outward Engine: Multi-product line items with auto-computed cartons, weight, and CBM; full 7-point vehicle loading photograph audit via hardware camera; automated stock deduction; and immutable stock movement ledger posting.
          </p>
        </div>

        <button
          onClick={() => setIsNewDispatchOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Consignment Dispatch & Loading
        </button>
      </div>

      {/* Dispatches Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-orange-400" />
            Consignment Outward Dispatches & Logistics Status
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {dispatches.length} Active Consignments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Dispatch #</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Vehicle & Driver</th>
                <th className="py-3 px-4">Cartons / Weight / CBM</th>
                <th className="py-3 px-4">Transporter & Bilty #</th>
                <th className="py-3 px-4">E-Way Bill</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Logistics Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {dispatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No outward dispatches recorded yet. Click &quot;Create Consignment Dispatch & Loading&quot; to begin.
                  </td>
                </tr>
              ) : (
                dispatches.map((dsp) => (
                  <tr key={dsp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-orange-400">
                      {dsp.dispatchNo}
                      <div className="text-[10px] text-slate-500 font-normal">{dsp.dispatchDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{dsp.customerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        {dsp.destination}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">
                      <div className="font-bold">{dsp.vehicleNo}</div>
                      <div className="text-[10px] text-slate-400">
                        {dsp.driverName} ({dsp.driverPhone || 'N/A'})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-emerald-400 font-bold">{dsp.cartonCount} Master Boxes</div>
                      <div className="text-[10px] text-slate-400">
                        {Number(dsp.totalCbm).toFixed(3)} m³ | {dsp.totalWeightKg} kg
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{dsp.transporterName}</div>
                      <div className="font-mono text-[10px] text-amber-400 font-bold">
                        LR: {dsp.biltyNo || 'Pending Bilty'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {dsp.ewayBillNo || 'Auto / Linked'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {dsp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedDispatch(dsp);
                          setOfficialLr(dsp.biltyNo || '');
                          setIsBiltyModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-orange-400" />
                        Upload Bilty
                      </button>
                      <button
                        onClick={() => handleViewLiveTracking(dsp.trackingToken)}
                        className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-semibold rounded text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Portal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Full Consignment Dispatch, Product Line Items & 7-Point Vehicle Loading */}
      {isNewDispatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold text-white">
                  Dispatch & Vehicle Loading Outward • Multi-Product Manifest
                </h2>
              </div>
              <button
                onClick={() => setIsNewDispatchOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="p-6 overflow-y-auto space-y-6">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Customer & Consignment Header */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4" /> 1. Customer & Destination Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Customer Code</label>
                    <input
                      type="text"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Dispatch Warehouse</label>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name} ({w.warehouseType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Destination City & State</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Sales Order #</label>
                    <input
                      type="text"
                      value={salesOrderNo}
                      onChange={(e) => setSalesOrderNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Tax Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Multi-Product Line Items Table */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                      <Box className="w-4 h-4" /> 2. Multi-Product Manifest Line Items
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Product Name, Model, Colour, SKU, HSN, Quantity, Cartons, Dimensions, Weight & CBM.
                    </p>
                  </div>

                  {/* Add Product Line Picker */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => setSelectedProductToAdd(e.target.value ? Number(e.target.value) : '')}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="">-- Select Product from Catalog --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddProductItem}
                      disabled={!selectedProductToAdd}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Product / Model</th>
                        <th className="py-2.5 px-2">Colour / SKU</th>
                        <th className="py-2.5 px-2">HSN</th>
                        <th className="py-2.5 px-2 text-right">Dispatch Qty</th>
                        <th className="py-2.5 px-2 text-right">Qty/Carton</th>
                        <th className="py-2.5 px-2 text-right">Boxes</th>
                        <th className="py-2.5 px-2">Dimensions (LxWxH cm)</th>
                        <th className="py-2.5 px-2 text-right">Wt (KG)</th>
                        <th className="py-2.5 px-2 text-right">CBM (m³)</th>
                        <th className="py-2.5 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3">
                            <div className="font-bold text-white truncate max-w-[150px]">{item.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.modelNumber}</div>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.colour || ''}
                              onChange={(e) => handleUpdateItem(idx, 'colour', e.target.value)}
                              className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                              placeholder="Colour"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.skuCode}</div>
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-300">{item.hsnCode}</td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                              className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono font-bold text-right"
                            />
                            <span className="text-[10px] text-slate-400 block">{item.unit}</span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.qtyPerCarton}
                              onChange={(e) => handleUpdateItem(idx, 'qtyPerCarton', Number(e.target.value))}
                              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-amber-400">
                            {item.cartonCount}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.dimensionsCm}
                              onChange={(e) => handleUpdateItem(idx, 'dimensionsCm', e.target.value)}
                              className="w-24 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                              placeholder="50x30x25"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-200">
                            {item.totalWeightKg} kg
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-orange-400">
                            {Number(item.cbm).toFixed(3)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900/90 font-bold text-slate-200 border-t border-slate-800 text-xs">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right text-orange-400 uppercase">
                          Consignment Totals:
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-emerald-400">
                          {totalQuantity} Units
                        </td>
                        <td></td>
                        <td className="py-2 px-2 text-right font-mono text-amber-400">
                          {totalCartons} Boxes
                        </td>
                        <td></td>
                        <td className="py-2 px-2 text-right font-mono text-white">
                          {totalWeight.toFixed(2)} KG
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-orange-400">
                          {totalCbmCalc.toFixed(3)} m³
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Section 3: Transporter & Vehicle Logistics */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4" /> 3. Transporter & Carrier Assignment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300">Transporter Name</label>
                    <input
                      type="text"
                      required
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Vehicle Number</label>
                    <input
                      type="text"
                      required
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="RJ 14 GH 7821"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Transporter LR Bilty #</label>
                    <input
                      type="text"
                      value={biltyNo}
                      onChange={(e) => setBiltyNo(e.target.value)}
                      placeholder="e.g. VT-JPR-99238"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Driver Name</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Driver Phone</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">E-Way Bill Number</label>
                    <input
                      type="text"
                      value={ewayBillNo}
                      onChange={(e) => setEwayBillNo(e.target.value)}
                      placeholder="241198304910"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Freight Charges (₹)</label>
                    <input
                      type="number"
                      value={freightCharges}
                      onChange={(e) => setFreightCharges(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: 7-Point Vehicle Loading Photographs (Hardware Camera Integration) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4" /> 4. Vehicle Loading Photograph Evidence (7 Inspection Angles)
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Live camera capture required for gate outward clearance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <PhotoCaptureField
                    label="1. Vehicle Front View"
                    value={vehicleFrontPhoto}
                    onChange={setVehicleFrontPhoto}
                    helperText="Truck cabin & windshield"
                  />
                  <PhotoCaptureField
                    label="2. Number Plate Close-up"
                    value={vehiclePlatePhoto}
                    onChange={setVehiclePlatePhoto}
                    helperText="Legible transport license plate"
                  />
                  <PhotoCaptureField
                    label="3. Vehicle Side View"
                    value={vehicleSidePhoto}
                    onChange={setVehicleSidePhoto}
                    helperText="Body length & carrier condition"
                  />
                  <PhotoCaptureField
                    label="4. Goods Loaded Inside"
                    value={goodsPhoto}
                    onChange={setGoodsPhoto}
                    helperText="Appliance boxes inside cargo bed"
                  />
                  <PhotoCaptureField
                    label="5. Carton Condition"
                    value={cartonPhoto}
                    onChange={setCartonPhoto}
                    helperText="Packaging seals & straps"
                  />
                  <PhotoCaptureField
                    label="6. Loading In-Progress"
                    value={loadingPhoto}
                    onChange={setLoadingPhoto}
                    helperText="Labour handling & stacking"
                  />
                  <PhotoCaptureField
                    label="7. Loaded Vehicle Ready"
                    value={finalLoadedVehiclePhoto}
                    onChange={setFinalLoadedVehiclePhoto}
                    helperText="Tarpaulin covered & sealed truck"
                  />
                </div>
              </div>

              {/* Section 5: Loading Timing, Supervisor & Security Gate Pass */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 5. Loading Timing, Supervisor & Security Verification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Loading Start Time</label>
                    <input
                      type="time"
                      value={loadingStartTime}
                      onChange={(e) => setLoadingStartTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Loading Completion Time</label>
                    <input
                      type="time"
                      value={loadingCompletionTime}
                      onChange={(e) => setLoadingCompletionTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Loading Supervisor</label>
                    <input
                      type="text"
                      value={loadingSupervisor}
                      onChange={(e) => setLoadingSupervisor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Gate Pass Number</label>
                    <input
                      type="text"
                      value={gatePassNumber}
                      onChange={(e) => setGatePassNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                  <input
                    type="checkbox"
                    id="secCheck"
                    checked={securityChecked}
                    onChange={(e) => setSecurityChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="secCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Security Gate Outward Verification Completed: Physical vehicle count ({totalCartons} cartons) matches loading manifest.
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ Stock will be automatically deducted and logged into the Immutable Stock Movement Ledger.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDispatchOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg cursor-pointer"
                  >
                    {isSubmitting ? 'Confirming Dispatch...' : 'Confirm Goods Outward & Deduct Stock'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Outward Dispatch Document & Loading Report (Printable) */}
      {isReportModalOpen && reportDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-600" />
                Outward Dispatch Document & Vehicle Loading Report
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Report
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/electromax-logo.png" alt="Electromax Global" className="h-12 object-contain" />
                  <div>
                    <h1 className="text-lg font-black tracking-wide text-slate-900">ELECTROMAX GLOBAL</h1>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Manufacturing, OEM, Wholesale & Distribution • Jaipur, Rajasthan, India
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Founder & Director: <strong>Mr. Sushil Goyal</strong> • Email: electromaxglobal@gmail.com
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-mono">
                    DISPATCH PASS
                  </span>
                  <div className="font-mono font-bold text-sm mt-1">{reportDispatch.dispatchNo}</div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Consignment Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Consignee Customer:</div>
                  <div className="font-bold text-sm text-slate-900">{reportDispatch.customerName}</div>
                  <div className="text-slate-600 mt-0.5">{reportDispatch.destination}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    SO Ref: {reportDispatch.salesOrderNo || 'N/A'} • Invoice: {reportDispatch.invoiceNumber || 'Attached'}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500 text-[10px]">Transporter: </span>
                    <strong className="text-slate-800">{reportDispatch.transporterName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Vehicle #: </span>
                    <strong className="font-mono text-slate-900">{reportDispatch.vehicleNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Driver: </span>
                    <span>{reportDispatch.driverName} ({reportDispatch.driverPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Gate Pass: </span>
                    <strong className="font-mono text-orange-600">{reportDispatch.gatePassNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Items Manifest */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">
                  Loaded Product Line Items Manifest
                </h4>
                <table className="w-full text-left border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">Colour / SKU</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Cartons</th>
                      <th className="p-2 text-right">Weight (KG)</th>
                      <th className="p-2 text-right">CBM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(reportDispatch.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 text-slate-500">{i + 1}</td>
                        <td className="p-2 font-bold">{it.productName}</td>
                        <td className="p-2 text-slate-600 font-mono">{it.colour || it.skuCode || 'Standard'}</td>
                        <td className="p-2 text-right font-mono font-bold">{it.quantity} PCS</td>
                        <td className="p-2 text-right font-mono">{it.cartonCount || it.cartons} Boxes</td>
                        <td className="p-2 text-right font-mono">{it.totalWeightKg || it.weightKg} kg</td>
                        <td className="p-2 text-right font-mono">{Number(it.cbm || 0).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={3} className="p-2 text-right uppercase">Consignment Summary Totals:</td>
                      <td className="p-2 text-right font-mono text-emerald-700">{totalQuantity} PCS</td>
                      <td className="p-2 text-right font-mono text-amber-700">{totalCartons} Boxes</td>
                      <td className="p-2 text-right font-mono">{totalWeight.toFixed(2)} KG</td>
                      <td className="p-2 text-right font-mono text-orange-700">{totalCbmCalc.toFixed(3)} m³</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">{reportDispatch.loadingSupervisor}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Loading Supervisor</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">Security Gate Officer</div>
                  <div className="text-[10px] text-slate-500 uppercase">Gate Pass Verified</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">Mr. Sushil Goyal</div>
                  <div className="text-[10px] text-slate-500 uppercase">Authorized Signatory (Electromax Global)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Transporter Bilty LR */}
      {isBiltyModalOpen && selectedDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" />
                Upload Transporter Bilty / Lorry Receipt (LR)
              </h2>
              <button onClick={() => setIsBiltyModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadBilty} className="p-6 space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between">
                <div>
                  <span className="text-slate-400 block">Dispatch Ref:</span>
                  <span className="font-mono font-bold text-white">{selectedDispatch.dispatchNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Transporter:</span>
                  <span className="font-bold text-white">{selectedDispatch.transporterName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Official LR Number on Physical Bilty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VT-JPR-99238"
                  value={officialLr}
                  onChange={(e) => setOfficialLr(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold"
                />
              </div>

              <div className="pt-1">
                <PhotoCaptureField
                  label="Physical Bilty / Transporter Consignment Copy (LR)"
                  value={biltyDocUrl}
                  onChange={setBiltyDocUrl}
                  helperText="Capture paper LR stamped by transporter directly using device camera."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBiltyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg"
                >
                  Save Bilty Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customer Public Live Tracking View */}
      {isTrackingModalOpen && trackingData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <img src="/electromax-logo.png" alt="Electromax" className="h-8 object-contain" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Electromax Global Consignment Live Tracker
                  </h3>
                  <span className="text-[10px] text-orange-400 font-mono">
                    Token: {trackingData.dispatch?.trackingToken || trackingData.trackingToken}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsTrackingModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Consignment Status:</span>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold rounded">
                  {trackingData.dispatch?.status || trackingData.status}
                </span>
              </div>

              {trackingData.dispatch && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block">Carrier Transporter:</span>
                      <span className="font-bold text-white">{trackingData.dispatch.transporterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Official Bilty LR Number:</span>
                      <span className="font-mono font-bold text-orange-400">{trackingData.dispatch.biltyNo || 'In Process'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block">Vehicle Number:</span>
                      <span className="font-mono font-bold text-white">{trackingData.dispatch.vehicleNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Driver Contact:</span>
                      <span className="font-mono text-slate-300">{trackingData.dispatch.driverName} ({trackingData.dispatch.driverPhone})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block">Cartons / Boxes:</span>
                      <span className="font-bold text-emerald-400">{trackingData.dispatch.cartonCount} Master Cartons</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Destination City:</span>
                      <span className="font-bold text-white">{trackingData.dispatch.destination}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Proof Photographs */}
            {trackingData.photos && trackingData.photos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 block">Factory Outward & Loading Evidence:</span>
                <div className="grid grid-cols-2 gap-2">
                  {trackingData.photos.map((ph: any) => (
                    <div key={ph.id} className="rounded-lg overflow-hidden border border-slate-800 bg-black">
                      <img src={ph.fileUrl} alt={ph.fileName} className="w-full h-32 object-cover" />
                      <div className="p-1.5 text-[10px] text-slate-400 truncate bg-slate-950 text-center">
                        {ph.categoryTag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-500">
              Electromax Global Enterprises • Jaipur Corporate Logistics Support: +91 141 2334455
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
