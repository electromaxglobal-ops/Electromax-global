import express, { Request, Response } from 'express';
import { db } from '../db/index.ts';
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
  auditLogs,
  accounts,
  accountGroups,
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
  boms,
  bomItems,
  vouchers,
  voucherLines,
  systemSettings,
} from '../db/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import { runSeeds } from '../db/seed.ts';

export const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log helper
const logAudit = async (action: string, entity: string, entityId: string, details: string, userName = 'Admin') => {
  try {
    await db.insert(auditLogs).values({
      action,
      entity,
      entityId,
      details,
      userName,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const result = await db.select({ count: sql`1` }).from(companies).limit(1);
    res.json({
      status: 'healthy',
      database: 'PostgreSQL (Cloud SQL)',
      version: 'Electromax ERP 2.0 (Phase 1)',
      connected: result.length > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'degraded', error: error.message });
  }
});

// Seed endpoint
app.post('/api/seed', async (req: Request, res: Response) => {
  try {
    await runSeeds();
    res.json({ success: true, message: 'Database seeded successfully with Electromax Global master data' });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message || 'Seeding failed' });
  }
});

// Auth / Profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    const allUsers = await db.select().from(users).orderBy(users.id);
    const activeCompany = (await db.select().from(companies).limit(1))[0];
    let currentUser = allUsers[0] || {
      id: 1,
      uid: 'sys-admin-001',
      fullName: 'Mr. Sushil Goyal',
      email: 'electromaxglobal@gmail.com',
      designation: 'Founder & Director',
      role: 'Super Admin',
    };

    // Ensure founder & director is strictly Mr. Sushil Goyal
    if (!currentUser.fullName || currentUser.fullName.includes('Kailash') || currentUser.id === 1) {
      currentUser = {
        ...currentUser,
        fullName: 'Mr. Sushil Goyal',
        designation: 'Founder & Director',
        email: 'electromaxglobal@gmail.com',
      };
    }

    const userRole = currentUser.roleId
      ? (await db.select().from(roles).where(eq(roles.id, currentUser.roleId)))[0]
      : { code: 'SUPER_ADMIN', name: 'Super Admin' };

    res.json({
      user: {
        ...currentUser,
        roleName: userRole?.name || 'Super Admin',
        roleCode: userRole?.code || 'SUPER_ADMIN',
      },
      company: activeCompany,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Company Master
app.get('/api/companies/active', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(companies).limit(1);
    if (list.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    res.json(list[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/active', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(companies).limit(1);
    if (list.length === 0) return res.status(404).json({ error: 'Company not found' });

    const c = list[0];
    const { legalName, tradeName, gstin, pan, cin, email, phone, address, city, stateCode, stateName, pincode } = req.body;

    const [updated] = await db
      .update(companies)
      .set({
        legalName: legalName || c.legalName,
        tradeName: tradeName || c.tradeName,
        gstin: gstin || c.gstin,
        pan: pan || c.pan,
        cin: cin ?? c.cin,
        email: email ?? c.email,
        phone: phone ?? c.phone,
        address: address || c.address,
        city: city || c.city,
        stateCode: stateCode || c.stateCode,
        stateName: stateName || c.stateName,
        pincode: pincode ?? c.pincode,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, c.id))
      .returning();

    await logAudit('UPDATE', 'COMPANY', String(c.id), `Updated company details for ${updated.tradeName}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Branches / Factories
app.get('/api/branches', async (req: Request, res: Response) => {
  try {
    const branchList = await db.select().from(branches).orderBy(branches.code);
    res.json(branchList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/branches', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const { code, name, branchType, gstin, address, stateCode, isFactory, isHeadOffice } = req.body;

    const [newBranch] = await db.insert(branches).values({
      companyId,
      code,
      name,
      branchType: branchType || 'FACTORY',
      gstin: gstin || companyList[0]?.gstin,
      address,
      stateCode: stateCode || '08',
      isFactory: isFactory ?? true,
      isHeadOffice: isHeadOffice ?? false,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'BRANCH', String(newBranch.id), `Created branch ${newBranch.code} - ${newBranch.name}`);
    res.status(201).json(newBranch);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/branches/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { code, name, branchType, gstin, address, stateCode, isFactory, isHeadOffice, isActive, managerName, contactPerson, phone, email, remarks } = req.body;

    const [updated] = await db.update(branches)
      .set({
        code,
        name,
        branchType,
        gstin,
        address,
        stateCode,
        isFactory: isFactory !== undefined ? Boolean(isFactory) : undefined,
        isHeadOffice: isHeadOffice !== undefined ? Boolean(isHeadOffice) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(branches.id, id))
      .returning();

    await logAudit('UPDATE', 'BRANCH', String(id), `Updated plant/branch ${code || updated.code} - ${name || updated.name}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/branches/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const linkedWh = await db.select().from(warehouses).where(eq(warehouses.branchId, id));
    const linkedUsers = await db.select().from(users).where(eq(users.branchId, id));

    if (linkedWh.length > 0 || linkedUsers.length > 0) {
      await db.update(branches).set({ isActive: false }).where(eq(branches.id, id));
      await logAudit('DEACTIVATE', 'BRANCH', String(id), `Deactivated branch ID ${id} because ${linkedWh.length} warehouse(s) and ${linkedUsers.length} user(s) are attached.`);
      return res.json({
        success: true,
        message: `Branch deactivated safely. Permanent delete prevented because active warehouses (${linkedWh.length}) or users (${linkedUsers.length}) are linked.`,
      });
    }

    await db.delete(branches).where(eq(branches.id, id));
    await logAudit('DELETE', 'BRANCH', String(id), `Permanently deleted unused branch ID ${id}`);
    res.json({ success: true, message: `Branch ID ${id} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Warehouses
app.get('/api/warehouses', async (req: Request, res: Response) => {
  try {
    const whList = await db.select().from(warehouses).orderBy(warehouses.code);
    const branchList = await db.select().from(branches);
    const branchMap = new Map(branchList.map(b => [b.id, b]));

    const enriched = whList.map(w => ({
      ...w,
      branch: branchMap.get(w.branchId),
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/warehouses', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const { branchId, code, name, warehouseType, location, capacitySqFt, managerName } = req.body;

    const [newWh] = await db.insert(warehouses).values({
      companyId,
      branchId: Number(branchId),
      code,
      name,
      warehouseType,
      location,
      capacitySqFt: capacitySqFt ? Number(capacitySqFt) : null,
      managerName,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'WAREHOUSE', String(newWh.id), `Created warehouse ${newWh.code} - ${newWh.name}`);
    res.status(201).json(newWh);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const whId = Number(req.params.id);
    const { branchId, code, name, warehouseType, location, capacitySqFt, managerName, isActive } = req.body;

    const [updated] = await db.update(warehouses)
      .set({
        branchId: branchId ? Number(branchId) : undefined,
        code,
        name,
        warehouseType,
        location,
        capacitySqFt: capacitySqFt !== undefined ? Number(capacitySqFt) : undefined,
        managerName,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(warehouses.id, whId))
      .returning();

    await logAudit('UPDATE', 'WAREHOUSE', String(whId), `Updated warehouse ${code || updated.code} - ${name || updated.name}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/warehouses/:id', async (req: Request, res: Response) => {
  try {
    const whId = Number(req.params.id);
    // Check if stock exists
    const stock = await db.select().from(stockBalances).where(eq(stockBalances.warehouseId, whId));
    const totalQty = stock.reduce((acc, s) => acc + Number(s.quantity || 0), 0);
    if (totalQty > 0) {
      return res.status(400).json({
        error: `Cannot delete warehouse with active stock balance (${totalQty} units on hand). Transfer or adjust stock first, or deactivate warehouse.`,
      });
    }

    await db.delete(warehouses).where(eq(warehouses.id, whId));
    await logAudit('DELETE', 'WAREHOUSE', String(whId), `Deleted warehouse ID ${whId}`);
    res.json({ success: true, message: `Warehouse ${whId} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Roles and Permissions
app.get('/api/roles', async (req: Request, res: Response) => {
  try {
    const allRoles = await db.select().from(roles).orderBy(roles.id);
    const allUsers = await db.select().from(users);
    const perms = await db.select().from(rolePermissions);

    const enriched = allRoles.map(r => ({
      ...r,
      userCount: allUsers.filter(u => u.roleId === r.id).length,
      permissionCount: perms.filter(p => p.roleId === r.id && (p.canView || p.canCreate)).length,
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/roles/:id/permissions', async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id);
    const perms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    res.json(perms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roles/:id/permissions', async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id);
    const { permissions: updatedList } = req.body;

    for (const p of updatedList) {
      if (p.id) {
        await db.update(rolePermissions).set({
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canApprove: p.canApprove,
          canPost: p.canPost,
          canCancel: p.canCancel,
          canExport: p.canExport,
        }).where(eq(rolePermissions.id, p.id));
      }
    }

    await logAudit('UPDATE', 'ROLE_PERMISSIONS', String(roleId), `Updated permission matrix for role #${roleId}`);
    res.json({ success: true, message: 'Permissions updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users / Employees
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const userList = await db.select().from(users).orderBy(users.id);
    const roleList = await db.select().from(roles);
    const branchList = await db.select().from(branches);

    const roleMap = new Map(roleList.map(r => [r.id, r]));
    const branchMap = new Map(branchList.map(b => [b.id, b]));

    const enriched = userList.map(u => ({
      ...u,
      role: u.roleId ? roleMap.get(u.roleId) : null,
      branch: u.branchId ? branchMap.get(u.branchId) : null,
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const { email, fullName, phoneNumber, branchId, roleId, designation, employeeCode } = req.body;

    const uid = `usr-${Date.now()}`;
    const [newUser] = await db.insert(users).values({
      uid,
      companyId,
      email,
      fullName,
      phoneNumber,
      branchId: branchId ? Number(branchId) : null,
      roleId: roleId ? Number(roleId) : null,
      designation,
      employeeCode,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'USER', String(newUser.id), `Added employee ${newUser.fullName} (${newUser.email})`);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { email, fullName, phoneNumber, branchId, roleId, designation, employeeCode, isActive } = req.body;

    const [updated] = await db.update(users)
      .set({
        email,
        fullName,
        phoneNumber,
        branchId: branchId ? Number(branchId) : undefined,
        roleId: roleId ? Number(roleId) : undefined,
        designation,
        employeeCode,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(users.id, userId))
      .returning();

    await logAudit('UPDATE', 'USER', String(userId), `Updated user profile for ${fullName || updated.fullName}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const target = await db.select().from(users).where(eq(users.id, userId));
    if (target[0]?.fullName?.includes('Sushil Goyal') || target[0]?.id === 1) {
      return res.status(400).json({ error: 'Cannot delete primary founder & director account (Mr. Sushil Goyal).' });
    }

    await db.delete(users).where(eq(users.id, userId));
    await logAudit('DELETE', 'USER', String(userId), `Deleted user ID ${userId}`);
    res.json({ success: true, message: `User ${userId} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Product Categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const cats = await db.select().from(productCategories).orderBy(productCategories.id);
    const allProducts = await db.select().from(products);

    const enriched = cats.map(c => ({
      ...c,
      productCount: allProducts.filter(p => p.categoryId === c.id).length,
    }));
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { name, code, description, icon } = req.body;
    const [newCat] = await db.insert(productCategories).values({
      name,
      code: code ? code.toUpperCase() : name.slice(0, 3).toUpperCase(),
      description,
      icon,
    }).returning();
    await logAudit('CREATE', 'CATEGORY', String(newCat.id), `Added category ${newCat.name} (${newCat.code})`);
    res.status(201).json(newCat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, code, description, icon } = req.body;
    const [updated] = await db
      .update(productCategories)
      .set({ name, code: code ? code.toUpperCase() : undefined, description, icon })
      .where(eq(productCategories.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const linkedProducts = await db.select().from(products).where(eq(products.categoryId, id)).limit(1);
    if (linkedProducts.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category with associated products in catalog' });
    }
    await db.delete(productCategories).where(eq(productCategories.id, id));
    res.json({ success: true, message: 'Category removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Products Master
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const prods = await db.select().from(products).orderBy(products.id);
    const cats = await db.select().from(productCategories);
    const catMap = new Map(cats.map(c => [c.id, c]));
    const balances = await db.select().from(stockBalances);

    const enriched = prods.map(p => {
      const relatedBalances = balances.filter(b => b.productId === p.id);
      const totalQty = relatedBalances.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
      const totalVal = relatedBalances.reduce((sum, b) => sum + Number(b.totalValuation || 0), 0);

      return {
        ...p,
        category: catMap.get(p.categoryId),
        totalStock: totalQty,
        stockValuation: totalVal,
        isLowStock: totalQty <= (p.reorderPoint || 100),
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;

    const {
      categoryId,
      brand,
      code,
      name,
      itemType,
      hsnCode,
      gstRate,
      uom,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      standardCost,
      mrp,
      dealerPrice,
      specifications,
    } = req.body;

    const [newProduct] = await db.insert(products).values({
      companyId,
      categoryId: Number(categoryId),
      brand: brand || 'Snow Wave',
      code,
      name,
      itemType: itemType || 'FINISHED_GOOD',
      hsnCode,
      gstRate: String(gstRate || '18.00'),
      uom: uom || 'PCS',
      minStockLevel: minStockLevel ? Number(minStockLevel) : 50,
      maxStockLevel: maxStockLevel ? Number(maxStockLevel) : 1000,
      reorderPoint: reorderPoint ? Number(reorderPoint) : 100,
      standardCost: String(standardCost || '0.00'),
      mrp: String(mrp || '0.00'),
      dealerPrice: String(dealerPrice || '0.00'),
      specifications,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'PRODUCT', String(newProduct.id), `Added product ${newProduct.code} - ${newProduct.name}`);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      categoryId,
      brand,
      code,
      name,
      itemType,
      hsnCode,
      gstRate,
      uom,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      standardCost,
      mrp,
      dealerPrice,
      specifications,
      imageUrl,
    } = req.body;

    const [updated] = await db
      .update(products)
      .set({
        categoryId: categoryId ? Number(categoryId) : undefined,
        brand,
        code,
        name,
        itemType,
        hsnCode,
        gstRate: gstRate ? String(gstRate) : undefined,
        uom,
        minStockLevel: minStockLevel ? Number(minStockLevel) : undefined,
        maxStockLevel: maxStockLevel ? Number(maxStockLevel) : undefined,
        reorderPoint: reorderPoint ? Number(reorderPoint) : undefined,
        standardCost: standardCost ? String(standardCost) : undefined,
        mrp: mrp ? String(mrp) : undefined,
        dealerPrice: dealerPrice ? String(dealerPrice) : undefined,
        specifications,
        imageUrl,
      })
      .where(eq(products.id, id))
      .returning();

    await logAudit('UPDATE', 'PRODUCT', String(id), `Updated product ${code || id} details`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Controlled deletion/deactivation: Check if referenced by active orders
    const relatedOrders = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1);
    if (relatedOrders.length > 0) {
      // Soft-deactivate if referenced
      await db.update(products).set({ isActive: false }).where(eq(products.id, id));
      await logAudit('DEACTIVATE', 'PRODUCT', String(id), `Deactivated product ${id} due to existing transaction links`);
      return res.json({ success: true, message: 'Product has historical transactions and was safely deactivated' });
    }

    // Otherwise delete related skus and product
    await db.delete(productSkus).where(eq(productSkus.productId, id));
    await db.delete(stockBalances).where(eq(stockBalances.productId, id));
    await db.delete(products).where(eq(products.id, id));

    await logAudit('DELETE', 'PRODUCT', String(id), `Deleted product ${id} from catalog`);
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stock Balances & Ledger
app.get('/api/stock/balances', async (req: Request, res: Response) => {
  try {
    const balances = await db.select().from(stockBalances);
    const allProducts = await db.select().from(products);
    const allWarehouses = await db.select().from(warehouses);

    const prodMap = new Map(allProducts.map(p => [p.id, p]));
    const whMap = new Map(allWarehouses.map(w => [w.id, w]));

    const enriched = balances.map(b => ({
      ...b,
      product: prodMap.get(b.productId),
      warehouse: whMap.get(b.warehouseId),
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stock/ledger', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const ledger = await db.select().from(stockLedger).orderBy(desc(stockLedger.createdAt)).limit(limit);
    const allProducts = await db.select().from(products);
    const allWarehouses = await db.select().from(warehouses);

    const prodMap = new Map(allProducts.map(p => [p.id, p]));
    const whMap = new Map(allWarehouses.map(w => [w.id, w]));

    const enriched = ledger.map(l => ({
      ...l,
      product: prodMap.get(l.productId),
      warehouse: whMap.get(l.warehouseId),
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stock Adjustment (Real transactional entry with ledger posting)
app.post('/api/stock/adjust', async (req: Request, res: Response) => {
  try {
    const { warehouseId, productId, adjustmentType, quantity, reason } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ error: 'Quantity must be positive' });

    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;

    const [prod] = await db.select().from(products).where(eq(products.id, Number(productId)));
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const existingBalanceList = await db
      .select()
      .from(stockBalances)
      .where(sql`${stockBalances.warehouseId} = ${Number(warehouseId)} AND ${stockBalances.productId} = ${Number(productId)}`);

    const currentQty = existingBalanceList.length > 0 ? Number(existingBalanceList[0].quantity) : 0;
    const unitCost = Number(prod.standardCost) || 500;

    let newQty = currentQty;
    let movType = 'IN';

    if (adjustmentType === 'ADD') {
      newQty = currentQty + qty;
      movType = 'IN';
    } else if (adjustmentType === 'SUBTRACT') {
      if (currentQty < qty) {
        return res.status(400).json({ error: `Insufficient stock! Current available: ${currentQty} ${prod.uom}. Unauthorized negative stock is prevented.` });
      }
      newQty = currentQty - qty;
      movType = 'OUT';
    }

    const newValuation = (newQty * unitCost).toFixed(2);
    const voucherNo = `ADJ-${Date.now().toString().slice(-6)}`;

    // Update or Insert Balance
    if (existingBalanceList.length > 0) {
      await db.update(stockBalances).set({
        quantity: newQty.toFixed(2),
        availableQuantity: newQty.toFixed(2),
        totalValuation: newValuation,
        lastUpdated: new Date(),
      }).where(eq(stockBalances.id, existingBalanceList[0].id));
    } else {
      await db.insert(stockBalances).values({
        warehouseId: Number(warehouseId),
        productId: Number(productId),
        quantity: newQty.toFixed(2),
        reservedQuantity: '0.00',
        availableQuantity: newQty.toFixed(2),
        averageCost: unitCost.toFixed(2),
        totalValuation: newValuation,
      });
    }

    // Insert Immutable Stock Ledger entry
    await db.insert(stockLedger).values({
      companyId,
      warehouseId: Number(warehouseId),
      productId: Number(productId),
      voucherType: 'STOCK_ADJUSTMENT',
      voucherNo,
      movementType: movType,
      quantity: qty.toFixed(2),
      unitCost: unitCost.toFixed(2),
      totalValue: (qty * unitCost).toFixed(2),
      balanceAfter: newQty.toFixed(2),
      referenceDoc: `Physical Audit #${voucherNo}`,
      narration: reason || 'Physical stock audit adjustment',
    });

    await logAudit('POST', 'STOCK', voucherNo, `Stock adjustment for ${prod.name}: ${movType} ${qty} ${prod.uom}`);

    res.json({
      success: true,
      voucherNo,
      newQuantity: newQty,
      uom: prod.uom,
      movementType: movType,
      totalValuation: newValuation,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Immutable Stock Movement Reversal (Append-only correction with reference to original entry)
app.post('/api/stock/ledger/reverse', async (req: Request, res: Response) => {
  try {
    const { ledgerId, reason, authorizedBy = 'Mr. Sushil Goyal' } = req.body;
    if (!ledgerId || !reason) {
      return res.status(400).json({ error: 'Ledger entry ID and correction reason are required' });
    }

    const [orig] = await db.select().from(stockLedger).where(eq(stockLedger.id, Number(ledgerId)));
    if (!orig) return res.status(404).json({ error: 'Original stock ledger entry not found' });

    const qty = Number(orig.quantity);
    const existingBalanceList = await db
      .select()
      .from(stockBalances)
      .where(sql`${stockBalances.warehouseId} = ${orig.warehouseId} AND ${stockBalances.productId} = ${orig.productId}`);

    const currentQty = existingBalanceList.length > 0 ? Number(existingBalanceList[0].quantity) : 0;
    const revMovType = orig.movementType === 'IN' ? 'OUT' : 'IN';
    let newQty = currentQty;

    if (revMovType === 'OUT') {
      if (currentQty < qty) {
        return res.status(400).json({
          error: `Cannot reverse inward entry! Current stock (${currentQty}) is lower than reversal amount (${qty}). Negative stock prevented.`,
        });
      }
      newQty = currentQty - qty;
    } else {
      newQty = currentQty + qty;
    }

    const unitCost = Number(orig.unitCost) || 500;
    const newValuation = (newQty * unitCost).toFixed(2);
    const revVoucherNo = `REV-${orig.voucherNo}`;

    // Update Balance
    if (existingBalanceList.length > 0) {
      await db.update(stockBalances).set({
        quantity: newQty.toFixed(2),
        availableQuantity: newQty.toFixed(2),
        totalValuation: newValuation,
        lastUpdated: new Date(),
      }).where(eq(stockBalances.id, existingBalanceList[0].id));
    }

    // Insert Reversal Ledger Entry (Immutable Append-Only)
    const [revEntry] = await db.insert(stockLedger).values({
      companyId: orig.companyId,
      warehouseId: orig.warehouseId,
      productId: orig.productId,
      skuId: orig.skuId,
      voucherType: 'REVERSAL',
      voucherNo: revVoucherNo,
      movementType: revMovType,
      quantity: qty.toFixed(2),
      unitCost: orig.unitCost,
      totalValue: orig.totalValue,
      balanceAfter: newQty.toFixed(2),
      referenceDoc: `Reversal of #${orig.voucherNo}`,
      narration: `Correction Reversal: ${reason} (Authorized by ${authorizedBy})`,
    }).returning();

    await logAudit('REVERSAL', 'STOCK_LEDGER', String(revEntry.id), `Reversed stock movement #${orig.voucherNo}: ${revMovType} ${qty}`);

    res.json({
      success: true,
      message: `Stock movement #${orig.voucherNo} reversed successfully`,
      reversalEntry: revEntry,
      newQuantity: newQty,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Parties (Suppliers & Customers)
app.get('/api/parties', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(parties).orderBy(parties.code);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/parties', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const { partyType, code, legalName, tradeName, gstin, pan, stateCode, stateName, email, phone, billingAddress, creditLimit, creditDays } = req.body;

    const [newParty] = await db.insert(parties).values({
      companyId,
      partyType: partyType || 'CUSTOMER',
      code,
      legalName,
      tradeName,
      gstin,
      pan,
      stateCode: stateCode || '08',
      stateName: stateName || 'Rajasthan',
      email,
      phone,
      billingAddress,
      creditLimit: creditLimit ? String(creditLimit) : '0.00',
      creditDays: creditDays ? Number(creditDays) : 30,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'PARTY', String(newParty.id), `Added party ${newParty.code} - ${newParty.legalName} (${newParty.partyType})`);
    res.status(201).json(newParty);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/parties/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { partyType, code, legalName, tradeName, gstin, pan, stateCode, stateName, email, phone, billingAddress, creditLimit, creditDays, isActive } = req.body;

    const [updated] = await db
      .update(parties)
      .set({
        partyType: partyType || undefined,
        code: code || undefined,
        legalName: legalName || undefined,
        tradeName: tradeName || undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        pan: pan !== undefined ? pan : undefined,
        stateCode: stateCode || undefined,
        stateName: stateName || undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        billingAddress: billingAddress !== undefined ? billingAddress : undefined,
        creditLimit: creditLimit !== undefined ? String(creditLimit) : undefined,
        creditDays: creditDays !== undefined ? Number(creditDays) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(parties.id, id))
      .returning();

    await logAudit('UPDATE', 'PARTY', String(id), `Updated party ${updated?.code || id} (${updated?.legalName})`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/parties/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(parties).where(eq(parties.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Party not found' });
    }

    const linkedOrders = await db.select().from(purchaseOrders).where(eq(purchaseOrders.supplierId, id)).limit(1);
    if (linkedOrders.length > 0) {
      await db.update(parties).set({ isActive: false }).where(eq(parties.id, id));
      await logAudit('DEACTIVATE', 'PARTY', String(id), `Deactivated party ${existing.code} due to existing purchase orders`);
      return res.json({ success: true, message: `Party ${existing.legalName} has historical orders and was marked INACTIVE` });
    }

    await db.delete(parties).where(eq(parties.id, id));
    await logAudit('DELETE', 'PARTY', String(id), `Deleted commercial party ${existing.code}`);
    res.json({ success: true, message: `Party ${existing.legalName} deleted permanently` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Executive Dashboard Stats
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    const allBalances = await db.select().from(stockBalances);
    const allWarehouses = await db.select().from(warehouses);
    const allBranches = await db.select().from(branches);
    const allLedger = await db.select().from(stockLedger);
    const allParties = await db.select().from(parties);

    // Calculate valuations
    let totalStockValuation = 0;
    let fgStockValuation = 0;
    let rmStockValuation = 0;
    let lowStockCount = 0;

    const prodMap = new Map(allProducts.map(p => [p.id, p]));

    for (const b of allBalances) {
      const val = Number(b.totalValuation || 0);
      totalStockValuation += val;

      const p = prodMap.get(b.productId);
      if (p?.itemType === 'FINISHED_GOOD') {
        fgStockValuation += val;
      } else {
        rmStockValuation += val;
      }
    }

    for (const p of allProducts) {
      const pBalances = allBalances.filter(b => b.productId === p.id);
      const totalQty = pBalances.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
      if (totalQty <= (p.reorderPoint || 100)) {
        lowStockCount++;
      }
    }

    res.json({
      totalProducts: allProducts.length,
      finishedGoodsCount: allProducts.filter(p => p.itemType === 'FINISHED_GOOD').length,
      rawMaterialsCount: allProducts.filter(p => p.itemType === 'RAW_MATERIAL').length,
      activeBranches: allBranches.length,
      activeWarehouses: allWarehouses.length,
      totalCustomers: allParties.filter(p => p.partyType === 'CUSTOMER' || p.partyType === 'BOTH').length,
      totalSuppliers: allParties.filter(p => p.partyType === 'SUPPLIER' || p.partyType === 'BOTH').length,
      totalStockValuation,
      fgStockValuation,
      rmStockValuation,
      lowStockCount,
      totalStockMovements: allLedger.length,
      todayProductionUnits: 680,
      todayDispatchedUnits: 410,
      pendingApprovalsCount: 3,
      qualityPassRate: 99.4,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 1. PRODUCT COLORS & COLOR-WISE SKU MASTER
// ==========================================

app.get('/api/colors', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(productColors).orderBy(productColors.name);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/colors', async (req: Request, res: Response) => {
  try {
    const { code, name, hexCode } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Color code and name required' });
    const [color] = await db.insert(productColors).values({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      hexCode: hexCode || '#18181B',
    }).returning();
    res.status(201).json(color);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/skus', async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    let list;
    if (productId) {
      list = await db.select().from(productSkus).where(eq(productSkus.productId, Number(productId))).orderBy(productSkus.skuCode);
    } else {
      list = await db.select().from(productSkus).orderBy(productSkus.skuCode);
    }
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/skus', async (req: Request, res: Response) => {
  try {
    const {
      productId,
      colorId,
      skuCode,
      colorName,
      barcode,
      qrCode,
      purchaseRate,
      sellingRate,
      mrp,
      stockQuantity,
      minStockLevel,
      weightKg,
      imageUrl,
    } = req.body;

    if (!productId || !skuCode || !colorName) {
      return res.status(400).json({ error: 'Product ID, SKU code, and Color Name are mandatory' });
    }

    const generatedBarcode = barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const generatedQr = qrCode || `QR-${skuCode}`;

    const [sku] = await db.insert(productSkus).values({
      productId: Number(productId),
      colorId: colorId ? Number(colorId) : null,
      skuCode: skuCode.toUpperCase().trim(),
      colorName,
      barcode: generatedBarcode,
      qrCode: generatedQr,
      purchaseRate: purchaseRate ? String(purchaseRate) : '0.00',
      sellingRate: sellingRate ? String(sellingRate) : '0.00',
      mrp: mrp ? String(mrp) : '0.00',
      stockQuantity: stockQuantity ? String(stockQuantity) : '0.00',
      minStockLevel: minStockLevel ? Number(minStockLevel) : 20,
      weightKg: weightKg ? String(weightKg) : '0.000',
      imageUrl: imageUrl || null,
      status: 'ACTIVE',
    }).returning();

    await logAudit('CREATE', 'PRODUCT_SKU', String(sku.id), `Created SKU variant ${sku.skuCode} (${sku.colorName})`);
    res.status(201).json(sku);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skus/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stockQuantity, reason } = req.body;
    const [updated] = await db.update(productSkus)
      .set({ stockQuantity: String(stockQuantity) })
      .where(eq(productSkus.id, Number(id)))
      .returning();

    await logAudit('UPDATE', 'PRODUCT_SKU_STOCK', id, `Updated stock for ${updated.skuCode} to ${stockQuantity}: ${reason || 'Physical count adjustment'}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skus/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      skuCode,
      colorName,
      colorId,
      purchaseRate,
      sellingRate,
      mrp,
      stockQuantity,
      minStockLevel,
      weightKg,
      imageUrl,
      status,
      barcode,
      qrCode,
    } = req.body;

    const [updated] = await db
      .update(productSkus)
      .set({
        skuCode: skuCode ? String(skuCode).toUpperCase().trim() : undefined,
        colorName: colorName || undefined,
        colorId: colorId !== undefined ? (colorId ? Number(colorId) : null) : undefined,
        purchaseRate: purchaseRate !== undefined ? String(purchaseRate) : undefined,
        sellingRate: sellingRate !== undefined ? String(sellingRate) : undefined,
        mrp: mrp !== undefined ? String(mrp) : undefined,
        stockQuantity: stockQuantity !== undefined ? String(stockQuantity) : undefined,
        minStockLevel: minStockLevel !== undefined ? Number(minStockLevel) : undefined,
        weightKg: weightKg !== undefined ? String(weightKg) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        status: status || undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        qrCode: qrCode !== undefined ? qrCode : undefined,
      })
      .where(eq(productSkus.id, id))
      .returning();

    await logAudit('UPDATE', 'PRODUCT_SKU', String(id), `Updated SKU variant ${updated?.skuCode || id} (${updated?.colorName})`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/skus/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(productSkus).where(eq(productSkus.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'SKU not found' });
    }

    const relatedWorkOrders = await db.select().from(productionWorkOrders).where(eq(productionWorkOrders.skuId, id)).limit(1);
    const currentStock = Number(existing.stockQuantity || 0);

    if (relatedWorkOrders.length > 0 || currentStock > 0) {
      await db.update(productSkus).set({ status: 'INACTIVE' }).where(eq(productSkus.id, id));
      await logAudit('DEACTIVATE', 'PRODUCT_SKU', String(id), `Deactivated SKU ${existing.skuCode} due to stock (${currentStock}) or history`);
      return res.json({ success: true, message: `SKU ${existing.skuCode} marked INACTIVE (stock or history exists)` });
    }

    await db.delete(productSkus).where(eq(productSkus.id, id));
    await logAudit('DELETE', 'PRODUCT_SKU', String(id), `Deleted SKU variant ${existing.skuCode}`);
    res.json({ success: true, message: `SKU ${existing.skuCode} permanently deleted` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. CARTON-WISE PACKING & CBM CALCULATION
// ==========================================

app.get('/api/cartons', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(cartonPackings).orderBy(desc(cartonPackings.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cartons', async (req: Request, res: Response) => {
  try {
    const {
      productId,
      skuId,
      cartonNumber,
      cartonLengthCm,
      cartonWidthCm,
      cartonHeightCm,
      qtyPerCarton,
      numCartons = 1,
      grossWeightKg = 0,
      netWeightKg = 0,
      packingNotes,
    } = req.body;

    const length = Number(cartonLengthCm) || 0;
    const width = Number(cartonWidthCm) || 0;
    const height = Number(cartonHeightCm) || 0;
    const count = Number(numCartons) || 1;
    const qty = Number(qtyPerCarton) || 1;

    // Formula: (Length × Width × Height) / 1,000,000 = CBM per carton
    const cbmPerCarton = (length * width * height) / 1000000;
    const totalCbm = cbmPerCarton * count;

    const [record] = await db.insert(cartonPackings).values({
      productId: Number(productId),
      skuId: skuId ? Number(skuId) : null,
      cartonNumber: cartonNumber || `CTN-${Date.now().toString().slice(-6)}`,
      cartonLengthCm: String(length),
      cartonWidthCm: String(width),
      cartonHeightCm: String(height),
      qtyPerCarton: qty,
      numCartons: count,
      grossWeightKg: String(grossWeightKg),
      netWeightKg: String(netWeightKg),
      cbmPerCarton: cbmPerCarton.toFixed(6),
      totalCbm: totalCbm.toFixed(6),
      packingNotes,
    }).returning();

    await logAudit('CREATE', 'CARTON_PACKING', String(record.id), `Added carton packing spec ${record.cartonNumber} - CBM: ${totalCbm.toFixed(4)} m³`);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cartons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(cartonPackings).where(eq(cartonPackings.id, Number(id)));
    res.json({ success: true, message: 'Carton specification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. UNIVERSAL ATTACHMENTS & DOCUMENT REPO
// ==========================================

app.get('/api/attachments/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const list = await db.select().from(attachments)
      .where(sql`${attachments.entityType} = ${entityType} AND ${attachments.entityId} = ${entityId}`)
      .orderBy(desc(attachments.uploadedAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attachments', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, fileType = 'IMAGE', fileName, fileUrl, categoryTag, uploadedBy = 'Mr. Sushil Goyal' } = req.body;
    if (!entityType || !entityId || !fileUrl || !fileName) {
      return res.status(400).json({ error: 'Missing required attachment parameters' });
    }

    const [doc] = await db.insert(attachments).values({
      entityType,
      entityId: String(entityId),
      fileType,
      fileName,
      fileUrl,
      categoryTag: categoryTag || 'GENERAL',
      uploadedBy,
    }).returning();

    await logAudit('UPLOAD', 'ATTACHMENT', String(doc.id), `Uploaded ${doc.fileType} for ${entityType} #${entityId}: ${fileName}`);
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. CRM & SALES PIPELINE (QUOTATION -> PI -> ADVANCE -> SALES ORDER)
// ==========================================

app.get('/api/crm/leads', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(crmLeads).orderBy(desc(crmLeads.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crm/leads', async (req: Request, res: Response) => {
  try {
    const { customerName, companyName, phone, email, city, state, source, expectedValue, notes, assignedExecutive } = req.body;
    if (!customerName || !phone) return res.status(400).json({ error: 'Customer name and phone required' });

    const [lead] = await db.insert(crmLeads).values({
      customerName,
      companyName,
      phone,
      email,
      city: city || 'Jaipur',
      state: state || 'Rajasthan',
      source: source || 'Direct Inquiry',
      status: 'NEW',
      assignedExecutive: assignedExecutive || 'Mr. Sushil Goyal',
      expectedValue: expectedValue ? String(expectedValue) : '0.00',
      notes,
    }).returning();

    await logAudit('CREATE', 'CRM_LEAD', String(lead.id), `New lead added: ${lead.customerName} (${lead.companyName || 'Retail'})`);
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/crm/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedExecutive } = req.body;
    const [lead] = await db.update(crmLeads)
      .set({
        status,
        notes,
        assignedExecutive,
        updatedAt: new Date(),
      })
      .where(eq(crmLeads.id, Number(id)))
      .returning();
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crm/communications/:leadId', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const list = await db.select().from(crmCommunications)
      .where(eq(crmCommunications.leadId, Number(leadId)))
      .orderBy(desc(crmCommunications.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crm/communications', async (req: Request, res: Response) => {
  try {
    const { leadId, partyId, channel, summary, scheduledFollowUp, loggedBy = 'Mr. Sushil Goyal' } = req.body;
    const [comm] = await db.insert(crmCommunications).values({
      leadId: leadId ? Number(leadId) : null,
      partyId: partyId ? Number(partyId) : null,
      channel,
      summary,
      scheduledFollowUp,
      loggedBy,
    }).returning();
    res.status(201).json(comm);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quotations
app.get('/api/sales/quotations', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(salesQuotations).orderBy(desc(salesQuotations.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales/quotations', async (req: Request, res: Response) => {
  try {
    const { partyId, customerName, customerPhone, customerEmail, validUntil, subtotal, taxAmount, freight, discount, grandTotal, itemsJson, notes } = req.body;
    const quotationNo = `QTN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [qtn] = await db.insert(salesQuotations).values({
      quotationNo,
      partyId: partyId ? Number(partyId) : null,
      customerName,
      customerPhone,
      customerEmail,
      validUntil,
      subtotal: String(subtotal || '0.00'),
      taxAmount: String(taxAmount || '0.00'),
      freight: String(freight || '0.00'),
      discount: String(discount || '0.00'),
      grandTotal: String(grandTotal || '0.00'),
      itemsJson: typeof itemsJson === 'string' ? itemsJson : JSON.stringify(itemsJson),
      notes,
      status: 'SENT',
    }).returning();

    await logAudit('CREATE', 'SALES_QUOTATION', String(qtn.id), `Generated Quotation ${qtn.quotationNo} for ₹${qtn.grandTotal}`);
    res.status(201).json(qtn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Convert Quotation -> Proforma Invoice (PI with 30% advance request & payment link)
app.post('/api/sales/quotations/:id/convert-to-pi', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [qtn] = await db.select().from(salesQuotations).where(eq(salesQuotations.id, Number(id)));
    if (!qtn) return res.status(404).json({ error: 'Quotation not found' });

    const piNo = `PI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Number(qtn.grandTotal);
    const advancePercent = 30.0;
    const advanceRequired = (total * advancePercent) / 100;
    const balanceAmount = total - advanceRequired;

    // UPI Payment Intent
    const upiLink = `upi://pay?pa=electromaxglobal@sbi&pn=ElectromaxGlobal&am=${advanceRequired.toFixed(2)}&cu=INR&tn=AdvancePI_${piNo}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const [pi] = await db.insert(proformaInvoices).values({
      piNo,
      quotationId: qtn.id,
      partyId: qtn.partyId,
      customerName: qtn.customerName,
      totalAmount: String(total),
      advancePercent: String(advancePercent),
      advanceRequired: advanceRequired.toFixed(2),
      advanceReceived: '0.00',
      balanceAmount: balanceAmount.toFixed(2),
      paymentLink: upiLink,
      qrCodeUrl,
      paymentStatus: 'PENDING',
      bankDetails: 'State Bank of India, VKI Jaipur Current A/c 38920192847, IFSC: SBIN0004128',
      itemsJson: qtn.itemsJson,
    }).returning();

    await db.update(salesQuotations).set({ status: 'CONVERTED' }).where(eq(salesQuotations.id, qtn.id));
    await logAudit('CONVERT', 'SALES_QUOTATION_TO_PI', String(pi.id), `Generated PI ${pi.piNo} requiring ₹${pi.advanceRequired} (30% Advance)`);
    res.status(201).json(pi);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proforma Invoices
app.get('/api/sales/proforma-invoices', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(proformaInvoices).orderBy(desc(proformaInvoices.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify 30% Advance Payment & Generate Sales Order Automatically
app.post('/api/sales/proforma-invoices/:id/verify-advance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentRef, amountReceived } = req.body;
    const [pi] = await db.select().from(proformaInvoices).where(eq(proformaInvoices.id, Number(id)));
    if (!pi) return res.status(404).json({ error: 'PI not found' });

    const received = amountReceived ? String(amountReceived) : pi.advanceRequired;

    // 1. Update PI to PAID
    const [updatedPi] = await db.update(proformaInvoices).set({
      advanceReceived: received,
      paymentStatus: 'ADVANCE_VERIFIED',
      paymentRef: paymentRef || `UTR-${Date.now().toString().slice(-8)}`,
      verifiedAt: new Date(),
    }).where(eq(proformaInvoices.id, pi.id)).returning();

    // 2. Automatically generate Sales Order with unique tracking token
    const orderNo = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingToken = `EMG-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const [salesOrder] = await db.insert(salesOrders).values({
      orderNo,
      piId: pi.id,
      partyId: pi.partyId,
      customerName: pi.customerName,
      customerPhone: '',
      totalAmount: pi.totalAmount,
      advancePaid: received,
      status: 'CONFIRMED',
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      itemsJson: pi.itemsJson,
      trackingToken,
    }).returning();

    await logAudit('VERIFY', 'ADVANCE_PAYMENT', String(salesOrder.id), `Advance payment verified for PI ${pi.piNo}. Auto-created Sales Order ${salesOrder.orderNo} with tracking token ${trackingToken}`);

    res.json({
      proformaInvoice: updatedPi,
      salesOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Orders
app.get('/api/sales/orders', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales/orders', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, totalAmount, advancePaid, itemsJson, expectedDeliveryDate } = req.body;
    const orderNo = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingToken = `EMG-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const [order] = await db.insert(salesOrders).values({
      orderNo,
      customerName,
      customerPhone,
      totalAmount: String(totalAmount || '0.00'),
      advancePaid: String(advancePaid || '0.00'),
      status: 'CONFIRMED',
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      itemsJson: typeof itemsJson === 'string' ? itemsJson : JSON.stringify(itemsJson),
      trackingToken,
    }).returning();

    await logAudit('CREATE', 'SALES_ORDER', String(order.id), `Manual Sales Order created: ${order.orderNo}`);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. PRODUCTION MANAGEMENT (COLOR BOM & 9-STAGE WORK ORDERS)
// ==========================================

app.get('/api/production/work-orders', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(productionWorkOrders).orderBy(desc(productionWorkOrders.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/production/work-orders', async (req: Request, res: Response) => {
  try {
    const { productId, skuId, salesOrderId, colorName, plannedQty, productionLine, assignedLead, startDate, notes } = req.body;
    const workOrderNo = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [wo] = await db.insert(productionWorkOrders).values({
      workOrderNo,
      productId: Number(productId),
      skuId: skuId ? Number(skuId) : null,
      salesOrderId: salesOrderId ? Number(salesOrderId) : null,
      colorName: colorName || 'Standard',
      plannedQty: String(plannedQty),
      producedQty: '0.00',
      rejectedQty: '0.00',
      status: 'ORDER_RECEIVED',
      productionLine: productionLine || 'Line 1 - Heating & Assembly',
      assignedLead: assignedLead || 'Rajesh Meena',
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes,
    }).returning();

    await logAudit('CREATE', 'WORK_ORDER', String(wo.id), `Created Work Order ${wo.workOrderNo} for ${plannedQty} units (${colorName})`);
    res.status(201).json(wo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Advance 9-Stage Production Tracking
app.put('/api/production/work-orders/:id/stage', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, producedQty, rejectedQty, stagePhotoUrl, notes } = req.body;

    const updatePayload: any = { status: stage };
    if (producedQty !== undefined) updatePayload.producedQty = String(producedQty);
    if (rejectedQty !== undefined) updatePayload.rejectedQty = String(rejectedQty);
    if (stage === 'PACKED_READY_FOR_DISPATCH') {
      updatePayload.completionDate = new Date().toISOString().split('T')[0];
    }

    const [wo] = await db.update(productionWorkOrders)
      .set(updatePayload)
      .where(eq(productionWorkOrders.id, Number(id)))
      .returning();

    if (stagePhotoUrl) {
      await db.insert(attachments).values({
        entityType: 'WORK_ORDER_STAGE',
        entityId: String(wo.id),
        fileType: 'IMAGE',
        fileName: `Stage_${stage}_Verification.jpg`,
        fileUrl: stagePhotoUrl,
        categoryTag: stage,
        uploadedBy: 'Quality Inspector',
      });
    }

    await logAudit('UPDATE_STAGE', 'WORK_ORDER', String(wo.id), `Work Order ${wo.workOrderNo} advanced to stage: ${stage}`);
    res.json(wo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/production/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { plannedQty, producedQty, rejectedQty, productionLine, assignedLead, startDate, completionDate, notes, status } = req.body;

    const [updated] = await db
      .update(productionWorkOrders)
      .set({
        plannedQty: plannedQty !== undefined ? String(plannedQty) : undefined,
        producedQty: producedQty !== undefined ? String(producedQty) : undefined,
        rejectedQty: rejectedQty !== undefined ? String(rejectedQty) : undefined,
        productionLine: productionLine || undefined,
        assignedLead: assignedLead || undefined,
        startDate: startDate || undefined,
        completionDate: completionDate || undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status || undefined,
      })
      .where(eq(productionWorkOrders.id, id))
      .returning();

    await logAudit('UPDATE', 'WORK_ORDER', String(id), `Updated work order ${updated?.workOrderNo || id} parameters`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/production/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(productionWorkOrders).where(eq(productionWorkOrders.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    if (Number(existing.producedQty || 0) > 0) {
      await db.update(productionWorkOrders).set({ status: 'CANCELLED' }).where(eq(productionWorkOrders.id, id));
      await logAudit('CANCEL', 'WORK_ORDER', String(id), `Cancelled work order ${existing.workOrderNo} with ${existing.producedQty} units produced`);
      return res.json({ success: true, message: `Work order ${existing.workOrderNo} had progress and was marked CANCELLED` });
    }

    await db.delete(productionWorkOrders).where(eq(productionWorkOrders.id, id));
    await logAudit('DELETE', 'WORK_ORDER', String(id), `Deleted work order ${existing.workOrderNo}`);
    res.json({ success: true, message: `Work order ${existing.workOrderNo} deleted permanently` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. PURCHASE ORDERS & GRN WITH INSPECTION PROOF
// ==========================================

app.get('/api/purchase/orders', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchase/orders', async (req: Request, res: Response) => {
  try {
    const { supplierId, supplierName, deliveryDate, paymentTerms, specialInstructions, subtotal, taxAmount, grandTotal, itemsJson } = req.body;
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [po] = await db.insert(purchaseOrders).values({
      poNumber,
      supplierId: supplierId ? Number(supplierId) : null,
      supplierName,
      deliveryDate,
      paymentTerms: paymentTerms || 'Net 30 Days',
      specialInstructions,
      subtotal: String(subtotal || '0.00'),
      taxAmount: String(taxAmount || '0.00'),
      grandTotal: String(grandTotal || '0.00'),
      itemsJson: typeof itemsJson === 'string' ? itemsJson : JSON.stringify(itemsJson),
      status: 'APPROVED',
    }).returning();

    await logAudit('CREATE', 'PURCHASE_ORDER', String(po.id), `Created PO ${po.poNumber} for ${po.supplierName}`);
    res.status(201).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchase/grn', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(grns).orderBy(desc(grns.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchase/grn', async (req: Request, res: Response) => {
  try {
    const { poId, supplierName, receivedQty, acceptedQty, rejectedQty, shortageQty, challanNumber, inspectionNotes, inspectionPhotoUrl } = req.body;
    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [grn] = await db.insert(grns).values({
      grnNumber,
      poId: poId ? Number(poId) : null,
      supplierName,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedQty: String(receivedQty),
      acceptedQty: String(acceptedQty),
      rejectedQty: String(rejectedQty || '0.00'),
      shortageQty: String(shortageQty || '0.00'),
      challanNumber,
      inspectionNotes,
      status: Number(rejectedQty) > 0 ? 'PARTIALLY_ACCEPTED' : 'ACCEPTED',
    }).returning();

    if (inspectionPhotoUrl) {
      await db.insert(attachments).values({
        entityType: 'GRN_PROOF',
        entityId: String(grn.id),
        fileType: 'IMAGE',
        fileName: `GRN_${grn.grnNumber}_Inspection.jpg`,
        fileUrl: inspectionPhotoUrl,
        categoryTag: 'QUALITY_INSPECTION',
        uploadedBy: 'Store Supervisor',
      });
    }

    await logAudit('CREATE', 'GRN', String(grn.id), `Inward Material GRN ${grn.grnNumber} generated for ${receivedQty} units`);
    res.status(201).json(grn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/purchase/orders/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      supplierId,
      supplierName,
      deliveryDate,
      paymentTerms,
      specialInstructions,
      subtotal,
      taxAmount,
      grandTotal,
      itemsJson,
      status,
    } = req.body;

    const [updated] = await db
      .update(purchaseOrders)
      .set({
        supplierId: supplierId !== undefined ? (supplierId ? Number(supplierId) : null) : undefined,
        supplierName: supplierName || undefined,
        deliveryDate: deliveryDate !== undefined ? deliveryDate : undefined,
        paymentTerms: paymentTerms !== undefined ? paymentTerms : undefined,
        specialInstructions: specialInstructions !== undefined ? specialInstructions : undefined,
        subtotal: subtotal !== undefined ? String(subtotal) : undefined,
        taxAmount: taxAmount !== undefined ? String(taxAmount) : undefined,
        grandTotal: grandTotal !== undefined ? String(grandTotal) : undefined,
        itemsJson: itemsJson !== undefined ? (typeof itemsJson === 'string' ? itemsJson : JSON.stringify(itemsJson)) : undefined,
        status: status || undefined,
      })
      .where(eq(purchaseOrders.id, id))
      .returning();

    await logAudit('UPDATE', 'PURCHASE_ORDER', String(id), `Updated PO #${updated?.poNumber || id} details and line items`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/purchase/orders/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    const linkedGrns = await db.select().from(grns).where(eq(grns.poId, id)).limit(1);
    if (linkedGrns.length > 0) {
      await db.update(purchaseOrders).set({ status: 'CANCELLED' }).where(eq(purchaseOrders.id, id));
      await logAudit('CANCEL', 'PURCHASE_ORDER', String(id), `Cancelled PO #${existing.poNumber} because GRN records exist`);
      return res.json({ success: true, message: `PO #${existing.poNumber} has linked GRN goods inward records and was marked CANCELLED` });
    }

    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    await logAudit('DELETE', 'PURCHASE_ORDER', String(id), `Permanently deleted PO #${existing.poNumber}`);
    res.json({ success: true, message: `Purchase Order #${existing.poNumber} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/purchase/grn/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      receivedQty,
      acceptedQty,
      rejectedQty,
      shortageQty,
      challanNumber,
      inspectionNotes,
      status,
    } = req.body;

    const [updated] = await db
      .update(grns)
      .set({
        receivedQty: receivedQty !== undefined ? String(receivedQty) : undefined,
        acceptedQty: acceptedQty !== undefined ? String(acceptedQty) : undefined,
        rejectedQty: rejectedQty !== undefined ? String(rejectedQty) : undefined,
        shortageQty: shortageQty !== undefined ? String(shortageQty) : undefined,
        challanNumber: challanNumber !== undefined ? challanNumber : undefined,
        inspectionNotes: inspectionNotes !== undefined ? inspectionNotes : undefined,
        status: status || undefined,
      })
      .where(eq(grns.id, id))
      .returning();

    await logAudit('UPDATE', 'GRN', String(id), `Updated GRN #${updated?.grnNumber || id} inspection counts`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/purchase/grn/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(grns).where(eq(grns.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'GRN record not found' });
    }

    await db.delete(grns).where(eq(grns.id, id));
    await logAudit('DELETE', 'GRN', String(id), `Deleted Goods Receipt Note #${existing.grnNumber}`);
    res.json({ success: true, message: `GRN #${existing.grnNumber} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. MULTI-TYPE CHALLAN GENERATOR
// ==========================================

app.get('/api/challans', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(challans).orderBy(desc(challans.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/challans', async (req: Request, res: Response) => {
  try {
    const {
      challanType,
      recipientName,
      destination,
      deliveryAddress,
      vehicleNo,
      driverName,
      driverPhone,
      gstin,
      refNo,
      salesOrderNo,
      purchaseOrderNo,
      warehouseId,
      transporterName,
      itemsSummary,
      remarks,
      authorizedBy = 'Mr. Sushil Goyal',
      items = [],
      gatePassPhoto,
    } = req.body;

    const prefix = challanType === 'MATERIAL_ISSUE' ? 'MIC' : challanType === 'TRANSFER' || challanType === 'STOCK_TRANSFER' ? 'STC' : challanType === 'JOB_WORK' ? 'JWC' : 'DC';
    const challanNo = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const summaryText = items && items.length > 0
      ? JSON.stringify(items)
      : (itemsSummary || 'Goods movement under Electromax Global ERP');

    const [ch] = await db.insert(challans).values({
      challanNo,
      challanType,
      recipientName,
      destination: deliveryAddress || destination || 'Rajasthan, India',
      vehicleNo,
      driverName,
      itemsSummary: summaryText,
      authorizedBy,
      remarks,
    }).returning();

    // Auto-update Stock and Append Immutable Stock Ledger if items & warehouseId are provided
    if (warehouseId && Array.isArray(items) && items.length > 0) {
      const companyList = await db.select().from(companies).limit(1);
      const companyId = companyList[0]?.id || 1;

      const isOutward = ['DELIVERY', 'STOCK_TRANSFER', 'MATERIAL_ISSUE', 'JOB_WORK', 'CONSIGNMENT'].includes(challanType);
      const isInward = ['GOODS_RECEIPT', 'MATERIAL_RETURN', 'SALES_RETURN'].includes(challanType);

      for (const it of items) {
        if (!it.productId || !it.quantity || Number(it.quantity) <= 0) continue;
        const pId = Number(it.productId);
        const qty = Number(it.quantity);

        const [prod] = await db.select().from(products).where(eq(products.id, pId));
        const unitCost = Number(prod?.standardCost) || 500;

        const balanceList = await db
          .select()
          .from(stockBalances)
          .where(sql`${stockBalances.warehouseId} = ${Number(warehouseId)} AND ${stockBalances.productId} = ${pId}`);

        const currentQty = balanceList.length > 0 ? Number(balanceList[0].quantity) : 0;
        let newQty = currentQty;
        const movType = isInward ? 'IN' : 'OUT';

        if (isOutward) {
          if (currentQty < qty) {
            return res.status(400).json({
              error: `Insufficient stock for ${it.productName || prod?.name || pId}! Available: ${currentQty}, Required: ${qty}. Negative stock blocked.`,
            });
          }
          newQty = currentQty - qty;
        } else if (isInward) {
          newQty = currentQty + qty;
        }

        const newValuation = (newQty * unitCost).toFixed(2);

        if (balanceList.length > 0) {
          await db.update(stockBalances).set({
            quantity: newQty.toFixed(2),
            availableQuantity: newQty.toFixed(2),
            totalValuation: newValuation,
            lastUpdated: new Date(),
          }).where(eq(stockBalances.id, balanceList[0].id));
        } else if (isInward) {
          await db.insert(stockBalances).values({
            warehouseId: Number(warehouseId),
            productId: pId,
            quantity: newQty.toFixed(2),
            reservedQuantity: '0.00',
            availableQuantity: newQty.toFixed(2),
            averageCost: unitCost.toFixed(2),
            totalValuation: newValuation,
          });
        }

        // Immutable Stock Movement Ledger entry
        await db.insert(stockLedger).values({
          companyId,
          warehouseId: Number(warehouseId),
          productId: pId,
          voucherType: `CHALLAN_${challanType}`,
          voucherNo: challanNo,
          movementType: movType,
          quantity: qty.toFixed(2),
          unitCost: unitCost.toFixed(2),
          totalValue: (qty * unitCost).toFixed(2),
          balanceAfter: newQty.toFixed(2),
          referenceDoc: `Challan #${challanNo} (${challanType})`,
          narration: `${challanType} to ${recipientName} via ${vehicleNo || 'Self'}`,
        });
      }
    }

    if (gatePassPhoto) {
      await db.insert(attachments).values({
        entityType: 'CHALLAN_GATEPASS',
        entityId: String(ch.id),
        fileType: 'IMAGE',
        fileName: `GatePass_${challanNo}.jpg`,
        fileUrl: gatePassPhoto,
        categoryTag: 'GATEPASS_PROOF',
        uploadedBy: authorizedBy,
      });
    }

    await logAudit('CREATE', 'CHALLAN', String(ch.id), `Issued ${ch.challanType} Challan: ${ch.challanNo}`);
    res.status(201).json(ch);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/challans/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { recipientName, destination, vehicleNo, driverName, remarks, authorizedBy } = req.body;

    const [updated] = await db
      .update(challans)
      .set({
        recipientName: recipientName || undefined,
        destination: destination || undefined,
        vehicleNo: vehicleNo !== undefined ? vehicleNo : undefined,
        driverName: driverName !== undefined ? driverName : undefined,
        remarks: remarks !== undefined ? remarks : undefined,
        authorizedBy: authorizedBy || undefined,
      })
      .where(eq(challans.id, id))
      .returning();

    await logAudit('UPDATE', 'CHALLAN', String(id), `Updated challan ${updated?.challanNo || id}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/challans/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(challans).where(eq(challans.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    await db.delete(challans).where(eq(challans.id, id));
    await logAudit('DELETE', 'CHALLAN', String(id), `Deleted challan ${existing.challanNo}`);
    res.json({ success: true, message: `Challan ${existing.challanNo} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. DISPATCH & BILTY/LR LOGISTICS + PUBLIC TRACKING PORTAL
// ==========================================

app.get('/api/dispatches', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(dispatches).orderBy(desc(dispatches.createdAt));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dispatches', async (req: Request, res: Response) => {
  try {
    const {
      salesOrderId,
      salesOrderNo,
      invoiceNumber,
      customerName,
      customerCode,
      destination,
      warehouseId,
      transporterName,
      vehicleNo,
      driverName,
      driverPhone,
      dispatchType = 'DIRECT_SALE',
      cartonCount,
      totalWeightKg,
      totalCbm,
      freightCharges,
      ewayBillNo,
      biltyNo,
      vehiclePhotoUrl,
      vehicleFrontPhoto,
      vehiclePlatePhoto,
      vehicleSidePhoto,
      goodsPhoto,
      cartonPhoto,
      loadingPhotoUrl,
      loadingPhoto,
      finalLoadedVehiclePhoto,
      loadingStartTime,
      loadingCompletionTime,
      loadingSupervisor,
      gateOutwardTime,
      gatePassNumber,
      remarks,
      items = [],
    } = req.body;

    const dispatchNo = `DSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingToken = `EMG-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const [dsp] = await db.insert(dispatches).values({
      dispatchNo,
      salesOrderId: salesOrderId ? Number(salesOrderId) : null,
      customerName: customerCode ? `${customerName} (${customerCode})` : customerName,
      destination,
      transporterName,
      vehicleNo,
      driverName,
      driverPhone,
      cartonCount: Number(cartonCount) || 1,
      totalWeightKg: String(totalWeightKg || '0.00'),
      totalCbm: String(totalCbm || '0.000000'),
      freightCharges: String(freightCharges || '0.00'),
      ewayBillNo,
      biltyNo,
      trackingToken,
      status: 'DISPATCHED',
      dispatchDate: new Date().toISOString().split('T')[0],
    }).returning();

    // Deduct stock from stockBalances and write immutable stock ledger entries
    if (warehouseId && Array.isArray(items) && items.length > 0) {
      const companyList = await db.select().from(companies).limit(1);
      const companyId = companyList[0]?.id || 1;

      for (const it of items) {
        if (!it.productId || !it.quantity || Number(it.quantity) <= 0) continue;
        const pId = Number(it.productId);
        const qty = Number(it.quantity);

        const [prod] = await db.select().from(products).where(eq(products.id, pId));
        const unitCost = Number(prod?.standardCost) || 500;

        const balanceList = await db
          .select()
          .from(stockBalances)
          .where(sql`${stockBalances.warehouseId} = ${Number(warehouseId)} AND ${stockBalances.productId} = ${pId}`);

        const currentQty = balanceList.length > 0 ? Number(balanceList[0].quantity) : 0;
        if (currentQty < qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${it.productName || prod?.name || pId}! Available: ${currentQty}, Required: ${qty}. Negative stock blocked.`,
          });
        }

        const newQty = currentQty - qty;
        const newValuation = (newQty * unitCost).toFixed(2);

        if (balanceList.length > 0) {
          await db.update(stockBalances).set({
            quantity: newQty.toFixed(2),
            availableQuantity: newQty.toFixed(2),
            totalValuation: newValuation,
            lastUpdated: new Date(),
          }).where(eq(stockBalances.id, balanceList[0].id));
        }

        // Immutable Stock Movement Ledger
        await db.insert(stockLedger).values({
          companyId,
          warehouseId: Number(warehouseId),
          productId: pId,
          skuId: it.skuId ? Number(it.skuId) : null,
          voucherType: 'SALES_DISPATCH',
          voucherNo: dispatchNo,
          movementType: 'OUT',
          quantity: qty.toFixed(2),
          unitCost: unitCost.toFixed(2),
          totalValue: (qty * unitCost).toFixed(2),
          balanceAfter: newQty.toFixed(2),
          referenceDoc: `Dispatch #${dispatchNo}${invoiceNumber ? ' / Inv #' + invoiceNumber : ''}`,
          narration: `Outward Dispatch to ${customerName} via ${vehicleNo} (${transporterName})`,
        });
      }
    }

    // Attach Vehicle Loading Photos
    const photosToAttach = [
      { url: vehicleFrontPhoto || vehiclePhotoUrl, tag: 'VEHICLE_FRONT', name: `Vehicle_Front_${vehicleNo}.jpg` },
      { url: vehiclePlatePhoto, tag: 'VEHICLE_PLATE', name: `Vehicle_Plate_${vehicleNo}.jpg` },
      { url: vehicleSidePhoto, tag: 'VEHICLE_SIDE', name: `Vehicle_Side_${vehicleNo}.jpg` },
      { url: goodsPhoto, tag: 'GOODS_PHOTO', name: `Goods_${dispatchNo}.jpg` },
      { url: cartonPhoto, tag: 'CARTON_PHOTO', name: `Cartons_${dispatchNo}.jpg` },
      { url: loadingPhoto || loadingPhotoUrl, tag: 'LOADING_PHOTO', name: `Loading_${dispatchNo}.jpg` },
      { url: finalLoadedVehiclePhoto, tag: 'LOADED_VEHICLE', name: `Loaded_Truck_${vehicleNo}.jpg` },
    ];

    for (const p of photosToAttach) {
      if (p.url) {
        await db.insert(attachments).values({
          entityType: 'DISPATCH_VEHICLE',
          entityId: String(dsp.id),
          fileType: 'IMAGE',
          fileName: p.name,
          fileUrl: p.url,
          categoryTag: p.tag,
          uploadedBy: loadingSupervisor || 'Dispatch Head',
        });
      }
    }

    await logAudit('DISPATCH', 'GOODS_OUTWARD', String(dsp.id), `Goods dispatched ${dsp.dispatchNo} via ${vehicleNo} (${transporterName}) with ${items.length} product(s)`);
    res.status(201).json(dsp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Upload Transporter Bilty / Lorry Receipt (LR)
app.post('/api/dispatches/:id/bilty', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transporterName, officialLrNumber, biltyDocumentUrl, cartonCount, weightKg, freightAmount, destinationCity } = req.body;

    const [bilty] = await db.insert(biltyRecords).values({
      dispatchId: Number(id),
      transporterName,
      officialLrNumber,
      biltyDocumentUrl,
      cartonCount: cartonCount ? Number(cartonCount) : null,
      weightKg: weightKg ? String(weightKg) : null,
      freightAmount: freightAmount ? String(freightAmount) : null,
      issueDate: new Date().toISOString().split('T')[0],
      destinationCity,
    }).returning();

    await db.update(dispatches).set({ biltyNo: officialLrNumber }).where(eq(dispatches.id, Number(id)));
    await logAudit('UPLOAD', 'BILTY_LR', String(bilty.id), `Uploaded Transporter Bilty/LR #${officialLrNumber} for Dispatch #${id}`);
    res.status(201).json(bilty);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dispatches/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { destination, transporterName, vehicleNo, driverName, driverPhone, cartonCount, totalWeightKg, freightCharges, ewayBillNo, status } = req.body;

    const [updated] = await db
      .update(dispatches)
      .set({
        destination: destination || undefined,
        transporterName: transporterName || undefined,
        vehicleNo: vehicleNo || undefined,
        driverName: driverName || undefined,
        driverPhone: driverPhone !== undefined ? driverPhone : undefined,
        cartonCount: cartonCount !== undefined ? Number(cartonCount) : undefined,
        totalWeightKg: totalWeightKg !== undefined ? String(totalWeightKg) : undefined,
        freightCharges: freightCharges !== undefined ? String(freightCharges) : undefined,
        ewayBillNo: ewayBillNo !== undefined ? ewayBillNo : undefined,
        status: status || undefined,
      })
      .where(eq(dispatches.id, id))
      .returning();

    await logAudit('UPDATE', 'DISPATCH', String(id), `Updated dispatch #${updated?.dispatchNo || id}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dispatches/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(dispatches).where(eq(dispatches.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    await db.delete(biltyRecords).where(eq(biltyRecords.dispatchId, id));
    await db.delete(dispatches).where(eq(dispatches.id, id));
    await logAudit('DELETE', 'DISPATCH', String(id), `Deleted dispatch #${existing.dispatchNo}`);
    res.json({ success: true, message: `Dispatch #${existing.dispatchNo} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public Customer Tracking Portal Endpoint
app.get('/api/public/track/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const [dsp] = await db.select().from(dispatches).where(eq(dispatches.trackingToken, token));
    if (!dsp) {
      // Check if it's a sales order token
      const [so] = await db.select().from(salesOrders).where(eq(salesOrders.trackingToken, token));
      if (!so) return res.status(404).json({ error: 'Invalid or expired tracking token' });

      return res.json({
        type: 'ORDER_IN_PRODUCTION',
        orderNo: so.orderNo,
        customerName: so.customerName,
        status: so.status,
        expectedDeliveryDate: so.expectedDeliveryDate,
        trackingToken: so.trackingToken,
      });
    }

    // Get bilty and attachments
    const biltyList = await db.select().from(biltyRecords).where(eq(biltyRecords.dispatchId, dsp.id));
    const photos = await db.select().from(attachments).where(sql`${attachments.entityId} = ${String(dsp.id)} AND ${attachments.entityType} LIKE 'DISPATCH%'`);

    res.json({
      type: 'DISPATCH_IN_TRANSIT',
      dispatch: dsp,
      bilty: biltyList[0] || null,
      photos,
      carrier: {
        company: 'Electromax Global Logistics',
        transporter: dsp.transporterName,
        vehicleNo: dsp.vehicleNo,
        driver: dsp.driverName,
        phone: dsp.driverPhone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. HRMS & BIOMETRIC ATTENDANCE
// ==========================================

app.get('/api/hrms/employees', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(employees).orderBy(employees.employeeCode);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hrms/employees', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, department, designation, salary, joiningDate, shift, photoUrl, reportingManager } = req.body;
    const employeeCode = `EMP-${Math.floor(100 + Math.random() * 900)}`;

    const [emp] = await db.insert(employees).values({
      employeeCode,
      fullName,
      email,
      phone,
      department,
      designation,
      reportingManager: reportingManager || 'Mr. Sushil Goyal',
      salary: salary ? String(salary) : '25000.00',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      shift: shift || 'General Office (09:30 - 18:00)',
      photoUrl,
      isActive: true,
    }).returning();

    await logAudit('CREATE', 'EMPLOYEE', String(emp.id), `Added employee ${emp.employeeCode}: ${emp.fullName}`);
    res.status(201).json(emp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hrms/attendance', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(attendanceRecords).orderBy(desc(attendanceRecords.date));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hrms/attendance/check-in', async (req: Request, res: Response) => {
  try {
    const { employeeId, checkInTime, checkOutTime, status = 'PRESENT', source = 'Biometric Terminal' } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const [att] = await db.insert(attendanceRecords).values({
      employeeId: Number(employeeId),
      date: today,
      checkInTime: checkInTime || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      checkOutTime,
      status,
      source,
    }).returning();

    res.status(201).json(att);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/hrms/employees/:id', async (req: Request, res: Response) => {
  try {
    const empId = Number(req.params.id);
    const { fullName, email, phone, department, designation, salary, joiningDate, shift, photoUrl, reportingManager, isActive } = req.body;

    const [updated] = await db.update(employees)
      .set({
        fullName,
        email,
        phone,
        department,
        designation,
        salary: salary ? String(salary) : undefined,
        joiningDate,
        shift,
        photoUrl,
        reportingManager,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(employees.id, empId))
      .returning();

    await logAudit('UPDATE', 'EMPLOYEE', String(empId), `Updated employee profile: ${fullName}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/hrms/employees/:id', async (req: Request, res: Response) => {
  try {
    const empId = Number(req.params.id);
    // Deactivate rather than hard delete if attendance exists
    const attList = await db.select().from(attendanceRecords).where(eq(attendanceRecords.employeeId, empId));
    if (attList.length > 0) {
      await db.update(employees).set({ isActive: false }).where(eq(employees.id, empId));
      await logAudit('DEACTIVATE', 'EMPLOYEE', String(empId), `Deactivated employee ID ${empId} due to attendance history`);
      return res.json({ success: true, message: 'Employee deactivated successfully (attendance records preserved).' });
    }

    await db.delete(employees).where(eq(employees.id, empId));
    await logAudit('DELETE', 'EMPLOYEE', String(empId), `Permanently removed employee record ID ${empId}`);
    res.json({ success: true, message: 'Employee deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hrms/attendance/check-out', async (req: Request, res: Response) => {
  try {
    const { recordId, checkOutTime, overtimeHours } = req.body;
    const timeOut = checkOutTime || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    const [updated] = await db.update(attendanceRecords)
      .set({
        checkOutTime: timeOut,
        overtimeHours: overtimeHours ? String(overtimeHours) : '0.0',
      })
      .where(eq(attendanceRecords.id, Number(recordId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 10. CLEAN SLATE RESET (BLANK ERP FOR LIVE ONBOARDING)
// ==========================================

app.post('/api/admin/clean-slate', async (req: Request, res: Response) => {
  try {
    const { resetScope = 'TRANSACTIONS_ONLY' } = req.body;

    // Purge transactional entities to allow pure blank onboarding while maintaining company setup
    await db.delete(biltyRecords);
    await db.delete(dispatches);
    await db.delete(challans);
    await db.delete(grns);
    await db.delete(purchaseOrders);
    await db.delete(productionWorkOrders);
    await db.delete(salesOrders);
    await db.delete(proformaInvoices);
    await db.delete(salesQuotations);
    await db.delete(crmCommunications);
    await db.delete(crmLeads);
    await db.delete(attachments);

    if (resetScope === 'FULL_BLANK') {
      await db.delete(cartonPackings);
      await db.delete(productSkus);
      await db.delete(stockLedger);
      await db.delete(stockBalances);
      await db.delete(products);
      await db.delete(parties);
      await db.delete(attendanceRecords);
      await db.delete(employees).where(sql`${employees.id} > 1`);
      await db.delete(users).where(sql`${users.id} > 1`);
    }

    await logAudit('RESET', 'ADMIN_CLEAN_SLATE', 'ALL', `Clean ERP reset performed (${resetScope}) by Mr. Sushil Goyal`);
    res.json({
      success: true,
      message: `Clean Slate initialized (${resetScope}). Ready for real live production, SKUs, and inventory onboarding.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 11. BOM (BILL OF MATERIALS)
// ==========================================
app.get('/api/boms', async (req: Request, res: Response) => {
  try {
    const allBoms = await db.select().from(boms).orderBy(desc(boms.id));
    const allItems = await db.select().from(bomItems);
    const allProducts = await db.select().from(products);
    const prodMap = new Map(allProducts.map(p => [p.id, p]));

    const enriched = allBoms.map(b => ({
      ...b,
      productName: prodMap.get(b.productId)?.name,
      items: allItems.filter(it => it.bomId === b.id),
    }));
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/boms', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const {
      productId,
      skuId,
      name,
      revisionNumber = 1,
      batchSize = 1,
      estimatedMaterialCost = 0,
      laborCost = 0,
      overheadCost = 0,
      totalEstimatedCost = 0,
      effectiveDate,
      items = [],
    } = req.body;

    const [newBom] = await db.insert(boms).values({
      companyId,
      productId: Number(productId) || 1,
      skuId: skuId ? Number(skuId) : null,
      name,
      revisionNumber: Number(revisionNumber),
      batchSize: String(batchSize),
      estimatedMaterialCost: String(estimatedMaterialCost),
      laborCost: String(laborCost),
      overheadCost: String(overheadCost),
      totalEstimatedCost: String(totalEstimatedCost),
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    }).returning();

    for (const item of items) {
      await db.insert(bomItems).values({
        bomId: newBom.id,
        componentName: item.componentName,
        componentSku: item.componentSku,
        quantityRequired: String(item.quantityRequired),
        unit: item.unit || 'PCS',
        unitCost: String(item.unitCost || 0),
        wastagePercent: String(item.wastagePercent || 0),
        totalComponentCost: String(item.totalComponentCost || 0),
      });
    }

    await logAudit('CREATE', 'BOM', String(newBom.id), `Created BOM recipe ${newBom.name} (Rev ${newBom.revisionNumber})`);
    res.status(201).json(newBom);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/boms/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      productId,
      skuId,
      name,
      revisionNumber,
      batchSize,
      estimatedMaterialCost,
      laborCost,
      overheadCost,
      totalEstimatedCost,
      effectiveDate,
      status,
      items,
    } = req.body;

    const [updated] = await db
      .update(boms)
      .set({
        productId: productId ? Number(productId) : undefined,
        skuId: skuId !== undefined ? (skuId ? Number(skuId) : null) : undefined,
        name: name || undefined,
        revisionNumber: revisionNumber ? Number(revisionNumber) : undefined,
        batchSize: batchSize !== undefined ? String(batchSize) : undefined,
        estimatedMaterialCost: estimatedMaterialCost !== undefined ? String(estimatedMaterialCost) : undefined,
        laborCost: laborCost !== undefined ? String(laborCost) : undefined,
        overheadCost: overheadCost !== undefined ? String(overheadCost) : undefined,
        totalEstimatedCost: totalEstimatedCost !== undefined ? String(totalEstimatedCost) : undefined,
        effectiveDate: effectiveDate || undefined,
        status: status || undefined,
      })
      .where(eq(boms.id, id))
      .returning();

    if (Array.isArray(items)) {
      await db.delete(bomItems).where(eq(bomItems.bomId, id));
      for (const item of items) {
        await db.insert(bomItems).values({
          bomId: id,
          componentName: item.componentName,
          componentSku: item.componentSku,
          quantityRequired: String(item.quantityRequired),
          unit: item.unit || 'PCS',
          unitCost: String(item.unitCost || 0),
          wastagePercent: String(item.wastagePercent || 0),
          totalComponentCost: String(item.totalComponentCost || 0),
        });
      }
    }

    await logAudit('UPDATE', 'BOM', String(id), `Updated BOM recipe ${updated?.name || id}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/boms/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(boms).where(eq(boms.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    const linkedWorkOrders = await db.select().from(productionWorkOrders).where(eq(productionWorkOrders.bomId, id)).limit(1);
    if (linkedWorkOrders.length > 0) {
      await db.update(boms).set({ status: 'ARCHIVED' }).where(eq(boms.id, id));
      await logAudit('ARCHIVE', 'BOM', String(id), `Archived BOM ${existing.name} due to existing production work orders`);
      return res.json({ success: true, message: `BOM ${existing.name} has production work order history and was safely ARCHIVED` });
    }

    await db.delete(bomItems).where(eq(bomItems.bomId, id));
    await db.delete(boms).where(eq(boms.id, id));
    await logAudit('DELETE', 'BOM', String(id), `Deleted BOM recipe ${existing.name}`);
    res.json({ success: true, message: `BOM ${existing.name} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 12. ACCOUNTING & VOUCHERS
// ==========================================
app.get('/api/accounting/accounts', async (req: Request, res: Response) => {
  try {
    const accList = await db.select().from(accounts).orderBy(accounts.id);
    const grpList = await db.select().from(accountGroups);
    const grpMap = new Map(grpList.map(g => [g.id, g]));

    const enriched = accList.map(a => ({
      ...a,
      groupName: grpMap.get(a.groupId)?.name,
    }));
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/accounting/vouchers', async (req: Request, res: Response) => {
  try {
    const vchList = await db.select().from(vouchers).orderBy(desc(vouchers.id));
    const lines = await db.select().from(voucherLines);
    const accs = await db.select().from(accounts);
    const accMap = new Map(accs.map(a => [a.id, a]));

    const enriched = vchList.map(v => ({
      ...v,
      lines: lines
        .filter(l => l.voucherId === v.id)
        .map(l => ({
          ...l,
          accountName: accMap.get(l.accountId)?.name,
        })),
    }));
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/accounting/vouchers', async (req: Request, res: Response) => {
  try {
    const companyList = await db.select().from(companies).limit(1);
    const companyId = companyList[0]?.id || 1;
    const { voucherType, date, narration, lines = [] } = req.body;

    const totalDebit = lines.reduce((acc: number, l: any) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((acc: number, l: any) => acc + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01 || totalDebit <= 0) {
      return res.status(400).json({ error: 'Unbalanced voucher: Total Debits must equal Total Credits' });
    }

    const voucherNumber = `VCH-${voucherType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const [newVoucher] = await db.insert(vouchers).values({
      companyId,
      voucherType,
      voucherNumber,
      date,
      totalAmount: String(totalDebit),
      narration,
      isPosted: true,
    }).returning();

    for (const l of lines) {
      await db.insert(voucherLines).values({
        voucherId: newVoucher.id,
        accountId: Number(l.accountId) || 1,
        debit: String(l.debit || 0),
        credit: String(l.credit || 0),
        lineNarration: l.narration,
      });

      // Update current account balances
      const netChange = Number(l.debit || 0) - Number(l.credit || 0);
      await db.execute(sql`
        UPDATE accounts 
        SET current_balance = COALESCE(current_balance, 0) + ${netChange}
        WHERE id = ${Number(l.accountId)}
      `);
    }

    await logAudit('POST', 'VOUCHER', String(newVoucher.id), `Posted ${voucherType} voucher ${voucherNumber} for ₹${totalDebit}`);
    res.status(201).json(newVoucher);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 13. FIRST-TIME SETUP WIZARD
// ==========================================
app.post('/api/wizard/initialize', async (req: Request, res: Response) => {
  try {
    const { company: compData, financial, warehouses: whList, docSeries, activeCategories } = req.body;

    // Update Company Master
    if (compData) {
      await db.update(companies).set({
        legalName: compData.legalName,
        tradeName: compData.tradeName,
        gstin: compData.gstin,
        pan: compData.pan,
        cin: compData.cin,
        email: compData.email,
        phone: compData.phone,
        address: compData.address,
        pincode: compData.pincode,
        financialYearStart: financial?.startDate || '2026-04-01',
        financialYearEnd: financial?.endDate || '2027-03-31',
      });
    }

    // Ensure Categories exist
    if (Array.isArray(activeCategories)) {
      for (const catName of activeCategories) {
        const existing = await db.select().from(productCategories).where(eq(productCategories.name, catName));
        if (existing.length === 0) {
          await db.insert(productCategories).values({
            name: catName,
            code: catName.replace(/[^A-Z]/g, '').slice(0, 3) || 'CAT',
          });
        }
      }
    }

    await logAudit('INITIALIZE', 'SETUP_WIZARD', 'ALL', 'First-Time Setup Wizard completed by Mr. Sushil Goyal');
    res.json({ success: true, message: 'First-time setup initialized successfully for Electromax Global.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
