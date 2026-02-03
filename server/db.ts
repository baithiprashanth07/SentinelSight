import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  sites, InsertSite, Site,
  cameras, InsertCamera, Camera,
  zones, InsertZone, Zone,
  rules, InsertRule, Rule,
  events, InsertEvent, Event,
  detections, InsertDetection, Detection,
  alertSubscriptions, InsertAlertSubscription,
  auditLogs, InsertAuditLog, AuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SITE QUERIES
// ============================================================================

export async function getSites(): Promise<Site[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sites).orderBy(sites.name);
}

export async function getSiteById(id: number): Promise<Site | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createSite(data: InsertSite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(sites).values(data);
}

export async function updateSite(id: number, data: Partial<InsertSite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(sites).set(data).where(eq(sites.id, id));
}

export async function deleteSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(sites).where(eq(sites.id, id));
}

// ============================================================================
// CAMERA QUERIES
// ============================================================================

export async function getCameras(siteId?: number): Promise<Camera[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (siteId) {
    return await db.select().from(cameras).where(eq(cameras.siteId, siteId)).orderBy(cameras.name);
  }
  return await db.select().from(cameras).orderBy(cameras.name);
}

export async function getCameraById(id: number): Promise<Camera | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cameras).where(eq(cameras.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCamera(data: InsertCamera) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(cameras).values(data);
}

export async function updateCamera(id: number, data: Partial<InsertCamera>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(cameras).set(data).where(eq(cameras.id, id));
}

export async function updateCameraStatus(id: number, status: "online" | "offline" | "error", lastFrameTime?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (lastFrameTime) updateData.lastFrameTime = lastFrameTime;
  return await db.update(cameras).set(updateData).where(eq(cameras.id, id));
}

export async function deleteCamera(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(cameras).where(eq(cameras.id, id));
}

// ============================================================================
// ZONE QUERIES
// ============================================================================

export async function getZones(cameraId: number): Promise<Zone[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(zones).where(eq(zones.cameraId, cameraId)).orderBy(zones.name);
}

export async function getZoneById(id: number): Promise<Zone | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createZone(data: InsertZone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(zones).values(data);
}

export async function updateZone(id: number, data: Partial<InsertZone>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(zones).set(data).where(eq(zones.id, id));
}

export async function deleteZone(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(zones).where(eq(zones.id, id));
}

// ============================================================================
// RULE QUERIES
// ============================================================================

export async function getRules(zoneId: number): Promise<Rule[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rules).where(eq(rules.zoneId, zoneId)).orderBy(rules.ruleType);
}

export async function getRuleById(id: number): Promise<Rule | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rules).where(eq(rules.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createRule(data: InsertRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(rules).values(data);
}

export async function updateRule(id: number, data: Partial<InsertRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(rules).set(data).where(eq(rules.id, id));
}

export async function deleteRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(rules).where(eq(rules.id, id));
}

// ============================================================================
// EVENT QUERIES
// ============================================================================

export async function getEvents(filters?: {
  cameraId?: number;
  ruleType?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.cameraId) {
    conditions.push(eq(events.cameraId, filters.cameraId));
  }
  if (filters?.ruleType) {
    conditions.push(eq(events.ruleType, filters.ruleType as any));
  }
  if (filters?.from) {
    conditions.push(gte(events.timestamp, filters.from));
  }
  if (filters?.to) {
    conditions.push(lte(events.timestamp, filters.to));
  }

  let query: any = db.select().from(events);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(events.timestamp));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(events).values(data);
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(events).where(eq(events.id, id));
}

export async function getEventCount(cameraId?: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let query: any = db.select({ count: sql<number>`count(*)` }).from(events);
  if (cameraId) {
    query = query.where(eq(events.cameraId, cameraId));
  }

  const result = await query;
  return result[0]?.count ?? 0;
}

// ============================================================================
// DETECTION QUERIES
// ============================================================================

export async function createDetection(data: InsertDetection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(detections).values(data);
}

export async function getRecentDetections(cameraId: number, limit: number = 100): Promise<Detection[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(detections)
    .where(eq(detections.cameraId, cameraId))
    .orderBy(desc(detections.timestamp))
    .limit(limit);
}

// ============================================================================
// ALERT SUBSCRIPTION QUERIES
// ============================================================================

export async function getUserAlertSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alertSubscriptions).where(eq(alertSubscriptions.userId, userId));
}

export async function createAlertSubscription(data: InsertAlertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(alertSubscriptions).values(data);
}

export async function deleteAlertSubscription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(alertSubscriptions).where(eq(alertSubscriptions.id, id));
}

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters?.resourceType) {
    conditions.push(eq(auditLogs.resourceType, filters.resourceType));
  }

  let query: any = db.select().from(auditLogs);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(auditLogs.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}


