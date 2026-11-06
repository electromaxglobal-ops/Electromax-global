import { db } from './index.ts';
import { users, roles } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    // Default to Super Admin for first user, or Employee
    const allRoles = await db.select().from(roles);
    const superAdminRole = allRoles.find(r => r.code === 'SUPER_ADMIN') || allRoles[0];

    const result = await db.insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
        roleId: superAdminRole?.id,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          fullName: fullName || email.split('@')[0],
          lastLoginAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw new Error("Failed to authenticate or synchronize user profile", { cause: error });
  }
}
