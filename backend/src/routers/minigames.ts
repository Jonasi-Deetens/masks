import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const minigamesRouter = router({
  // Get all minigames
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.minigame.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get minigame by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.minigame.findUnique({
        where: { id: input },
      });
    }),

  // Get minigames by class type
  getByClass: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.minigame.findMany({
        where: { classId: input },
      });
    }),

  // Get player's progress on all minigames
  getPlayerProgress: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerMinigame.findMany({
        where: { playerId: input },
        include: { minigame: true },
      });
    }),

  // Get minigame with mask modifiers applied
  getWithMaskModifiers: publicProcedure
    .input(z.object({
      minigameId: z.string(),
      maskId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const minigame = await ctx.prisma.minigame.findUnique({
        where: { id: input.minigameId },
      });

      if (!minigame) return null;

      const modifiers = minigame.maskModifiers as Record<string, Record<string, number>>;
      const appliedModifiers = input.maskId ? modifiers[input.maskId] : null;

      return {
        minigame,
        maskModifiers: appliedModifiers,
      };
    }),

  // Submit minigame result
  submitResult: publicProcedure
    .input(z.object({
      playerId: z.string(),
      minigameId: z.string(),
      score: z.number(),
      maskId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const minigame = await ctx.prisma.minigame.findUnique({
        where: { id: input.minigameId },
      });

      if (!minigame) throw new Error('Minigame not found');

      // Apply mask modifiers to score
      let finalScore = input.score;
      if (input.maskId) {
        const modifiers = minigame.maskModifiers as Record<string, Record<string, number>>;
        const maskMod = modifiers[input.maskId];
        if (maskMod?.bonusScore) {
          finalScore += maskMod.bonusScore;
        }
      }

      // Get rewards
      const rewards = minigame.rewards as Record<string, number>;
      const completed = finalScore >= minigame.difficulty * 10;

      // Update player progress
      const progress = await ctx.prisma.playerMinigame.upsert({
        where: {
          playerId_minigameId: {
            playerId: input.playerId,
            minigameId: input.minigameId,
          },
        },
        update: {
          score: Math.max(finalScore, 0),
          completed,
        },
        create: {
          playerId: input.playerId,
          minigameId: input.minigameId,
          score: finalScore,
          completed,
        },
        include: { minigame: true },
      });

      return {
        progress,
        finalScore,
        completed,
        rewards: completed ? rewards : null,
      };
    }),
});

