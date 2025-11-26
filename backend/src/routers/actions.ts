import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const actionsRouter = router({
  // Get all actions
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.action.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get action by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.action.findUnique({
        where: { id: input },
        include: { zone: true },
      });
    }),

  // Get actions for a zone
  getByZone: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.action.findMany({
        where: { zoneId: input },
      });
    }),

  // Get available actions for player in current zone
  getAvailable: publicProcedure
    .input(z.object({
      playerId: z.string(),
      zoneId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: { id: input.playerId },
        include: {
          currentMask: true,
          inventory: true,
        },
      });

      if (!player) return [];

      const actions = await ctx.prisma.action.findMany({
        where: { zoneId: input.zoneId },
      });

      // Filter actions based on preconditions
      return actions.filter(action => {
        const preconditions = action.preconditions as {
          currentMask?: string[];
          inventory?: string[];
        };

        // Check mask precondition
        if (preconditions.currentMask && preconditions.currentMask.length > 0) {
          if (preconditions.currentMask[0] !== 'any' && 
              !preconditions.currentMask.includes(player.currentMaskId ?? '')) {
            return false;
          }
        }

        // Check inventory precondition
        if (preconditions.inventory && preconditions.inventory.length > 0) {
          const playerItemIds = player.inventory.map(i => i.itemId);
          const hasAllItems = preconditions.inventory.every(itemId => 
            playerItemIds.includes(itemId)
          );
          if (!hasAllItems) return false;
        }

        return true;
      });
    }),

  // Execute an action
  execute: publicProcedure
    .input(z.object({
      playerId: z.string(),
      actionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.prisma.action.findUnique({
        where: { id: input.actionId },
      });

      if (!action) throw new Error('Action not found');

      const player = await ctx.prisma.player.findUnique({
        where: { id: input.playerId },
        include: { currentMask: true },
      });

      if (!player) throw new Error('Player not found');

      const effects = action.effects as {
        reputation?: number;
        grade?: number;
        maskCorruption?: number;
        relationships?: Record<string, number>;
        energy?: number;
        items?: Record<string, number>;
      };

      const maskModifiers = action.maskModifiers as Record<string, Record<string, number>>;
      const currentMaskMod = player.currentMaskId ? maskModifiers[player.currentMaskId] : null;

      // Calculate time advancement
      const [hours, minutes] = player.time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + action.timeCost;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;
      const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

      // Apply reputation
      let reputationChange = effects.reputation ?? 0;
      if (currentMaskMod?.reputationBonus) {
        reputationChange += currentMaskMod.reputationBonus;
      }

      // Apply energy cost (if any)
      const energyChange = effects.energy ?? 0;

      // Update player stats
      await ctx.prisma.player.update({
        where: { id: input.playerId },
        data: {
          time: newTime,
          reputation: { increment: reputationChange },
          energy: { increment: energyChange },
        },
      });

      // Apply mask corruption
      if (effects.maskCorruption && player.currentMaskId) {
        await ctx.prisma.playerMask.updateMany({
          where: {
            playerId: input.playerId,
            maskId: player.currentMaskId,
          },
          data: {
            corruption: { increment: effects.maskCorruption },
          },
        });
      }

      // Apply relationship changes
      if (effects.relationships) {
        for (const [npcId, change] of Object.entries(effects.relationships)) {
          let finalChange = change;
          if (currentMaskMod?.relationshipBonus) {
            finalChange += currentMaskMod.relationshipBonus;
          }

          if (finalChange !== 0) {
            await ctx.prisma.playerRelationship.upsert({
              where: {
                playerId_npcId: {
                  playerId: input.playerId,
                  npcId,
                },
              },
              update: { affinity: { increment: finalChange } },
              create: {
                playerId: input.playerId,
                npcId,
                affinity: finalChange,
              },
            });
          }
        }
      }

      // Handle item changes
      if (effects.items) {
        for (const [itemId, change] of Object.entries(effects.items)) {
          if (change > 0) {
            await ctx.prisma.playerItem.upsert({
              where: {
                playerId_itemId: {
                  playerId: input.playerId,
                  itemId,
                },
              },
              update: { quantity: { increment: change } },
              create: {
                playerId: input.playerId,
                itemId,
                quantity: change,
              },
            });
          } else if (change < 0) {
            const playerItem = await ctx.prisma.playerItem.findUnique({
              where: {
                playerId_itemId: {
                  playerId: input.playerId,
                  itemId,
                },
              },
            });

            if (playerItem) {
              if (playerItem.quantity + change <= 0) {
                await ctx.prisma.playerItem.delete({
                  where: { id: playerItem.id },
                });
              } else {
                await ctx.prisma.playerItem.update({
                  where: { id: playerItem.id },
                  data: { quantity: { increment: change } },
                });
              }
            }
          }
        }
      }

      // Get updated player
      const updatedPlayer = await ctx.prisma.player.findUnique({
        where: { id: input.playerId },
        include: {
          currentMask: true,
          inventory: { include: { item: true } },
        },
      });

      return {
        action,
        player: updatedPlayer,
        appliedEffects: effects,
        maskModifiers: currentMaskMod,
        newTime,
      };
    }),

  // Get actions by risk level
  getByRiskLevel: publicProcedure
    .input(z.enum(['low', 'medium', 'high']))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.action.findMany({
        where: { riskLevel: input },
      });
    }),
});

