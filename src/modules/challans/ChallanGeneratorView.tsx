import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Printer,
  Plus,
  Truck,
  Building,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Trash2,
  Box,
  MapPin,
  Calendar,
  AlertTriangle,
  Receipt,
  Camera,
} from 'lucide-react';
import { PhotoCaptureField } from '../../components/common/PhotoCaptureField.tsx';

interface ChallanItem {
  productId: number;
  productName: string;
  modelNumber?: string;
  colour?: string;
  skuCode?: string;
  hsnCode?: string;
  availableStock: number;
  quantity: number;
  unit: string;
  cartonCount: number;
  unitWeightKg: number;
  totalWeightKg: number;
  cbm: number;
  remarks?: string;
}

interface Challan {
  id: number;
  challanNo: string;
  challanType: string;
  recipientName: string;
  destination: string;
  vehicleNo: string | null;
  driverName: string | null;
  itemsSummary: string;
  authorizedBy: string;
  remarks: string | null;
  gatePassPhoto?: string | null;
  createdAt: string;
}

export const ChallanGeneratorView: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [challanType, setChallanType] = useState('DELIVERY');
  const [recipientName, setRecipientName] = useState('Marwar Electricals & Hardware Depot');
  const [destination, setDestination] = useState('Station Road, Ratanada, Jodhpur');
  const [deliveryAddress, setDeliveryAddress] = useState('Plot 42, Heavy Industrial Area, Jodhpur');
  const [gstin, setGstin] = useState('08AABCM1234D1Z5');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [salesOrderNo, setSalesOrderNo] = useState('SO-2026-0891');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('RJ 14 GH 7821');
  const [driverName, setDriverName] = useState('Mohan Ram Gujjar');
  const [driverPhone, setDriverPhone] = useState('+91 94140 98765');
  const [transporterName, setTransporterName] = useState('V-Trans Express Logistics Ltd.');
  const [remarks, setRemarks] = useState('Handle with extreme care. Fragile heating elements.');
  const [gatePassPhoto, setGatePassPhoto] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Mr. Sushil Goyal');

  // Line items
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challanTypes = [
    { code: 'DELIVERY', label: 'Delivery Challan (Trade Sale Outward)' },
    { code: 'STOCK_TRANSFER', label: 'Stock Transfer Challan (Inter-Plant/Depot)' },
    { code: 'JOB_WORK', label: 'Job Work Challan (Subcontracting Processing)' },
    { code: 'MATERIAL_ISSUE', label: 'Material Issue Challan (Assembly Line)' },
    { code: 'MATERIAL_RETURN', label: 'Material Return Challan (Return to Store)' },
    { code: 'GOODS_RECEIPT', label: 'Goods Receipt Challan (GRN Inward)' },
    { code: 'SALES_RETURN', label: 'Sales Return Challan (Customer RMA)' },
    { code: 'PURCHASE_RETURN', label: 'Purchase Return Challan (Supplier Rejection)' },
    { code: 'CONSIGNMENT', label: 'Consignment / Exhibition Demonstration' },
  ];

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const [chRes, whRes, prodRes] = await Promise.all([
        fetch('/api/challans').then((r) => r.json()).catch(() => []),
        fetch('/api/warehouses').then((r) => r.json()).catch(() => []),
        fetch('/api/products').then((r) => r.json()).catch(() => []),
      ]);
      setChallans(Array.isArray(chRes) ? chRes : []);
      if (Array.isArray(whRes) && whRes.length > 0) {
        setWarehouses(whRes);
        setSelectedWarehouseId(whRes[0].id);
      }
      if (Array.isArray(prodRes) && prodRes.length > 0) {
        setProducts(prodRes);
        if (items.length === 0) {
          const p = prodRes[0];
          setItems([
            {
              productId: p.id,
              productName: p.name,
              modelNumber: p.code,
              colour: 'Jet Black',
              skuCode: `${p.code}-BLK`,
              hsnCode: p.hsnCode || '8516',
              availableStock: Number(p.stockQuantity || 450),
              quantity: 150,
              unit: p.uom || 'PCS',
              cartonCount: 15,
              unitWeightKg: 2.8,
              totalWeightKg: 420,
              cbm: 1.15,
              remarks: 'Snow Wave Brand Appliances',
            },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  const totalCartons = items.reduce((acc, it) => acc + (Number(it.cartonCount) || 0), 0);
  const totalWeight = items.reduce((acc, it) => acc + (Number(it.totalWeightKg) || 0), 0);
  const totalCbm = items.reduce((acc, it) => acc + (Number(it.cbm) || 0), 0);

  const handleAddItem = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === Number(selectedProductToAdd));
    if (!prod) return;

    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        modelNumber: prod.code,
        colour: 'Standard',
        skuCode: `${prod.code}-STD`,
        hsnCode: prod.hsnCode || '8516',
        availableStock: Number(prod.stockQuantity || 200),
        quantity: 50,
        unit: prod.uom || 'PCS',
        cartonCount: 5,
        unitWeightKg: 2.5,
        totalWeightKg: 125,
        cbm: 0.35,
        remarks: 'Factory Stamped',
      },
    ]);
    setSelectedProductToAdd('');
  };

  const handleUpdateItem = (index: number, field: keyof ChallanItem, val: any) => {
    const updated = [...items];
    const it = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'cartonCount') {
      const q = Number(field === 'quantity' ? val : it.quantity) || 0;
      it.totalWeightKg = Number((q * (it.unitWeightKg || 2)).toFixed(2));
    }
    updated[index] = it;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      setFormError('Please add at least one line item to the challan.');
      return;
    }
    if (!selectedWarehouseId) {
      setFormError('Please select a storage warehouse.');
      return;
    }

    setIsSubmitting(true);
    try {
      const summaryText = items
        .map((it) => `${it.productName} (${it.quantity} ${it.unit}, ${it.cartonCount} Boxes)`)
        .join('; ');

      const res = await fetch('/api/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challanType,
          recipientName,
          destination,
          deliveryAddress,
          gstin,
          warehouseId: Number(selectedWarehouseId),
          refNo,
          salesOrderNo,
          purchaseOrderNo,
          vehicleNo,
          driverName,
          driverPhone,
          transporterName,
          itemsSummary: summaryText,
          remarks,
          authorizedBy: 'Mr. Sushil Goyal',
          gatePassPhoto,
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            skuCode: it.skuCode,
            quantity: it.quantity,
            cartons: it.cartonCount,
            weightKg: it.totalWeightKg,
            cbm: it.cbm,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to issue challan');
      }

      const created = await res.json();
      setIsModalOpen(false);
      fetchChallans();
      setSelectedChallan(created);
      setIsPrintModalOpen(true);
    } catch (err: any) {
      setFormError(err.message || 'Error creating challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B192C] p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Official Multi-Type Challan Generator & Gate Movement
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Statutory Goods Movement Documents: Delivery Challan, Internal Plant-to-Plant Stock Transfer, Job Work, Material Issue, and Returnable Gate Passes. Authorized Signatory: <strong>Mr. Sushil Goyal</strong>. Real-time stock balance deduction and immutable ledger posting.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Issue New Challan
        </button>
      </div>

      {/* Challans Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            Issued Movement Challans Log
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {challans.length} Challans Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Challan #</th>
                <th className="py-3 px-4">Challan Type</th>
                <th className="py-3 px-4">Recipient / Destination</th>
                <th className="py-3 px-4">Vehicle & Driver</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No challans issued yet. Click &quot;Issue New Challan&quot; to create.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-orange-400">
                      {ch.challanNo}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {new Date(ch.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {ch.challanType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ch.recipientName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        {ch.destination}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div className="font-bold">{ch.vehicleNo || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{ch.driverName || 'Hand Delivery'}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {ch.itemsSummary}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-semibold text-white">{ch.authorizedBy}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedChallan(ch);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-orange-400" />
                        Print Challan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue New Multi-Product Challan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                Issue Official Movement Challan • Multi-Product Entry
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-6">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Challan Type & Recipient */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> 1. Challan Category & Recipient Party
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Challan Type</label>
                    <select
                      value={challanType}
                      onChange={(e) => setChallanType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold"
                    >
                      {challanTypes.map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300">Recipient Party / Plant / Subcontractor</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Recipient GSTIN (if registered)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="08AABCM1234D1Z5"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Source / Target Warehouse</label>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Multi-Product Line Items */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Box className="w-4 h-4" /> 2. Challan Product Items List
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Product Name, Model, Colour, SKU, HSN, Quantity, Unit, Cartons, Weight & CBM.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => setSelectedProductToAdd(e.target.value ? Number(e.target.value) : '')}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="">-- Add Product from Master --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedProductToAdd}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-2">Colour / SKU</th>
                        <th className="py-2.5 px-2">HSN</th>
                        <th className="py-2.5 px-2 text-right">Challan Qty</th>
                        <th className="py-2.5 px-2 text-right">Cartons</th>
                        <th className="py-2.5 px-2 text-right">Weight (KG)</th>
                        <th className="py-2.5 px-2">Remarks</th>
                        <th className="py-2.5 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3">
                            <div className="font-bold text-white truncate max-w-[150px]">{it.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{it.modelNumber}</div>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={it.colour || ''}
                              onChange={(e) => handleUpdateItem(idx, 'colour', e.target.value)}
                              className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{it.skuCode}</div>
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-300">{it.hsnCode}</td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                              className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-amber-400 font-mono font-bold text-right"
                            />
                            <span className="text-[10px] text-slate-400 block">{it.unit}</span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={it.cartonCount}
                              onChange={(e) => handleUpdateItem(idx, 'cartonCount', Number(e.target.value))}
                              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-200">
                            {it.totalWeightKg} kg
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={it.remarks || ''}
                              onChange={(e) => handleUpdateItem(idx, 'remarks', e.target.value)}
                              className="w-32 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                              placeholder="Notes"
                            />
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
                    <tfoot className="bg-slate-900 font-bold text-slate-200 text-xs border-t border-slate-800">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right text-amber-400 uppercase">
                          Total Movement:
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-amber-400">
                          {totalQty} PCS
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-white">
                          {totalCartons} Boxes
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-white">
                          {totalWeight.toFixed(2)} KG
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Transporter & Gate Movement */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4" /> 3. Vehicle & Transport Logistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Vehicle Number</label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="RJ 14 GH 7821"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Driver Name</label>
                    <input
                      type="text"
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
                    <label className="text-[11px] font-semibold text-slate-300">Carrier / Transporter</label>
                    <input
                      type="text"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Sales Order # (Optional)</label>
                    <input
                      type="text"
                      value={salesOrderNo}
                      onChange={(e) => setSalesOrderNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Purchase Order / Job Order #</label>
                    <input
                      type="text"
                      value={purchaseOrderNo}
                      onChange={(e) => setPurchaseOrderNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Authorized Signatory</label>
                    <input
                      type="text"
                      readOnly
                      value={authorizedBy}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Challan Instructions & Special Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <PhotoCaptureField
                    label="Security Gate Pass / Stamped Paper Copy Photo"
                    value={gatePassPhoto}
                    onChange={setGatePassPhoto}
                    helperText="Capture gate outward register signature or physical gate pass photo."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ Stock balances will automatically adjust and record in the Immutable Stock Movement Ledger.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-lg cursor-pointer"
                  >
                    {isSubmitting ? 'Issuing Challan...' : 'Confirm & Issue Movement Challan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Printable Challan Document */}
      {isPrintModalOpen && selectedChallan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-600" />
                Statutory Goods Movement Challan
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Challan
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
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
                      Founder & Director: <strong>Mr. Sushil Goyal</strong> • State Code: 08 (Rajasthan)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono uppercase">
                    {selectedChallan.challanType.replace('_', ' ')}
                  </span>
                  <div className="font-mono font-bold text-sm mt-1">{selectedChallan.challanNo}</div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date(selectedChallan.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Consignee / Destination:</div>
                  <div className="font-bold text-sm text-slate-900">{selectedChallan.recipientName}</div>
                  <div className="text-slate-600 mt-0.5">{selectedChallan.destination}</div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500 text-[10px]">Vehicle #: </span>
                    <strong className="font-mono text-slate-900">{selectedChallan.vehicleNo || 'Hand Delivery'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Driver: </span>
                    <span>{selectedChallan.driverName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Movement Rule: </span>
                    <span className="font-semibold text-slate-700">CGST Rule 55 Compliant</span>
                  </div>
                </div>
              </div>

              {/* Items Manifest */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">
                  Goods Movement Manifest
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedChallan.itemsSummary}
                </div>
              </div>

              {selectedChallan.remarks && (
                <div>
                  <span className="font-bold text-slate-800">Special Instructions / Remarks: </span>
                  <span className="text-slate-600">{selectedChallan.remarks}</span>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">Store In-Charge</div>
                  <div className="text-[10px] text-slate-500 uppercase">Prepared & Dispatched By</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">{selectedChallan.driverName || 'Receiver'}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Receiver&apos;s Signature</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                    {selectedChallan.authorizedBy || 'Mr. Sushil Goyal'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Authorized Signatory (Electromax Global)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
