import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const zonesRouter = router({
  // Get all zones
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.zone.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get zone by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.zone.findUnique({
        where: { id: input },
        include: {
          npcs: true,
          events: true,
          actions: true,
        },
      });
    }),

  // Get zones by type
  getByType: publicProcedure
    .input(z.enum(['class', 'hallway', 'special']))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.zone.findMany({
        where: { type: input },
        orderBy: { name: 'asc' },
      });
    }),

  // Get zone with current NPCs (based on time)
  getWithNPCs: publicProcedure
    .input(z.object({
      zoneId: z.string(),
      time: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const zone = await ctx.prisma.zone.findUnique({
        where: { id: input.zoneId },
      });

      if (!zone) return null;

      const allNPCs = await ctx.prisma.nPC.findMany();
      const npcsInZone = allNPCs.filter(npc => {
        const schedule = npc.schedule as Array<{ time: string; zoneId: string }>;
        return schedule.some(slot => 
          slot.time === input.time && slot.zoneId === input.zoneId
        );
      });

      return { zone, npcs: npcsInZone };
    }),

  // Get available actions in zone
  getActions: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.action.findMany({
        where: { zoneId: input },
      });
    }),

  // Get events that can trigger in zone
  getEvents: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        where: {
          triggerZones: { has: input },
        },
      });
    }),
});

