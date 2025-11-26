import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const masksRouter = router({
  // Get all masks
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.mask.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get mask by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.mask.findUnique({
        where: { id: input },
      });
    }),

  // Get masks owned by player
  getPlayerMasks: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerMask.findMany({
        where: { playerId: input },
        include: { mask: true },
      });
    }),

  // Get available masks (not owned by player)
  getAvailableMasks: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const ownedMasks = await ctx.prisma.playerMask.findMany({
        where: { playerId: input },
        select: { maskId: true },
      });
      const ownedIds = ownedMasks.map(pm => pm.maskId);

      return ctx.prisma.mask.findMany({
        where: {
          id: { notIn: ownedIds },
        },
      });
    }),

  // Update mask corruption for player
  updateCorruption: publicProcedure
    .input(z.object({
      playerId: z.string(),
      maskId: z.string(),
      corruptionChange: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const playerMask = await ctx.prisma.playerMask.findUnique({
        where: {
          playerId_maskId: {
            playerId: input.playerId,
            maskId: input.maskId,
          },
        },
      });

      if (!playerMask) return null;

      const newCorruption = Math.max(0, Math.min(100, playerMask.corruption + input.corruptionChange));

      return ctx.prisma.playerMask.update({
        where: { id: playerMask.id },
        data: { corruption: newCorruption },
        include: { mask: true },
      });
    }),

  // Get mask corruption for player
  getCorruption: publicProcedure
    .input(z.object({
      playerId: z.string(),
      maskId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerMask.findUnique({
        where: {
          playerId_maskId: {
            playerId: input.playerId,
            maskId: input.maskId,
          },
        },
        select: { corruption: true, mask: true },
      });
    }),
});

