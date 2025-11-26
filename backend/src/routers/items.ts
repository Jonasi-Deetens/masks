import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const itemsRouter = router({
  // Get all items
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.item.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get item by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findUnique({
        where: { id: input },
      });
    }),

  // Get items by type
  getByType: publicProcedure
    .input(z.enum(['consumable', 'equipment', 'quest']))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findMany({
        where: { type: input },
        orderBy: { name: 'asc' },
      });
    }),

  // Get player's inventory
  getPlayerInventory: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerItem.findMany({
        where: { playerId: input },
        include: { item: true },
      });
    }),

  // Use item (applies effects)
  useItem: publicProcedure
    .input(z.object({
      playerId: z.string(),
      itemId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const playerItem = await ctx.prisma.playerItem.findUnique({
        where: {
          playerId_itemId: {
            playerId: input.playerId,
            itemId: input.itemId,
          },
        },
        include: { item: true },
      });

      if (!playerItem || playerItem.quantity <= 0) {
        throw new Error('Item not found in inventory');
      }

      const item = playerItem.item;
      const effects = item.effects as {
        energy?: number;
        mood?: string;
        relationship?: Record<string, number>;
      };

      // Apply energy effect
      if (effects.energy) {
        await ctx.prisma.player.update({
          where: { id: input.playerId },
          data: {
            energy: { increment: effects.energy },
          },
        });
      }

      // Apply mood effect
      if (effects.mood && effects.mood !== 'neutral') {
        await ctx.prisma.player.update({
          where: { id: input.playerId },
          data: { mood: effects.mood },
        });
      }

      // Apply relationship effects
      if (effects.relationship) {
        for (const [npcId, change] of Object.entries(effects.relationship)) {
          if (change !== 0) {
            await ctx.prisma.playerRelationship.upsert({
              where: {
                playerId_npcId: {
                  playerId: input.playerId,
                  npcId,
                },
              },
              update: { affinity: { increment: change } },
              create: {
                playerId: input.playerId,
                npcId,
                affinity: change,
              },
            });
          }
        }
      }

      // Decrease item quantity (for consumables)
      if (item.type === 'consumable') {
        if (playerItem.quantity <= 1) {
          await ctx.prisma.playerItem.delete({
            where: { id: playerItem.id },
          });
        } else {
          await ctx.prisma.playerItem.update({
            where: { id: playerItem.id },
            data: { quantity: { decrement: 1 } },
          });
        }
      }

      return { success: true, effects };
    }),
});

