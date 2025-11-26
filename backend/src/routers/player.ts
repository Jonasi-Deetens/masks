import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const playerRouter = router({
  // Get player by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.player.findUnique({
        where: { id: input },
        include: {
          currentMask: true,
          masksOwned: { include: { mask: true } },
          inventory: { include: { item: true } },
          relationships: { include: { npc: true } },
          location: true,
          minigameProgress: { include: { minigame: true } },
          eventsCompleted: { include: { event: true } },
        },
      });
    }),

  // Get player by username
  getByUsername: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.player.findUnique({
        where: { username: input },
        include: {
          currentMask: true,
          masksOwned: { include: { mask: true } },
          inventory: { include: { item: true } },
          relationships: { include: { npc: true } },
          location: true,
        },
      });
    }),

  // Create new player
  create: publicProcedure
    .input(z.object({
      username: z.string(),
      avatar: z.string().default('avatars/player_default.png'),
      grade: z.number().default(10),
      className: z.string().default('A'),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.player.create({
        data: input,
      });
    }),

  // Update player stats
  updateStats: publicProcedure
    .input(z.object({
      id: z.string(),
      energy: z.number().optional(),
      mood: z.string().optional(),
      time: z.string().optional(),
      reputation: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.player.update({
        where: { id },
        data,
      });
    }),

  // Change current mask
  equipMask: publicProcedure
    .input(z.object({
      playerId: z.string(),
      maskId: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.player.update({
        where: { id: input.playerId },
        data: { currentMaskId: input.maskId },
        include: { currentMask: true },
      });
    }),

  // Add mask to player's collection
  addMask: publicProcedure
    .input(z.object({
      playerId: z.string(),
      maskId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerMask.create({
        data: {
          playerId: input.playerId,
          maskId: input.maskId,
        },
      });
    }),

  // Move player to zone
  moveToZone: publicProcedure
    .input(z.object({
      playerId: z.string(),
      zoneId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.player.update({
        where: { id: input.playerId },
        data: { zoneId: input.zoneId },
        include: { location: true },
      });
    }),

  // Add item to inventory
  addItem: publicProcedure
    .input(z.object({
      playerId: z.string(),
      itemId: z.string(),
      quantity: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerItem.upsert({
        where: {
          playerId_itemId: {
            playerId: input.playerId,
            itemId: input.itemId,
          },
        },
        update: {
          quantity: { increment: input.quantity },
        },
        create: {
          playerId: input.playerId,
          itemId: input.itemId,
          quantity: input.quantity,
        },
      });
    }),

  // Remove item from inventory
  removeItem: publicProcedure
    .input(z.object({
      playerId: z.string(),
      itemId: z.string(),
      quantity: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.playerItem.findUnique({
        where: {
          playerId_itemId: {
            playerId: input.playerId,
            itemId: input.itemId,
          },
        },
      });

      if (!existing) return null;

      if (existing.quantity <= input.quantity) {
        return ctx.prisma.playerItem.delete({
          where: { id: existing.id },
        });
      }

      return ctx.prisma.playerItem.update({
        where: { id: existing.id },
        data: { quantity: { decrement: input.quantity } },
      });
    }),

  // Update NPC relationship
  updateRelationship: publicProcedure
    .input(z.object({
      playerId: z.string(),
      npcId: z.string(),
      affinityChange: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerRelationship.upsert({
        where: {
          playerId_npcId: {
            playerId: input.playerId,
            npcId: input.npcId,
          },
        },
        update: {
          affinity: { increment: input.affinityChange },
        },
        create: {
          playerId: input.playerId,
          npcId: input.npcId,
          affinity: input.affinityChange,
        },
      });
    }),

  // Mark event as completed
  completeEvent: publicProcedure
    .input(z.object({
      playerId: z.string(),
      eventId: z.string(),
      choiceMade: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerEvent.upsert({
        where: {
          playerId_eventId: {
            playerId: input.playerId,
            eventId: input.eventId,
          },
        },
        update: {
          completed: true,
          choiceMade: input.choiceMade,
        },
        create: {
          playerId: input.playerId,
          eventId: input.eventId,
          completed: true,
          choiceMade: input.choiceMade,
        },
      });
    }),

  // Update minigame progress
  updateMinigameProgress: publicProcedure
    .input(z.object({
      playerId: z.string(),
      minigameId: z.string(),
      score: z.number(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerMinigame.upsert({
        where: {
          playerId_minigameId: {
            playerId: input.playerId,
            minigameId: input.minigameId,
          },
        },
        update: {
          score: input.score,
          completed: input.completed ?? false,
        },
        create: {
          playerId: input.playerId,
          minigameId: input.minigameId,
          score: input.score,
          completed: input.completed ?? false,
        },
      });
    }),

  // Delete player (for reset/new game)
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.player.delete({
        where: { id: input },
      });
    }),
});

