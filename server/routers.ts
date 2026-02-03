import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  location: z.string().optional(),
  description: z.string().optional(),
});

const CameraSchema = z.object({
  siteId: z.number(),
  name: z.string().min(1, "Camera name is required"),
  locationTag: z.string().optional(),
  rtspUrl: z.string().url("Invalid RTSP URL"),
});

const ZoneSchema = z.object({
  cameraId: z.number(),
  name: z.string().min(1, "Zone name is required"),
  polygonPoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  zoneType: z.enum(["intrusion", "loitering", "counting", "general"]),
});

const RuleSchema = z.object({
  zoneId: z.number(),
  ruleType: z.enum(["intrusion", "loitering", "counting", "custom"]),
  objectType: z.enum(["person", "vehicle", "any"]).default("any"),
  thresholdSeconds: z.number().int().min(0).default(0),
  confidenceThreshold: z.number().min(0).max(1).default(0.5).transform(v => v.toString()),
});

const EventFilterSchema = z.object({
  cameraId: z.number().optional(),
  ruleType: z.string().optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function requireAdmin(role?: string) {
  if (role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

function requireOperatorOrAdmin(role?: string) {
  if (role !== "admin" && role !== "operator") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Operator or Admin access required",
    });
  }
}

// ============================================================================
// SITES ROUTER
// ============================================================================

const sitesRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getSites();
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const site = await db.getSiteById(input);
    if (!site) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Site not found",
      });
    }
    return site;
  }),

  create: protectedProcedure
    .input(SiteSchema)
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user?.role);
      await db.createSite(input);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: SiteSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user?.role);
      await db.updateSite(input.id, input.data);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    requireAdmin(ctx.user?.role);
    await db.deleteSite(input);
    return { success: true };
  }),
});

// ============================================================================
// CAMERAS ROUTER
// ============================================================================

const camerasRouter = router({
  list: publicProcedure.input(z.number().optional()).query(async ({ input }) => {
    return await db.getCameras(input);
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const camera = await db.getCameraById(input);
    if (!camera) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Camera not found",
      });
    }
    return camera;
  }),

  create: protectedProcedure
    .input(CameraSchema)
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      await db.createCamera({
        ...input,
        status: "offline",
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: CameraSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      await db.updateCamera(input.id, input.data);
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "error"]),
        lastFrameTime: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      await db.updateCameraStatus(input.id, input.status, input.lastFrameTime);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    requireOperatorOrAdmin(ctx.user?.role);
    await db.deleteCamera(input);
    return { success: true };
  }),
});

// ============================================================================
// ZONES ROUTER
// ============================================================================

const zonesRouter = router({
  list: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await db.getZones(input);
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const zone = await db.getZoneById(input);
    if (!zone) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Zone not found",
      });
    }
    return zone;
  }),

  create: protectedProcedure
    .input(ZoneSchema)
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      await db.createZone(input);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: ZoneSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      await db.updateZone(input.id, input.data);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    requireOperatorOrAdmin(ctx.user?.role);
    await db.deleteZone(input);
    return { success: true };
  }),
});

// ============================================================================
// RULES ROUTER
// ============================================================================

const rulesRouter = router({
  list: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await db.getRules(input);
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const rule = await db.getRuleById(input);
    if (!rule) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Rule not found",
      });
    }
    return rule;
  }),

  create: protectedProcedure
    .input(RuleSchema)
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      const ruleData = {
        ...input,
        confidenceThreshold: input.confidenceThreshold as any,
      };
      await db.createRule(ruleData);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: RuleSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      requireOperatorOrAdmin(ctx.user?.role);
      const updateData = input.data as any;
      await db.updateRule(input.id, updateData);
      return { success: true };
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    requireOperatorOrAdmin(ctx.user?.role);
    await db.deleteRule(input);
    return { success: true };
  }),
});

// ============================================================================
// EVENTS ROUTER
// ============================================================================

const eventsRouter = router({
  list: publicProcedure.input(EventFilterSchema).query(async ({ input }) => {
    return await db.getEvents({
      cameraId: input.cameraId,
      ruleType: input.ruleType,
      from: input.from,
      to: input.to,
      limit: input.limit,
      offset: input.offset,
    });
  }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const event = await db.getEventById(input);
    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }
    return event;
  }),

  count: publicProcedure
    .input(z.number().optional())
    .query(async ({ input }) => {
      return await db.getEventCount(input);
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    requireOperatorOrAdmin(ctx.user?.role);
    await db.deleteEvent(input);
    return { success: true };
  }),
});

// ============================================================================
// ALERTS ROUTER
// ============================================================================

const alertsRouter = router({
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }
    return await db.getUserAlertSubscriptions(ctx.user.id);
  }),

  subscribe: protectedProcedure
    .input(
      z.object({
        cameraId: z.number().optional(),
        ruleType: z.enum(["intrusion", "loitering", "counting", "custom", "all"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      await db.createAlertSubscription({
        userId: ctx.user.id,
        cameraId: input.cameraId,
        ruleType: input.ruleType,
      });
      return { success: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      await db.deleteAlertSubscription(input);
      return { success: true };
    }),
});

// ============================================================================
// AUDIT ROUTER
// ============================================================================

const auditRouter = router({
  getLogs: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        resourceType: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      requireAdmin(ctx.user?.role);
      return await db.getAuditLogs({
        userId: input.userId,
        resourceType: input.resourceType,
        limit: input.limit,
        offset: input.offset,
      });
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  sites: sitesRouter,
  cameras: camerasRouter,
  zones: zonesRouter,
  rules: rulesRouter,
  events: eventsRouter,
  alerts: alertsRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
