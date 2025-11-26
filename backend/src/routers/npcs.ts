import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const npcsRouter = router({
  // Get all NPCs
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.nPC.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get NPC by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nPC.findUnique({
        where: { id: input },
        include: { location: true },
      });
    }),

  // Get NPCs by role (Student, Teacher, Director)
  getByRole: publicProcedure
    .input(z.enum(['Student', 'Teacher', 'Director']))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nPC.findMany({
        where: { role: input },
        orderBy: { name: 'asc' },
      });
    }),

  // Get NPCs in a specific zone
  getByZone: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nPC.findMany({
        where: { zoneId: input },
      });
    }),

  // Get NPCs by time (based on schedule)
  getByTime: publicProcedure
    .input(z.object({
      time: z.string(),
      zoneId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const npcs = await ctx.prisma.nPC.findMany();
      
      return npcs.filter(npc => {
        const schedule = npc.schedule as Array<{ time: string; zoneId: string }>;
        return schedule.some(slot => {
          const matchesTime = slot.time === input.time;
          const matchesZone = input.zoneId ? slot.zoneId === input.zoneId : true;
          return matchesTime && matchesZone;
        });
      });
    }),

  // Get player's relationship with NPC
  getRelationship: publicProcedure
    .input(z.object({
      playerId: z.string(),
      npcId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const relationship = await ctx.prisma.playerRelationship.findUnique({
        where: {
          playerId_npcId: {
            playerId: input.playerId,
            npcId: input.npcId,
          },
        },
      });

      const npc = await ctx.prisma.nPC.findUnique({
        where: { id: input.npcId },
      });

      return {
        npc,
        affinity: relationship?.affinity ?? npc?.relationship ?? 0,
      };
    }),

  // Get all relationships for a player
  getAllRelationships: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerRelationship.findMany({
        where: { playerId: input },
        include: { npc: true },
      });
    }),

  // Get NPC reaction based on current mask
  getReaction: publicProcedure
    .input(z.object({
      npcId: z.string(),
      maskId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const npc = await ctx.prisma.nPC.findUnique({
        where: { id: input.npcId },
      });

      if (!npc) return null;

      const reactions = npc.reactions as Record<string, string>;
      return {
        npc,
        reaction: reactions[input.maskId] ?? 'No specific reaction.',
      };
    }),

  // Search NPCs by trait
  searchByTrait: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nPC.findMany({
        where: {
          traits: { has: input },
        },
      });
    }),
});

