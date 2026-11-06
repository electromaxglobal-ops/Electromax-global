import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// --- COMPANY & ORGANIZATIONAL HIERARCHY ---
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name').notNull(),
  gstin: text('gstin').notNull(),
  pan: text('pan').notNull(),
  cin: text('cin'),
  email: text('email'),
  phone: text('phone'),
  address: text('address').notNull(),
  city: text('city').notNull().default('Jaipur'),
  stateCode: text('state_code').notNull().default('08'), // 08 = Rajasthan
  stateName: text('state_name').notNull().default('Rajasthan'),
  pincode: text('pincode').default('302013'),
  currency: text('currency').notNull().default('INR'),
  currencySymbol: text('currency_symbol').notNull().default('₹'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  financialYearStart: text('financial_year_start').notNull().default('2026-04-01'),
  financialYearEnd: text('financial_year_end').notNull().default('2027-03-31'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  branchType: text('branch_type').notNull().default('FACTORY'), // HEAD_OFFICE, FACTORY, REGIONAL_OFFICE
  gstin: text('gstin'),
  address: text('address').notNull(),
  stateCode: text('state_code').notNull().default('08'),
  isFactory: boolean('is_factory').default(true),
  isHeadOffice: boolean('is_head_office').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  branchId: integer('branch_id')
    .references(() => branches.id)
    .notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  warehouseType: text('warehouse_type').notNull(), // RAW_MATERIALS, FINISHED_GOODS, WIP, PACKING_MATERIAL, SPARE_PARTS
  location: text('location'),
  capacitySqFt: integer('capacity_sqft'),
  managerName: text('manager_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const warehouseBins = pgTable('warehouse_bins', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id')
    .references(() => warehouses.id)
    .notNull(),
  binCode: text('bin_code').notNull(),
  zone: text('zone'),
  aisle: text('aisle'),
  rack: text('rack'),
  shelf: text('shelf'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- RBAC: ROLES & USERS ---
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id')
    .references(() => roles.id)
    .notNull(),
  module: text('module').notNull(),
  canView: boolean('can_view').default(false),
  canCreate: boolean('can_create').default(false),
  canEdit: boolean('can_edit').default(false),
  canApprove: boolean('can_approve').default(false),
  canPost: boolean('can_post').default(false),
  canCancel: boolean('can_cancel').default(false),
  canExport: boolean('can_export').default(false),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  companyId: integer('company_id').references(() => companies.id),
  branchId: integer('branch_id').references(() => branches.id),
  roleId: integer('role_id').references(() => roles.id),
  designation: text('designation'),
  employeeCode: text('employee_code'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- PRODUCT CATALOG & COLOR-WISE SKU MASTER ---
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productColors = pgTable('product_colors', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. BLK, WHT, RED, BLU, GRY, ORG
  name: text('name').notNull(), // e.g. Jet Black, Pearl White, Crimson Red, Royal Blue
  hexCode: text('hex_code').default('#000000'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  categoryId: integer('category_id')
    .references(() => productCategories.id)
    .notNull(),
  brand: text('brand').notNull().default('Snow Wave'),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  modelNumber: text('model_number'),
  itemType: text('item_type').notNull(), // FINISHED_GOOD, RAW_MATERIAL, SEMI_FINISHED, PACKING, SPARE_PART
  hsnCode: text('hsn_code').notNull(),
  gstRate: numeric('gst_rate', { precision: 5, scale: 2 }).notNull().default('18.00'),
  uom: text('uom').notNull().default('PCS'),
  minStockLevel: integer('min_stock_level').default(50),
  maxStockLevel: integer('max_stock_level').default(1000),
  reorderPoint: integer('reorder_point').default(100),
  standardCost: numeric('standard_cost', { precision: 12, scale: 2 }).default('0.00'),
  purchaseRate: numeric('purchase_rate', { precision: 12, scale: 2 }).default('0.00'),
  sellingRate: numeric('selling_rate', { precision: 12, scale: 2 }).default('0.00'),
  mrp: numeric('mrp', { precision: 12, scale: 2 }).default('0.00'),
  dealerPrice: numeric('dealer_price', { precision: 12, scale: 2 }).default('0.00'),
  weightKg: numeric('weight_kg', { precision: 8, scale: 3 }).default('0.000'),
  dimensions: text('dimensions'),
  warrantyPeriod: text('warranty_period').default('1 Year'),
  specifications: text('specifications'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// COLOR-WISE SKU GENERATION (Separate Stock for each color variant)
export const productSkus = pgTable('product_skus', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  colorId: integer('color_id')
    .references(() => productColors.id),
  skuCode: text('sku_code').notNull().unique(), // e.g. KET-EGJ18-BLK
  colorName: text('color_name').notNull(),
  barcode: text('barcode'),
  qrCode: text('qr_code'),
  purchaseRate: numeric('purchase_rate', { precision: 12, scale: 2 }).default('0.00'),
  sellingRate: numeric('selling_rate', { precision: 12, scale: 2 }).default('0.00'),
  mrp: numeric('mrp', { precision: 12, scale: 2 }).default('0.00'),
  stockQuantity: numeric('stock_quantity', { precision: 14, scale: 2 }).default('0.00'),
  minStockLevel: integer('min_stock_level').default(20),
  weightKg: numeric('weight_kg', { precision: 8, scale: 3 }).default('0.000'),
  imageUrl: text('image_url'),
  status: text('status').default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
});

// CARTON-WISE PACKING & CBM CALCULATION
export const cartonPackings = pgTable('carton_packings', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  skuId: integer('sku_id')
    .references(() => productSkus.id),
  cartonNumber: text('carton_number'),
  cartonLengthCm: numeric('carton_length_cm', { precision: 8, scale: 2 }).notNull(),
  cartonWidthCm: numeric('carton_width_cm', { precision: 8, scale: 2 }).notNull(),
  cartonHeightCm: numeric('carton_height_cm', { precision: 8, scale: 2 }).notNull(),
  qtyPerCarton: integer('qty_per_carton').notNull(),
  numCartons: integer('num_cartons').notNull().default(1),
  grossWeightKg: numeric('gross_weight_kg', { precision: 8, scale: 2 }).default('0.00'),
  netWeightKg: numeric('net_weight_kg', { precision: 8, scale: 2 }).default('0.00'),
  cbmPerCarton: numeric('cbm_per_carton', { precision: 10, scale: 6 }).notNull(),
  totalCbm: numeric('total_cbm', { precision: 10, scale: 6 }).notNull(),
  packingNotes: text('packing_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// UNIVERSAL ATTACHMENTS & PHOTO SYSTEM
export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // PRODUCT, PURCHASE, PRODUCTION, INVENTORY, SALES, DISPATCH, HR, CRM, BILTY
  entityId: text('entity_id').notNull(),
  fileType: text('file_type').default('IMAGE'),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  categoryTag: text('category_tag'), // MAIN_PHOTO, PACKAGING, VEHICLE_FRONT, VEHICLE_REGISTRATION, LOADED_GOODS, CARTONS, BILTY_LR, DAMAGE_PROOF
  uploadedBy: text('uploaded_by').default('Mr. Sushil Goyal'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// --- INVENTORY ENGINE & LEDGER ---
export const stockBalances = pgTable('stock_balances', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id')
    .references(() => warehouses.id)
    .notNull(),
  productId: integer('productId')
    .references(() => products.id)
    .notNull(),
  skuId: integer('sku_id').references(() => productSkus.id),
  quantity: numeric('quantity', { precision: 14, scale: 2 }).notNull().default('0.00'),
  reservedQuantity: numeric('reserved_quantity', { precision: 14, scale: 2 }).notNull().default('0.00'),
  availableQuantity: numeric('available_quantity', { precision: 14, scale: 2 }).notNull().default('0.00'),
  averageCost: numeric('average_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalValuation: numeric('total_valuation', { precision: 14, scale: 2 }).notNull().default('0.00'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const stockLedger = pgTable('stock_ledger', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  warehouseId: integer('warehouse_id')
    .references(() => warehouses.id)
    .notNull(),
  productId: integer('productId')
    .references(() => products.id)
    .notNull(),
  skuId: integer('sku_id').references(() => productSkus.id),
  voucherType: text('voucher_type').notNull(),
  voucherNo: text('voucher_no').notNull(),
  movementType: text('movement_type').notNull(),
  quantity: numeric('quantity', { precision: 14, scale: 2 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull(),
  totalValue: numeric('total_value', { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 14, scale: 2 }).notNull(),
  referenceDoc: text('reference_doc'),
  batchNumber: text('batch_number'),
  narration: text('narration'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- PARTIES: CUSTOMERS & SUPPLIERS ---
export const parties = pgTable('parties', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  partyType: text('party_type').notNull(), // CUSTOMER, SUPPLIER, BOTH
  code: text('code').notNull().unique(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name'),
  gstin: text('gstin'),
  pan: text('pan'),
  stateCode: text('state_code').default('08'),
  stateName: text('state_name').default('Rajasthan'),
  email: text('email'),
  phone: text('phone'),
  billingAddress: text('billing_address'),
  shippingAddress: text('shipping_address'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('0.00'),
  creditDays: integer('credit_days').default(30),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- CRM & LEAD MANAGEMENT ---
export const crmLeads = pgTable('crm_leads', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  companyName: text('company_name'),
  phone: text('phone').notNull(),
  email: text('email'),
  city: text('city').default('Jaipur'),
  state: text('state').default('Rajasthan'),
  source: text('source').default('Direct Inquiry'),
  status: text('status').default('NEW'), // NEW, CONTACTED, QUOTATION_SENT, PROFORMA_ISSUED, ADVANCE_RECEIVED, CONVERTED, CLOSED
  assignedExecutive: text('assigned_executive').default('Mr. Sushil Goyal'),
  expectedValue: numeric('expected_value', { precision: 12, scale: 2 }).default('0.00'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const crmCommunications = pgTable('crm_communications', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => crmLeads.id),
  partyId: integer('party_id').references(() => parties.id),
  channel: text('channel').notNull(), // WHATSAPP, EMAIL, CALL, MEETING
  summary: text('summary').notNull(),
  scheduledFollowUp: text('scheduled_follow_up'),
  loggedBy: text('logged_by').default('Mr. Sushil Goyal'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- SALES: QUOTATIONS, PROFORMA INVOICES, SALES ORDERS ---
export const salesQuotations = pgTable('sales_quotations', {
  id: serial('id').primaryKey(),
  quotationNo: text('quotation_no').notNull().unique(),
  partyId: integer('party_id').references(() => parties.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  customerEmail: text('customer_email'),
  validUntil: text('valid_until'),
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull().default('0.00'),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }).notNull().default('0.00'),
  freight: numeric('freight', { precision: 12, scale: 2 }).default('0.00'),
  discount: numeric('discount', { precision: 12, scale: 2 }).default('0.00'),
  grandTotal: numeric('grand_total', { precision: 14, scale: 2 }).notNull().default('0.00'),
  paymentTerms: text('payment_terms').default('30% Advance, Balance Before Dispatch'),
  deliveryTerms: text('delivery_terms').default('Ex-Factory Jaipur (VKI Unit)'),
  notes: text('notes'),
  status: text('status').default('SENT'), // DRAFT, SENT, ACCEPTED, CONVERTED_TO_PI, REJECTED
  itemsJson: text('items_json'), // Array of items with sku, color, qty, rate, gst
  createdAt: timestamp('created_at').defaultNow(),
});

export const proformaInvoices = pgTable('proforma_invoices', {
  id: serial('id').primaryKey(),
  piNo: text('pi_no').notNull().unique(),
  quotationId: integer('quotation_id').references(() => salesQuotations.id),
  partyId: integer('party_id').references(() => parties.id),
  customerName: text('customer_name').notNull(),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull().default('0.00'),
  advancePercent: numeric('advance_percent', { precision: 5, scale: 2 }).notNull().default('30.00'),
  advanceRequired: numeric('advance_required', { precision: 14, scale: 2 }).notNull().default('0.00'),
  advanceReceived: numeric('advance_received', { precision: 14, scale: 2 }).default('0.00'),
  balanceAmount: numeric('balance_amount', { precision: 14, scale: 2 }).notNull().default('0.00'),
  paymentLink: text('payment_link'),
  paymentStatus: text('payment_status').default('PENDING'), // PENDING, ADVANCE_VERIFIED, FULLY_PAID, EXPIRED
  paymentRef: text('payment_ref'),
  qrCodeUrl: text('qr_code_url'),
  bankDetails: text('bank_details').default('State Bank of India, VKI Jaipur Current A/c 38920192847'),
  verifiedAt: timestamp('verified_at'),
  itemsJson: text('items_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const salesOrders = pgTable('sales_orders', {
  id: serial('id').primaryKey(),
  orderNo: text('order_no').notNull().unique(),
  piId: integer('pi_id').references(() => proformaInvoices.id),
  partyId: integer('party_id').references(() => parties.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull().default('0.00'),
  advancePaid: numeric('advance_paid', { precision: 14, scale: 2 }).default('0.00'),
  status: text('status').default('CONFIRMED'), // CONFIRMED, MATERIAL_ALLOCATED, IN_PRODUCTION, QUALITY_APPROVED, PACKED, DISPATCHED, DELIVERED
  expectedDeliveryDate: text('expected_delivery_date'),
  itemsJson: text('items_json'),
  trackingToken: text('tracking_token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- BOM & PRODUCTION WORK ORDERS ---
export const boms = pgTable('boms', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  skuId: integer('sku_id').references(() => productSkus.id),
  revisionNumber: integer('revision_number').default(1),
  name: text('name').notNull(),
  batchSize: numeric('batch_size', { precision: 10, scale: 2 }).default('1.00'),
  estimatedMaterialCost: numeric('estimated_material_cost', { precision: 12, scale: 2 }).default('0.00'),
  laborCost: numeric('labor_cost', { precision: 12, scale: 2 }).default('0.00'),
  overheadCost: numeric('overhead_cost', { precision: 12, scale: 2 }).default('0.00'),
  totalEstimatedCost: numeric('total_estimated_cost', { precision: 12, scale: 2 }).default('0.00'),
  status: text('status').default('ACTIVE'),
  effectiveDate: text('effective_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bomItems = pgTable('bom_items', {
  id: serial('id').primaryKey(),
  bomId: integer('bom_id')
    .references(() => boms.id)
    .notNull(),
  componentProductId: integer('component_product_id').references(() => products.id),
  componentName: text('component_name').notNull(),
  componentSku: text('component_sku'),
  quantityRequired: numeric('quantity_required', { precision: 12, scale: 4 }).notNull(),
  unit: text('unit').notNull(),
  wastagePercent: numeric('wastage_percent', { precision: 5, scale: 2 }).default('0.00'),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).default('0.00'),
  totalComponentCost: numeric('total_component_cost', { precision: 12, scale: 2 }).default('0.00'),
});

export const productionWorkOrders = pgTable('production_work_orders', {
  id: serial('id').primaryKey(),
  workOrderNo: text('work_order_no').notNull().unique(),
  salesOrderId: integer('sales_order_id').references(() => salesOrders.id),
  productId: integer('product_id').references(() => products.id).notNull(),
  skuId: integer('sku_id').references(() => productSkus.id),
  bomId: integer('bom_id').references(() => boms.id),
  colorName: text('color_name'),
  plannedQty: numeric('planned_qty', { precision: 12, scale: 2 }).notNull(),
  producedQty: numeric('produced_qty', { precision: 12, scale: 2 }).default('0.00'),
  rejectedQty: numeric('rejected_qty', { precision: 12, scale: 2 }).default('0.00'),
  status: text('status').default('ORDER_RECEIVED'), // ORDER_RECEIVED, MATERIAL_REQUIRED, MATERIAL_ISSUED, PRODUCTION_STARTED, IN_PROGRESS, QC_CHECK, COMPLETED, FG_RECEIVED, READY_FOR_DISPATCH
  productionLine: text('production_line').default('Line 1 - Heating & Assembly'),
  assignedLead: text('assigned_lead'),
  startDate: text('start_date'),
  completionDate: text('completion_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- PURCHASE MANAGEMENT & GRN ---
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  poNumber: text('po_number').notNull().unique(),
  supplierId: integer('supplier_id').references(() => parties.id),
  supplierName: text('supplier_name').notNull(),
  deliveryDate: text('delivery_date'),
  paymentTerms: text('payment_terms').default('Net 30 Days'),
  specialInstructions: text('special_instructions'),
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull().default('0.00'),
  taxAmount: numeric('tax_amount', { precision: 14, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 14, scale: 2 }).notNull().default('0.00'),
  status: text('status').default('APPROVED'), // DRAFT, APPROVED, SENT_TO_SUPPLIER, CONFIRMED, PARTIALLY_RECEIVED, COMPLETED
  itemsJson: text('items_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const grns = pgTable('grns', {
  id: serial('id').primaryKey(),
  grnNumber: text('grn_number').notNull().unique(),
  poId: integer('po_id').references(() => purchaseOrders.id),
  supplierName: text('supplier_name').notNull(),
  receivedDate: text('received_date').notNull(),
  receivedQty: numeric('received_qty', { precision: 12, scale: 2 }).notNull(),
  acceptedQty: numeric('accepted_qty', { precision: 12, scale: 2 }).notNull(),
  rejectedQty: numeric('rejected_qty', { precision: 12, scale: 2 }).default('0.00'),
  shortageQty: numeric('shortage_qty', { precision: 12, scale: 2 }).default('0.00'),
  challanNumber: text('challan_number'),
  inspectionNotes: text('inspection_notes'),
  status: text('status').default('INSPECTED'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- CHALLANS & MULTI-TYPE GENERATION ---
export const challans = pgTable('challans', {
  id: serial('id').primaryKey(),
  challanNo: text('challan_no').notNull().unique(),
  challanType: text('challan_type').notNull(), // MATERIAL_ISSUE, MATERIAL_TRANSFER, GOODS_RECEIPT, DELIVERY, SALES_DISPATCH, JOB_WORK, RETURN
  recipientName: text('recipient_name').notNull(),
  destination: text('destination').notNull(),
  vehicleNo: text('vehicle_no'),
  driverName: text('driver_name'),
  itemsSummary: text('items_summary').notNull(),
  authorizedBy: text('authorized_by').default('Mr. Sushil Goyal'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- DISPATCH, LOGISTICS & BILTY/LR ---
export const dispatches = pgTable('dispatches', {
  id: serial('id').primaryKey(),
  dispatchNo: text('dispatch_no').notNull().unique(),
  salesOrderId: integer('sales_order_id').references(() => salesOrders.id),
  customerName: text('customer_name').notNull(),
  destination: text('destination').notNull(),
  transporterName: text('transporter_name').notNull(),
  vehicleNo: text('vehicle_no').notNull(),
  driverName: text('driver_name').notNull(),
  driverPhone: text('driver_phone'),
  cartonCount: integer('carton_count').notNull().default(1),
  totalWeightKg: numeric('total_weight_kg', { precision: 10, scale: 2 }).default('0.00'),
  totalCbm: numeric('total_cbm', { precision: 10, scale: 6 }).default('0.00'),
  freightCharges: numeric('freight_charges', { precision: 12, scale: 2 }).default('0.00'),
  ewayBillNo: text('eway_bill_no'),
  biltyNo: text('bilty_no'),
  trackingToken: text('tracking_token').notNull().unique(),
  status: text('status').default('DISPATCHED'), // PLANNED, LOADED, DISPATCHED, IN_TRANSIT, DELIVERED
  dispatchDate: text('dispatch_date').notNull(),
  deliveryConfirmationDate: text('delivery_confirmation_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const biltyRecords = pgTable('bilty_records', {
  id: serial('id').primaryKey(),
  dispatchId: integer('dispatch_id').references(() => dispatches.id),
  transporterName: text('transporter_name').notNull(),
  officialLrNumber: text('official_lr_number').notNull(),
  biltyDocumentUrl: text('bilty_document_url'),
  cartonCount: integer('carton_count'),
  weightKg: numeric('weight_kg', { precision: 10, scale: 2 }),
  freightAmount: numeric('freight_amount', { precision: 12, scale: 2 }),
  issueDate: text('issue_date'),
  destinationCity: text('destination_city'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- HRMS & PAYROLL ---
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  employeeCode: text('employee_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  department: text('department').notNull(), // Management, Production, Quality, Stores, Accounts, Sales, Dispatch, HR
  designation: text('designation').notNull(),
  reportingManager: text('reporting_manager').default('Mr. Sushil Goyal'),
  salary: numeric('salary', { precision: 12, scale: 2 }).default('25000.00'),
  joiningDate: text('joining_date'),
  shift: text('shift').default('Morning General (09:00 - 18:00)'),
  photoUrl: text('photo_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const attendanceRecords = pgTable('attendance_records', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id),
  date: text('date').notNull(),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  status: text('status').default('PRESENT'), // PRESENT, ABSENT, HALF_DAY, LEAVE, OVERTIME
  overtimeHours: numeric('overtime_hours', { precision: 4, scale: 1 }).default('0.0'),
  source: text('source').default('Biometric Terminal'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- DOUBLE-ENTRY ACCOUNTING ---
export const accountGroups = pgTable('account_groups', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  name: text('name').notNull(),
  nature: text('nature').notNull(), // ASSET, LIABILITY, INCOME, EXPENSE
  parentGroupId: integer('parent_group_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  groupId: integer('group_id')
    .references(() => accountGroups.id)
    .notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  accountType: text('account_type').notNull(),
  openingBalance: numeric('opening_balance', { precision: 14, scale: 2 }).default('0.00'),
  currentBalance: numeric('current_balance', { precision: 14, scale: 2 }).default('0.00'),
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .references(() => companies.id)
    .notNull(),
  voucherType: text('voucher_type').notNull(),
  voucherNumber: text('voucher_number').notNull().unique(),
  date: text('date').notNull(),
  financialYear: text('financial_year').notNull().default('2026-2027'),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  narration: text('narration'),
  isPosted: boolean('is_posted').default(true),
  postedBy: integer('posted_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const voucherLines = pgTable('voucher_lines', {
  id: serial('id').primaryKey(),
  voucherId: integer('voucher_id')
    .references(() => vouchers.id)
    .notNull(),
  accountId: integer('account_id')
    .references(() => accounts.id)
    .notNull(),
  debit: numeric('debit', { precision: 14, scale: 2 }).default('0.00'),
  credit: numeric('credit', { precision: 14, scale: 2 }).default('0.00'),
  lineNarration: text('line_narration'),
});

// --- AUDIT LOGS ---
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id'),
  userId: integer('user_id'),
  userName: text('user_name'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- SYSTEM SETTINGS ---
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
