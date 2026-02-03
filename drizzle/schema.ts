import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "operator", "viewer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Sites table
export const sites = mysqlTable("sites", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;

// Cameras table
export const cameras = mysqlTable("cameras", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  locationTag: varchar("locationTag", { length: 255 }),
  rtspUrl: varchar("rtspUrl", { length: 512 }).notNull(),
  status: mysqlEnum("status", ["online", "offline", "error"]).default("offline").notNull(),
  fps: decimal("fps", { precision: 5, scale: 2 }),
  lastFrameTime: timestamp("lastFrameTime"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = typeof cameras.$inferInsert;

// Zones table
export const zones = mysqlTable("zones", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: int("cameraId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  polygonPoints: json("polygonPoints"),
  zoneType: mysqlEnum("zoneType", ["intrusion", "loitering", "counting", "general"]).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

// Rules table
export const rules = mysqlTable("rules", {
  id: int("id").autoincrement().primaryKey(),
  zoneId: int("zoneId").notNull(),
  ruleType: mysqlEnum("ruleType", ["intrusion", "loitering", "counting", "custom"]).notNull(),
  objectType: mysqlEnum("objectType", ["person", "vehicle", "any"]).default("any").notNull(),
  thresholdSeconds: int("thresholdSeconds").default(0),
  confidenceThreshold: decimal("confidenceThreshold", { precision: 3, scale: 2 }),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rule = typeof rules.$inferSelect;
export type InsertRule = typeof rules.$inferInsert;

// Events table
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: int("cameraId").notNull(),
  zoneId: int("zoneId"),
  ruleId: int("ruleId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ruleType: varchar("ruleType", { length: 64 }).notNull(),
  objectType: varchar("objectType", { length: 64 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  boundingBox: json("boundingBox"),
  snapshotUrl: varchar("snapshotUrl", { length: 512 }),
  clipUrl: varchar("clipUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Detections table (for tracking)
export const detections = mysqlTable("detections", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: int("cameraId").notNull(),
  frameNumber: int("frameNumber"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  objectType: varchar("objectType", { length: 64 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  boundingBox: json("boundingBox"),
  trackId: varchar("trackId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Detection = typeof detections.$inferSelect;
export type InsertDetection = typeof detections.$inferInsert;

// Alert Subscriptions table
export const alertSubscriptions = mysqlTable("alertSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cameraId: int("cameraId"),
  ruleType: varchar("ruleType", { length: 64 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
export type InsertAlertSubscription = typeof alertSubscriptions.$inferInsert;

// Notifications table (NEW)
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  type: mysqlEnum("type", ["intrusion", "loitering", "counting", "system"]).notNull(),
  cameraId: int("cameraId"),
  read: boolean("read").default(false).notNull(),
  actionUrl: varchar("actionUrl", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Audit Logs table
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 128 }).notNull(),
  resourceId: int("resourceId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
