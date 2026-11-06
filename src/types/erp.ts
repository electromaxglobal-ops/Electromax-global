export interface Company {
  id: number;
  code: string;
  legalName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  cin?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  stateCode: string;
  stateName: string;
  pincode?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  financialYearStart: string;
  financialYearEnd: string;
  logoUrl?: string;
}

export interface Branch {
  id: number;
  companyId: number;
  code: string;
  name: string;
  branchType: 'HEAD_OFFICE' | 'FACTORY' | 'REGIONAL_OFFICE';
  gstin?: string;
  address: string;
  stateCode: string;
  isFactory: boolean;
  isHeadOffice: boolean;
  isActive: boolean;
}

export interface Warehouse {
  id: number;
  companyId: number;
  branchId: number;
  code: string;
  name: string;
  warehouseType: 'RAW_MATERIALS' | 'FINISHED_GOODS' | 'WIP' | 'PACKING_MATERIAL' | 'SPARE_PARTS';
  location?: string;
  capacitySqFt?: number;
  managerName?: string;
  isActive: boolean;
  branch?: Branch;
}

export interface WarehouseBin {
  id: number;
  warehouseId: number;
  binCode: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  isActive: boolean;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount?: number;
  permissionCount?: number;
}

export interface RolePermission {
  id: number;
  roleId: number;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canPost: boolean;
  canCancel: boolean;
  canExport: boolean;
}

export interface User {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  companyId?: number;
  branchId?: number;
  roleId?: number;
  designation?: string;
  employeeCode?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  role?: Role;
  branch?: Branch;
}

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface Product {
  id: number;
  companyId: number;
  categoryId: number;
  brand: string;
  code: string;
  name: string;
  itemType: 'FINISHED_GOOD' | 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'PACKING' | 'SPARE_PARTS';
  hsnCode: string;
  gstRate: string;
  uom: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  standardCost?: string;
  mrp?: string;
  dealerPrice?: string;
  specifications?: string;
  imageUrl?: string;
  isActive: boolean;
  category?: ProductCategory;
  totalStock?: number;
  stockValuation?: number;
  isLowStock?: boolean;
}

export interface StockBalance {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  averageCost: string;
  totalValuation: string;
  lastUpdated?: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockLedgerEntry {
  id: number;
  companyId: number;
  warehouseId: number;
  productId: number;
  voucherType: string;
  voucherNo: string;
  movementType: 'IN' | 'OUT';
  quantity: string;
  unitCost: string;
  totalValue: string;
  balanceAfter: string;
  referenceDoc?: string;
  batchNumber?: string;
  narration?: string;
  createdAt: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface Party {
  id: number;
  companyId: number;
  partyType: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  code: string;
  legalName: string;
  tradeName?: string;
  gstin?: string;
  pan?: string;
  stateCode?: string;
  stateName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: string;
  creditDays?: number;
  isActive: boolean;
}

export interface AuditLog {
  id: number;
  companyId?: number;
  userId?: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  finishedGoodsCount: number;
  rawMaterialsCount: number;
  activeBranches: number;
  activeWarehouses: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalStockValuation: number;
  fgStockValuation: number;
  rmStockValuation: number;
  lowStockCount: number;
  totalStockMovements: number;
  todayProductionUnits: number;
  todayDispatchedUnits: number;
  pendingApprovalsCount: number;
  qualityPassRate: number;
}
