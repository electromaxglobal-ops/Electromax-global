import { db } from './index.ts';
import {
  companies,
  branches,
  warehouses,
  warehouseBins,
  roles,
  rolePermissions,
  users,
  productCategories,
  products,
  stockBalances,
  stockLedger,
  parties,
  accountGroups,
  accounts,
  productColors,
  productSkus,
  cartonPackings,
  attachments,
  crmLeads,
  crmCommunications,
  salesQuotations,
  proformaInvoices,
  salesOrders,
  productionWorkOrders,
  purchaseOrders,
  grns,
  challans,
  dispatches,
  biltyRecords,
  employees,
  attendanceRecords,
} from './schema.ts';

export async function runSeeds() {
  console.log('--- SEEDING ELECTROMAX GLOBAL ERP 2.0 DATA ---');

  // 1. Seed Company
  const existingCompanies = await db.select().from(companies);
  let companyId: number;

  if (existingCompanies.length === 0) {
    const [c] = await db.insert(companies).values({
      code: 'EMG-01',
      legalName: 'Electromax Global Enterprises Pvt. Ltd.',
      tradeName: 'Electromax Global',
      gstin: '08AABCE9876K1Z2',
      pan: 'AABCE9876K',
      cin: 'U31909RJ2018PTC062145',
      email: 'contact@electromaxglobal.com',
      phone: '+91 141 2334455',
      address: 'Plot No. 42-45, Phase 1, Vishwakarma Industrial Area (VKI)',
      city: 'Jaipur',
      stateCode: '08',
      stateName: 'Rajasthan',
      pincode: '302013',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
      financialYearStart: '2026-04-01',
      financialYearEnd: '2027-03-31',
      logoUrl: '',
    }).returning();
    companyId = c.id;
    console.log('Seeded Company:', c.tradeName);
  } else {
    companyId = existingCompanies[0].id;
  }

  // 2. Seed Branches
  const existingBranches = await db.select().from(branches);
  let hqBranchId: number;
  let factory1Id: number;

  if (existingBranches.length === 0) {
    const [b1] = await db.insert(branches).values({
      companyId,
      code: 'JPR-HQ',
      name: 'Jaipur Corporate HQ & Central Logistics Depot',
      branchType: 'HEAD_OFFICE',
      gstin: '08AABCE9876K1Z2',
      address: 'Plot 42, VKI Area, Road No. 5, Jaipur, Rajasthan 302013',
      stateCode: '08',
      isFactory: false,
      isHeadOffice: true,
      isActive: true,
    }).returning();
    hqBranchId = b1.id;

    const [b2] = await db.insert(branches).values({
      companyId,
      code: 'VKI-PLANT1',
      name: 'VKI Unit 1: Heating Appliances & Electric Kettles',
      branchType: 'FACTORY',
      gstin: '08AABCE9876K1Z2',
      address: 'Plot 43-44, VKI Area, Road No. 5, Jaipur, Rajasthan 302013',
      stateCode: '08',
      isFactory: true,
      isHeadOffice: false,
      isActive: true,
    }).returning();
    factory1Id = b2.id;

    await db.insert(branches).values({
      companyId,
      code: 'VKI-PLANT2',
      name: 'VKI Unit 2: Fans & Mosquito Bats Assembly Line',
      branchType: 'FACTORY',
      gstin: '08AABCE9876K1Z2',
      address: 'Plot 45, VKI Area, Road No. 6, Jaipur, Rajasthan 302013',
      stateCode: '08',
      isFactory: true,
      isHeadOffice: false,
      isActive: true,
    });
    console.log('Seeded Branches: 3 units');
  } else {
    hqBranchId = existingBranches[0].id;
    factory1Id = existingBranches[1]?.id || hqBranchId;
  }

  // 3. Seed Warehouses
  const existingWarehouses = await db.select().from(warehouses);
  let whRmId: number;
  let whFgId: number;

  if (existingWarehouses.length === 0) {
    const [w1] = await db.insert(warehouses).values({
      companyId,
      branchId: factory1Id,
      code: 'WH-RM-01',
      name: 'Central Raw Materials & Components Depot',
      warehouseType: 'RAW_MATERIALS',
      location: 'Plant 1 Ground Floor',
      capacitySqFt: 18000,
      managerName: 'Rajesh Sharma',
    }).returning();
    whRmId = w1.id;

    const [w2] = await db.insert(warehouses).values({
      companyId,
      branchId: hqBranchId,
      code: 'WH-FG-01',
      name: 'Snow Wave Finished Goods Central Hub',
      warehouseType: 'FINISHED_GOODS',
      location: 'HQ Dispatch Bay',
      capacitySqFt: 35000,
      managerName: 'Vikram Shekhawat',
    }).returning();
    whFgId = w2.id;

    await db.insert(warehouses).values({
      companyId,
      branchId: factory1Id,
      code: 'WH-WIP-01',
      name: 'Shop Floor WIP & Assembly Buffer',
      warehouseType: 'WIP',
      location: 'Plant 1 Bay 2',
      capacitySqFt: 8000,
      managerName: 'Amit Verma',
    });

    await db.insert(warehouses).values({
      companyId,
      branchId: hqBranchId,
      code: 'WH-SPARE-01',
      name: 'Service Spares & Warranty Reserve',
      warehouseType: 'SPARE_PARTS',
      location: 'HQ Service Wing',
      capacitySqFt: 5000,
      managerName: 'Mukesh Meena',
    });
    console.log('Seeded Warehouses: 4 warehouses');
  } else {
    whRmId = existingWarehouses[0].id;
    whFgId = existingWarehouses[1]?.id || whRmId;
  }

  // 4. Seed Bins
  const existingBins = await db.select().from(warehouseBins);
  if (existingBins.length === 0 && whRmId) {
    await db.insert(warehouseBins).values([
      { warehouseId: whRmId, binCode: 'RM-RACK-A1', zone: 'Zone A', aisle: 'Aisle 1', rack: 'Rack A1', shelf: 'Tier 1' },
      { warehouseId: whRmId, binCode: 'RM-RACK-A2', zone: 'Zone A', aisle: 'Aisle 1', rack: 'Rack A2', shelf: 'Tier 2' },
      { warehouseId: whRmId, binCode: 'RM-RACK-B1', zone: 'Zone B (Copper & Motors)', aisle: 'Aisle 2', rack: 'Rack B1', shelf: 'Tier 1' },
      { warehouseId: whFgId, binCode: 'FG-BAY-HEATERS', zone: 'Heating Hub', aisle: 'Bay 1', rack: 'Pallet Rack 1', shelf: 'Floor' },
      { warehouseId: whFgId, binCode: 'FG-BAY-FANS', zone: 'Fans Hub', aisle: 'Bay 2', rack: 'Pallet Rack 2', shelf: 'Floor' },
    ]);
  }

  // 5. Seed Roles & Permissions
  const existingRoles = await db.select().from(roles);
  let superAdminRoleId: number;

  if (existingRoles.length === 0) {
    const rolesData = [
      { code: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Unrestricted master access to all enterprise subsystems and ledger locks' },
      { code: 'DIRECTOR', name: 'Director / Executive', desc: 'Full business intelligence, financial reports, and high-value approvals' },
      { code: 'ACCOUNTANT', name: 'Chief Accountant', desc: 'Double-entry bookkeeping, GST filings, bank reconciliation, and P&L statements' },
      { code: 'PURCHASE_MGR', name: 'Purchase Manager', desc: 'Supplier quotation comparison, purchase orders, and landed cost verification' },
      { code: 'PROD_MGR', name: 'Production Manager', desc: 'BOM maintenance, MRP, shop-floor work orders, and production output' },
      { code: 'STORE_MGR', name: 'Store & Warehouse Manager', desc: 'Stock inward GRN, bin allocation, stock transfers, and negative stock controls' },
      { code: 'SALES_MGR', name: 'Sales & CRM Manager', desc: 'Dealer network, quotation, sales orders, price lists, and customer ledger' },
      { code: 'DISPATCH_MGR', name: 'Dispatch & Logistics Officer', desc: 'E-way bill generation, packing lists, delivery challans, and vehicle gate passes' },
      { code: 'QUALITY_MGR', name: 'Quality Control Lead', desc: 'Incoming RM testing, in-process assembly inspection, and final FG QA clearance' },
      { code: 'HR_MGR', name: 'HR & Payroll Head', desc: 'Staff biometric attendance, salary sheets, EPF/ESIC statutory compliance' },
      { code: 'EMPLOYEE', name: 'Standard Staff / Operator', desc: 'Assigned workflow operational data entry' },
    ];

    const insertedRoles = await db.insert(roles).values(
      rolesData.map(r => ({
        companyId,
        code: r.code,
        name: r.name,
        description: r.desc,
        isSystem: true,
      }))
    ).returning();

    superAdminRoleId = insertedRoles[0].id;

    // Grant full permissions to Super Admin and Director
    const modules = ['dashboard', 'company', 'users', 'inventory', 'purchase', 'production', 'sales', 'accounting', 'gst', 'quality', 'complaints', 'hr', 'audit'];
    for (const r of insertedRoles) {
      const isFull = r.code === 'SUPER_ADMIN' || r.code === 'DIRECTOR';
      const perms = modules.map(m => ({
        roleId: r.id,
        module: m,
        canView: true,
        canCreate: isFull || ['PURCHASE_MGR', 'PROD_MGR', 'STORE_MGR', 'SALES_MGR', 'ACCOUNTANT', 'QUALITY_MGR'].includes(r.code),
        canEdit: isFull || ['PURCHASE_MGR', 'PROD_MGR', 'STORE_MGR', 'SALES_MGR', 'ACCOUNTANT'].includes(r.code),
        canApprove: isFull || (r.code === 'PURCHASE_MGR' && m === 'purchase') || (r.code === 'PROD_MGR' && m === 'production'),
        canPost: isFull || (r.code === 'ACCOUNTANT' && ['accounting', 'gst'].includes(m)),
        canCancel: isFull,
        canExport: true,
      }));
      await db.insert(rolePermissions).values(perms);
    }
    console.log('Seeded Roles & Permissions Matrix');
  } else {
    superAdminRoleId = existingRoles[0].id;
  }

  // 6. Seed Default Super Admin / Director Users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      {
        uid: 'sys-admin-001',
        email: 'electromaxglobal@gmail.com',
        fullName: 'Mr. Sushil Goyal',
        phoneNumber: '+91 98290 12345',
        companyId,
        branchId: hqBranchId,
        roleId: superAdminRoleId,
        designation: 'Founder & Director',
        employeeCode: 'EMG-DIR-001',
        isActive: true,
      },
      {
        uid: 'sys-admin-002',
        email: 'accounts@electromaxglobal.com',
        fullName: 'Rameshwar Sharma (FCA)',
        phoneNumber: '+91 94140 56789',
        companyId,
        branchId: hqBranchId,
        roleId: superAdminRoleId,
        designation: 'Chief Financial Officer',
        employeeCode: 'EMG-ACC-001',
        isActive: true,
      },
      {
        uid: 'sys-admin-003',
        email: 'production@electromaxglobal.com',
        fullName: 'Er. Alok Rathore',
        phoneNumber: '+91 98291 99887',
        companyId,
        branchId: factory1Id,
        roleId: superAdminRoleId,
        designation: 'VP of Manufacturing & Quality',
        employeeCode: 'EMG-PRD-001',
        isActive: true,
      },
    ]);
    console.log('Seeded Executive Users');
  }

  // 7. Seed Product Categories
  const existingCategories = await db.select().from(productCategories);
  const categoryMap = new Map<string, number>();

  if (existingCategories.length === 0) {
    const categoriesData = [
      { code: 'RH', name: 'Room Heater', desc: 'Halogen, Carbon, Quartz, and Convector Room Heaters for harsh North Indian winters', icon: 'Flame' },
      { code: 'EK', name: 'Electric Kettle', desc: 'Food-grade SS 304 and Borosilicate Glass rapid electric kettles with auto cut-off', icon: 'Coffee' },
      { code: 'PF', name: 'Pedestal Fan', desc: 'Heavy-duty high-speed pedestal stand fans with 100% copper wound motors', icon: 'Fan' },
      { code: 'TF', name: 'Table Fan', desc: 'Aerodynamic compact table fans for office, kitchen, and personal circulation', icon: 'Wind' },
      { code: 'WF', name: 'Wall Fan', desc: 'Dual cord pull-switch wall mount circulating fans for retail and household spaces', icon: 'Maximize2' },
      { code: 'MB', name: 'Mosquito Bat', desc: 'Heavy-duty 1200mAh Li-ion rechargeable insect swatter with safety mesh and Type-C', icon: 'Zap' },
    ];

    const insertedCats = await db.insert(productCategories).values(categoriesData).returning();
    for (const cat of insertedCats) {
      categoryMap.set(cat.code, cat.id);
    }
    console.log('Seeded Product Categories: 6 categories');
  } else {
    for (const cat of existingCategories) {
      categoryMap.set(cat.code, cat.id);
    }
  }

  // 8. Seed Products (Snow Wave Appliances + Raw Materials)
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    const rhId = categoryMap.get('RH') || 1;
    const ekId = categoryMap.get('EK') || 2;
    const pfId = categoryMap.get('PF') || 3;
    const tfId = categoryMap.get('TF') || 4;
    const wfId = categoryMap.get('WF') || 5;
    const mbId = categoryMap.get('MB') || 6;

    const initialProducts = [
      // Finished Goods - Room Heaters
      {
        companyId,
        categoryId: rhId,
        brand: 'Snow Wave',
        code: 'SW-RH-HALO1200',
        name: 'Snow Wave Halogen Room Heater 1200W (Oscillating)',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 150,
        maxStockLevel: 2500,
        reorderPoint: 300,
        standardCost: '950.00',
        mrp: '2490.00',
        dealerPrice: '1380.00',
        specifications: '3 High-efficiency Halogen rods (400W each), Wide-angle 70° oscillation, Safety tip-over switch, Thermal fuse shutoff, Cool touch body',
      },
      {
        companyId,
        categoryId: rhId,
        brand: 'Snow Wave',
        code: 'SW-RH-CARBON1000',
        name: 'Snow Wave Carbon Instant Glow Room Heater 1000W',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 100,
        maxStockLevel: 1800,
        reorderPoint: 200,
        standardCost: '1120.00',
        mrp: '2890.00',
        dealerPrice: '1620.00',
        specifications: 'Carbon fiber instant heating tube, Deep penetration radiant heat, Ultra quiet, IPX4 splash resistant',
      },
      {
        companyId,
        categoryId: rhId,
        brand: 'Snow Wave',
        code: 'SW-RH-CONV2000',
        name: 'Snow Wave Heat Convector Fan Blower 2000W',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 120,
        maxStockLevel: 2000,
        reorderPoint: 250,
        standardCost: '820.00',
        mrp: '1990.00',
        dealerPrice: '1190.00',
        specifications: 'Twin heat settings (1000W/2000W), Adjustable thermostat, Dual air blower, Overheat protection',
      },

      // Finished Goods - Electric Kettles
      {
        companyId,
        categoryId: ekId,
        brand: 'Snow Wave',
        code: 'SW-EK-18L-SS',
        name: 'Snow Wave SS 304 Electric Kettle 1.8 Litre (1500W)',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 200,
        maxStockLevel: 3000,
        reorderPoint: 400,
        standardCost: '510.00',
        mrp: '1290.00',
        dealerPrice: '720.00',
        specifications: 'Food grade SS 304 seamless inner pot, 1500W rapid boiling coil, Strix thermostat auto cut-off, Dry boil safeguard, 360° swivel base',
      },
      {
        companyId,
        categoryId: ekId,
        brand: 'Snow Wave',
        code: 'SW-EK-20L-GLASS',
        name: 'Snow Wave Borosilicate Glass Kettle 2.0L with Blue LED',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 100,
        maxStockLevel: 1500,
        reorderPoint: 200,
        standardCost: '740.00',
        mrp: '1850.00',
        dealerPrice: '1050.00',
        specifications: 'Thermal shock resistant borosilicate body, 304 stainless steel base, Soft blue LED illumination during heating, Ergonomic handle',
      },

      // Finished Goods - Pedestal Fans
      {
        companyId,
        categoryId: pfId,
        brand: 'Snow Wave',
        code: 'SW-PF-400MM-HI',
        name: 'Snow Wave High Speed Pedestal Fan 400mm (100% Copper)',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8414',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 100,
        maxStockLevel: 1500,
        reorderPoint: 250,
        standardCost: '1350.00',
        mrp: '3150.00',
        dealerPrice: '1890.00',
        specifications: '100% Copper wound motor, 2150 RPM, High air delivery 95 CMM, Heavy round base for anti-topple stability, Telescopic height adjustment',
      },
      {
        companyId,
        categoryId: pfId,
        brand: 'Snow Wave',
        code: 'SW-PF-450MM-TORNADO',
        name: 'Snow Wave Tornado Heavy Industrial Pedestal Fan 450mm',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8414',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 80,
        maxStockLevel: 1200,
        reorderPoint: 150,
        standardCost: '1680.00',
        mrp: '3750.00',
        dealerPrice: '2350.00',
        specifications: 'Heavy gauge metallic blades, Cast iron tripod base, Aerodynamic shroud, 130 CMM extreme air delivery',
      },

      // Finished Goods - Table Fans
      {
        companyId,
        categoryId: tfId,
        brand: 'Snow Wave',
        code: 'SW-TF-300MM-AERO',
        name: 'Snow Wave Aerodynamic Desk Table Fan 300mm',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8414',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 100,
        maxStockLevel: 2000,
        reorderPoint: 200,
        standardCost: '780.00',
        mrp: '1750.00',
        dealerPrice: '1080.00',
        specifications: 'Whisper quiet copper motor, 3-speed piano switch control, 90° smooth oscillation, Sturdy compact base',
      },

      // Finished Goods - Wall Fans
      {
        companyId,
        categoryId: wfId,
        brand: 'Snow Wave',
        code: 'SW-WF-400MM-DUAL',
        name: 'Snow Wave Dual Cord Wall Mount Fan 400mm',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8414',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 90,
        maxStockLevel: 1600,
        reorderPoint: 180,
        standardCost: '1050.00',
        mrp: '2450.00',
        dealerPrice: '1460.00',
        specifications: 'Dual pull cords for speed regulation & oscillation, Reinforced safety grill, Thermal overload motor protection',
      },

      // Finished Goods - Mosquito Bats
      {
        companyId,
        categoryId: mbId,
        brand: 'Snow Wave',
        code: 'SW-MB-TURBO',
        name: 'Snow Wave Turbo Swatter Mosquito Bat (Type-C, 1200mAh)',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8543',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 300,
        maxStockLevel: 5000,
        reorderPoint: 600,
        standardCost: '185.00',
        mrp: '499.00',
        dealerPrice: '275.00',
        specifications: '3500V instant zap grid, 1200mAh rechargeable Li-ion battery, Fast Type-C charging port, Built-in LED finder light, 3-layer anti-shock mesh',
      },
      {
        companyId,
        categoryId: mbId,
        brand: 'Snow Wave',
        code: 'SW-MB-PRO-STAND',
        name: 'Snow Wave Auto Zapper Mosquito Bat with Base Stand',
        itemType: 'FINISHED_GOOD',
        hsnCode: '8543',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 200,
        maxStockLevel: 4000,
        reorderPoint: 400,
        standardCost: '260.00',
        mrp: '699.00',
        dealerPrice: '385.00',
        specifications: 'Dual mode: Handheld swatter + Auto purple light attractor base, 18650 high capacity battery, Dual physical safety switch',
      },

      // Raw Materials & Components
      {
        companyId,
        categoryId: rhId,
        brand: 'OEM Supply',
        code: 'RM-HALO-ROD-400',
        name: 'Halogen Quartz Heating Tube 400W (High Durability)',
        itemType: 'RAW_MATERIAL',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 1000,
        maxStockLevel: 10000,
        reorderPoint: 2500,
        standardCost: '72.00',
        mrp: '150.00',
        dealerPrice: '90.00',
        specifications: 'High purity fused quartz glass with internal tungsten wire, standard 240V AC',
      },
      {
        companyId,
        categoryId: pfId,
        brand: 'OEM Supply',
        code: 'RM-MTR-COPPER-400',
        name: '100% Electrolytic Copper Fan Motor 16-Pole 2150 RPM',
        itemType: 'RAW_MATERIAL',
        hsnCode: '8501',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 500,
        maxStockLevel: 5000,
        reorderPoint: 1200,
        standardCost: '620.00',
        mrp: '1100.00',
        dealerPrice: '750.00',
        specifications: 'Dual ball bearing, thermal cut-off fuse, Class F insulation, silicon steel stamping lamination',
      },
      {
        companyId,
        categoryId: mbId,
        brand: 'OEM Supply',
        code: 'RM-BATT-LION-1200',
        name: 'Rechargeable 18650 Li-ion Battery Cell 1200mAh 3.7V',
        itemType: 'RAW_MATERIAL',
        hsnCode: '8507',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 2000,
        maxStockLevel: 25000,
        reorderPoint: 5000,
        standardCost: '58.00',
        mrp: '120.00',
        dealerPrice: '72.00',
        specifications: 'BIS certified, built-in PCM protection against overcharge and short circuit',
      },
      {
        companyId,
        categoryId: ekId,
        brand: 'OEM Supply',
        code: 'RM-KETTLE-COIL-1500',
        name: 'Concealed SS 304 Heating Plate Element 1500W',
        itemType: 'RAW_MATERIAL',
        hsnCode: '8516',
        gstRate: '18.00',
        uom: 'PCS',
        minStockLevel: 800,
        maxStockLevel: 8000,
        reorderPoint: 2000,
        standardCost: '180.00',
        mrp: '350.00',
        dealerPrice: '220.00',
        specifications: 'High thermal conductivity aluminum alloy disc bonded to stainless steel heating pipe',
      },
    ];

    const insertedProducts = await db.insert(products).values(initialProducts).returning();
    console.log('Seeded Products & Components:', insertedProducts.length);

    // 9. Seed Stock Balances & Stock Ledger
    if (whFgId && whRmId) {
      for (const p of insertedProducts) {
        const isFg = p.itemType === 'FINISHED_GOOD';
        const targetWh = isFg ? whFgId : whRmId;
        const initialQty = isFg ? 420 : 1850;
        const unitCost = Number(p.standardCost) || 500;
        const totalValuation = (initialQty * unitCost).toFixed(2);

        await db.insert(stockBalances).values({
          warehouseId: targetWh,
          productId: p.id,
          quantity: initialQty.toFixed(2),
          reservedQuantity: '0.00',
          availableQuantity: initialQty.toFixed(2),
          averageCost: unitCost.toFixed(2),
          totalValuation: totalValuation,
        });

        await db.insert(stockLedger).values({
          companyId,
          warehouseId: targetWh,
          productId: p.id,
          voucherType: isFg ? 'PROD_RECEIPT' : 'GRN',
          voucherNo: isFg ? `PR-2026-${1000 + p.id}` : `GRN-2026-${2000 + p.id}`,
          movementType: 'IN',
          quantity: initialQty.toFixed(2),
          unitCost: unitCost.toFixed(2),
          totalValue: totalValuation,
          balanceAfter: initialQty.toFixed(2),
          referenceDoc: isFg ? 'Assembly Batch #101' : 'Supplier Invoice #INV-9821',
          narration: `Initial verified warehouse inventory for ${p.name}`,
        });
      }
      console.log('Seeded Initial Stock Balances and Ledger Transactions');
    }
  }

  // 10. Seed Parties (Key Suppliers & Wholesale Customers)
  const existingParties = await db.select().from(parties);
  if (existingParties.length === 0) {
    await db.insert(parties).values([
      // Suppliers
      {
        companyId,
        partyType: 'SUPPLIER',
        code: 'SUP-JPR-COPPER',
        legalName: 'Rajasthan Copper & Wires Industrial Corp',
        tradeName: 'Raj Copper Corp',
        gstin: '08AAACR4455M1Z1',
        pan: 'AAACR4455M',
        stateCode: '08',
        stateName: 'Rajasthan',
        email: 'sales@rajcoppercorp.com',
        phone: '+91 141 2788990',
        billingAddress: 'G-12, RIICO Industrial Area, Mansarovar, Jaipur 302020',
        creditLimit: '1500000.00',
        creditDays: 45,
      },
      {
        companyId,
        partyType: 'SUPPLIER',
        code: 'SUP-DELHI-ELEC',
        legalName: 'Apex Quartz & Heating Components Pvt Ltd',
        tradeName: 'Apex Heating Tech',
        gstin: '07AABCA3322L1Z9',
        pan: 'AABCA3322L',
        stateCode: '07',
        stateName: 'Delhi',
        email: 'orders@apexheating.com',
        phone: '+91 11 45678900',
        billingAddress: '42, Okhla Industrial Area Phase 2, New Delhi 110020',
        creditLimit: '2500000.00',
        creditDays: 30,
      },
      // Customers / Distributors
      {
        companyId,
        partyType: 'CUSTOMER',
        code: 'CUST-RAJ-DIST',
        legalName: 'Marwar Electricals & Home Appliances Distributors',
        tradeName: 'Marwar Electricals',
        gstin: '08AABFM1122Q1ZQ',
        pan: 'AABFM1122Q',
        stateCode: '08',
        stateName: 'Rajasthan',
        email: 'procurement@marwarelectricals.com',
        phone: '+91 291 2654321',
        billingAddress: 'Station Road, Ratanada, Jodhpur, Rajasthan 342001',
        creditLimit: '5000000.00',
        creditDays: 30,
      },
      {
        companyId,
        partyType: 'CUSTOMER',
        code: 'CUST-DELHI-WHOLESALE',
        legalName: 'Bhagirath Palace Appliance Mart LLP',
        tradeName: 'Bhagirath Mart',
        gstin: '07AAAFB9988P1Z8',
        pan: 'AAAFB9988P',
        stateCode: '07',
        stateName: 'Delhi',
        email: 'sales@bhagirathmart.com',
        phone: '+91 11 23865432',
        billingAddress: 'Shop 104, Bhagirath Palace, Chandni Chowk, Delhi 110006',
        creditLimit: '7500000.00',
        creditDays: 21,
      },
    ]);
    console.log('Seeded Parties (Suppliers & Wholesale Distributors)');
  }

  // 11. Seed Chart of Accounts & Groups (Double Entry)
  const existingGroups = await db.select().from(accountGroups);
  if (existingGroups.length === 0) {
    const [gAssets] = await db.insert(accountGroups).values({ companyId, name: 'Current Assets', nature: 'ASSET' }).returning();
    const [gLiab] = await db.insert(accountGroups).values({ companyId, name: 'Current Liabilities', nature: 'LIABILITY' }).returning();
    const [gIncome] = await db.insert(accountGroups).values({ companyId, name: 'Sales & Operating Revenue', nature: 'INCOME' }).returning();
    const [gExpense] = await db.insert(accountGroups).values({ companyId, name: 'Direct Production Expenses', nature: 'EXPENSE' }).returning();

    await db.insert(accounts).values([
      { companyId, groupId: gAssets.id, code: '1001', name: 'State Bank of India (VKI Branch Current A/c)', accountType: 'BANK', openingBalance: '4850000.00', currentBalance: '4850000.00', isSystem: true },
      { companyId, groupId: gAssets.id, code: '1002', name: 'ICICI Bank (Jaipur Cash Credit A/c)', accountType: 'BANK', openingBalance: '2500000.00', currentBalance: '2500000.00', isSystem: true },
      { companyId, groupId: gAssets.id, code: '1003', name: 'Petty Cash - Plant 1', accountType: 'CASH', openingBalance: '50000.00', currentBalance: '50000.00', isSystem: true },
      { companyId, groupId: gLiab.id, code: '2001', name: 'CGST Payable (Output Tax)', accountType: 'DUTY_TAX', openingBalance: '0.00', currentBalance: '185000.00', isSystem: true },
      { companyId, groupId: gLiab.id, code: '2002', name: 'SGST Payable (Output Tax)', accountType: 'DUTY_TAX', openingBalance: '0.00', currentBalance: '185000.00', isSystem: true },
      { companyId, groupId: gAssets.id, code: '1005', name: 'Input Tax Credit - CGST', accountType: 'DUTY_TAX', openingBalance: '0.00', currentBalance: '142000.00', isSystem: true },
      { companyId, groupId: gAssets.id, code: '1006', name: 'Input Tax Credit - SGST', accountType: 'DUTY_TAX', openingBalance: '0.00', currentBalance: '142000.00', isSystem: true },
      { companyId, groupId: gIncome.id, code: '3001', name: 'Sales Account - Snow Wave Domestic', accountType: 'SALES', openingBalance: '0.00', currentBalance: '0.00', isSystem: true },
      { companyId, groupId: gExpense.id, code: '4001', name: 'Raw Material Consumption & Purchase', accountType: 'PURCHASE', openingBalance: '0.00', currentBalance: '0.00', isSystem: true },
    ]);
    console.log('Seeded Chart of Accounts & Indian GST Ledger Groups');
  }

  // 12. Seed Master Colors
  const existingColors = await db.select().from(productColors);
  let colorMap: Record<string, number> = {};
  if (existingColors.length === 0) {
    const defaultColors = [
      { code: 'BLK', name: 'Jet Black', hexCode: '#18181B' },
      { code: 'WHT', name: 'Arctic White', hexCode: '#F8FAFC' },
      { code: 'RED', name: 'Crimson Red', hexCode: '#DC2626' },
      { code: 'BLU', name: 'Royal Blue', hexCode: '#2563EB' },
      { code: 'SLV', name: 'Brushed Silver', hexCode: '#94A3B8' },
      { code: 'GRY', name: 'Steel Grey', hexCode: '#475569' },
    ];
    const insertedColors = await db.insert(productColors).values(defaultColors).returning();
    for (const c of insertedColors) {
      colorMap[c.code] = c.id;
    }
    console.log('Seeded Master Colors: 6 items');
  } else {
    for (const c of existingColors) {
      colorMap[c.code] = c.id;
    }
  }

  // 13. Seed Color-wise SKUs for Finished Goods
  const existingSkus = await db.select().from(productSkus);
  if (existingSkus.length === 0) {
    const allProducts = await db.select().from(products);
    const fgProducts = allProducts.filter((p) => p.itemType === 'FINISHED_GOOD');

    const sampleSkus = [];
    const colorsList = [
      { code: 'BLK', name: 'Jet Black' },
      { code: 'WHT', name: 'Arctic White' },
      { code: 'RED', name: 'Crimson Red' },
      { code: 'BLU', name: 'Royal Blue' },
    ];

    for (const p of fgProducts) {
      // Pick 2 to 4 colors for each finished good
      const colorsForProduct = p.code.includes('EK') ? colorsList : colorsList.slice(0, 2);
      let idx = 1;
      for (const c of colorsForProduct) {
        const colorId = colorMap[c.code] || 1;
        const skuCode = `${p.code}-${c.code}`;
        const barcode = `890${String(p.id).padStart(3, '0')}${String(colorId).padStart(2, '0')}${String(idx).padStart(4, '0')}`;
        const qrCode = `QR-${skuCode}`;
        const purchaseRate = p.standardCost || '350.00';
        const sellingRate = p.dealerPrice || '550.00';
        const mrp = p.mrp || '999.00';
        const stockQuantity = String(100 + (p.id * 35) + (idx * 25));

        sampleSkus.push({
          productId: p.id,
          colorId,
          skuCode,
          colorName: c.name,
          barcode,
          qrCode,
          purchaseRate,
          sellingRate,
          mrp,
          stockQuantity,
          minStockLevel: 30,
          weightKg: '1.250',
        });
        idx++;
      }
    }

    if (sampleSkus.length > 0) {
      await db.insert(productSkus).values(sampleSkus);
      console.log(`Seeded Color-wise SKUs: ${sampleSkus.length} variants with distinct barcodes`);
    }
  }

  // 14. Seed Carton Packing & CBM
  const existingCartons = await db.select().from(cartonPackings);
  if (existingCartons.length === 0) {
    const allProducts = await db.select().from(products);
    const kettle = allProducts.find((p) => p.code.includes('EK'));
    const heater = allProducts.find((p) => p.code.includes('RH'));
    const fan = allProducts.find((p) => p.code.includes('PF'));
    const bat = allProducts.find((p) => p.code.includes('MB'));

    const cartonRecords = [];
    if (kettle) {
      // 60 x 40 x 45 cm, 16 pcs/carton -> CBM = 0.108
      cartonRecords.push({
        productId: kettle.id,
        cartonNumber: 'CTN-EK-16PC',
        cartonLengthCm: '60.00',
        cartonWidthCm: '40.00',
        cartonHeightCm: '45.00',
        qtyPerCarton: 16,
        numCartons: 50,
        grossWeightKg: '15.20',
        netWeightKg: '13.60',
        cbmPerCarton: '0.108000',
        totalCbm: '5.400000',
        packingNotes: '5-Ply Heavy Corrugated Carton with Thermocol Edge Protectors',
      });
    }
    if (heater) {
      // 50 x 35 x 60 cm, 4 pcs/carton -> CBM = 0.105
      cartonRecords.push({
        productId: heater.id,
        cartonNumber: 'CTN-RH-4PC',
        cartonLengthCm: '50.00',
        cartonWidthCm: '35.00',
        cartonHeightCm: '60.00',
        qtyPerCarton: 4,
        numCartons: 100,
        grossWeightKg: '10.50',
        netWeightKg: '8.40',
        cbmPerCarton: '0.105000',
        totalCbm: '10.500000',
        packingNotes: 'Export grade 7-Ply Outer Box with Shock-Absorbent Moulds',
      });
    }
    if (fan) {
      // 55 x 20 x 55 cm, 2 pcs/carton -> CBM = 0.0605
      cartonRecords.push({
        productId: fan.id,
        cartonNumber: 'CTN-FAN-2PC',
        cartonLengthCm: '55.00',
        cartonWidthCm: '20.00',
        cartonHeightCm: '55.00',
        qtyPerCarton: 2,
        numCartons: 80,
        grossWeightKg: '12.40',
        netWeightKg: '10.40',
        cbmPerCarton: '0.060500',
        totalCbm: '4.840000',
        packingNotes: 'Reinforced Twin-Pack with Motor Cushion Support',
      });
    }
    if (bat) {
      // 52 x 25 x 40 cm, 50 pcs/carton -> CBM = 0.052
      cartonRecords.push({
        productId: bat.id,
        cartonNumber: 'CTN-BAT-50PC',
        cartonLengthCm: '52.00',
        cartonWidthCm: '25.00',
        cartonHeightCm: '40.00',
        qtyPerCarton: 50,
        numCartons: 40,
        grossWeightKg: '19.50',
        netWeightKg: '17.00',
        cbmPerCarton: '0.052000',
        totalCbm: '2.080000',
        packingNotes: 'Master Shipper Carton 50 Units with individual bubble sleeves',
      });
    }

    if (cartonRecords.length > 0) {
      await db.insert(cartonPackings).values(cartonRecords);
      console.log('Seeded Carton Packing Master & CBM specs');
    }
  }

  // 15. Seed Employees (HRMS)
  const existingEmployees = await db.select().from(employees);
  if (existingEmployees.length === 0) {
    await db.insert(employees).values([
      { companyId, employeeCode: 'EMP-001', fullName: 'Mr. Sushil Goyal', email: 'electromaxglobal@gmail.com', phone: '+91 98290 12345', department: 'Executive Management', designation: 'Founder & Director', reportingManager: 'Board of Directors', salary: '250000.00', joiningDate: '2018-04-01', shift: 'General Management (09:00 - 18:30)', isActive: true },
      { companyId, employeeCode: 'EMP-002', fullName: 'Rajesh Meena', email: 'rajesh.meena@electromaxglobal.com', phone: '+91 98291 55432', department: 'Production', designation: 'Plant Head - VKI Unit 1', reportingManager: 'Mr. Sushil Goyal', salary: '75000.00', joiningDate: '2019-06-15', shift: 'Morning Shift A (08:00 - 16:30)', isActive: true },
      { companyId, employeeCode: 'EMP-003', fullName: 'Vikram Singh Rathore', email: 'vikram.rathore@electromaxglobal.com', phone: '+91 98292 88765', department: 'Quality & Testing', designation: 'Quality Control Lead', reportingManager: 'Rajesh Meena', salary: '45000.00', joiningDate: '2020-01-10', shift: 'Morning Shift A (08:00 - 16:30)', isActive: true },
      { companyId, employeeCode: 'EMP-004', fullName: 'Anita Joshi', email: 'accounts@electromaxglobal.com', phone: '+91 98293 44321', department: 'Finance & Accounts', designation: 'Senior Accountant', reportingManager: 'Mr. Sushil Goyal', salary: '52000.00', joiningDate: '2020-09-01', shift: 'General Office (09:30 - 18:00)', isActive: true },
      { companyId, employeeCode: 'EMP-005', fullName: 'Sunita Verma', email: 'dispatch@electromaxglobal.com', phone: '+91 98294 11223', department: 'Dispatch & Logistics', designation: 'Logistics & Dispatch Officer', reportingManager: 'Mr. Sushil Goyal', salary: '38000.00', joiningDate: '2021-03-20', shift: 'General Office (09:30 - 18:00)', isActive: true },
    ]);
    console.log('Seeded Employees Master');
  }

  // 16. Seed Sample CRM Leads & Dispatches
  const existingLeads = await db.select().from(crmLeads);
  if (existingLeads.length === 0) {
    await db.insert(crmLeads).values([
      { customerName: 'Ramesh Agarwal', companyName: 'Agarwal Electronics & Wholesalers', phone: '+91 98280 44556', email: 'ramesh@agarwalelec.in', city: 'Jaipur', state: 'Rajasthan', source: 'IndiaMART Lead', status: 'QUOTATION_SENT', assignedExecutive: 'Mr. Sushil Goyal', expectedValue: '350000.00', notes: 'Required 500 pcs Electric Kettle SW-EK-18SS (Jet Black & Crimson Red)' },
      { customerName: 'Sanjay Chopra', companyName: 'Punjab Appliances Hub', phone: '+91 98140 22334', email: 'sanjay@choprahub.com', city: 'Ludhiana', state: 'Punjab', source: 'Direct Inquiry', status: 'PI_GENERATED', assignedExecutive: 'Mr. Sushil Goyal', expectedValue: '620000.00', notes: 'Requested 300 pcs Pedestal Fans and 400 pcs Mosquito Bats' },
    ]);
  }

  const existingDispatches = await db.select().from(dispatches);
  if (existingDispatches.length === 0) {
    const [dsp] = await db.insert(dispatches).values({
      dispatchNo: 'DSP-2026-0089',
      customerName: 'Marwar Electricals & Hardware Depot',
      destination: 'Jodhpur, Rajasthan',
      transporterName: 'V-Trans Express Logistics Ltd.',
      vehicleNo: 'RJ 14 GH 7821',
      driverName: 'Mohan Ram Gujjar',
      driverPhone: '+91 94140 98765',
      cartonCount: 45,
      totalWeightKg: '684.00',
      totalCbm: '4.860000',
      freightCharges: '8500.00',
      ewayBillNo: '241198304910',
      biltyNo: 'VT-JPR-99238',
      trackingToken: 'EMG-TRK-782194',
      status: 'IN_TRANSIT',
      dispatchDate: '2026-11-03',
    }).returning();

    await db.insert(biltyRecords).values({
      dispatchId: dsp.id,
      transporterName: 'V-Trans Express Logistics Ltd.',
      officialLrNumber: 'VT-JPR-99238',
      biltyDocumentUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      cartonCount: 45,
      weightKg: '684.00',
      freightAmount: '8500.00',
      issueDate: '2026-11-03',
      destinationCity: 'Jodhpur',
    });
    console.log('Seeded Dispatches & Bilty Tracking');
  }

  console.log('--- SEEDING COMPLETE SUCCESSFULLY ---');
}
