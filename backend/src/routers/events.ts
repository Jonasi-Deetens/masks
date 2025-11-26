import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const eventsRouter = router({
  // Get all events
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.event.findMany({
        orderBy: { name: 'asc' },
      });
    }),

  // Get event by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUnique({
        where: { id: input },
      });
    }),

  // Get events for a zone
  getByZone: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        where: {
          triggerZones: { has: input },
        },
      });
    }),

  // Get random event for zone (based on trigger chance)
  getRandomEvent: publicProcedure
    .input(z.object({
      zoneId: z.string(),
      playerId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Get all events for zone that player hasn't completed
      const completedEvents = await ctx.prisma.playerEvent.findMany({
        where: { playerId: input.playerId, completed: true },
        select: { eventId: true },
      });
      const completedIds = completedEvents.map(e => e.eventId);

      const events = await ctx.prisma.event.findMany({
        where: {
          triggerZones: { has: input.zoneId },
          id: { notIn: completedIds },
        },
      });

      if (events.length === 0) return null;

      // Roll for event based on trigger chance
      const roll = Math.random() * 100;
      let cumulative = 0;

      for (const event of events) {
        cumulative += event.triggerChance;
        if (roll <= cumulative) {
          return event;
        }
      }

      return null;
    }),

  // Get player's completed events
  getPlayerEvents: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.playerEvent.findMany({
        where: { playerId: input },
        include: { event: true },
      });
    }),

  // Make a choice in an event
  makeChoice: publicProcedure
    .input(z.object({
      playerId: z.string(),
      eventId: z.string(),
      choiceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event) throw new Error('Event not found');

      const choices = event.choices as Array<{
        id: string;
        text: string;
        effect: {
          time?: number;
          relationship?: Record<string, number>;
          corruption?: number;
          item?: string | null;
        };
      }>;

      const choice = choices.find(c => c.id === input.choiceId);
      if (!choice) throw new Error('Choice not found');

      const effects = choice.effect;

      // Apply time cost
      if (effects.time) {
        const player = await ctx.prisma.player.findUnique({
          where: { id: input.playerId },
        });
        if (player) {
          const [hours, minutes] = player.time.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + effects.time;
          const newHours = Math.floor(totalMinutes / 60) % 24;
          const newMinutes = totalMinutes % 60;
          const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

          await ctx.prisma.player.update({
            where: { id: input.playerId },
            data: { time: newTime },
          });
        }
      }

      // Apply relationship changes
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

      // Apply mask corruption
      if (effects.corruption) {
        const player = await ctx.prisma.player.findUnique({
          where: { id: input.playerId },
          include: { masksOwned: true },
        });

        if (player?.currentMaskId) {
          await ctx.prisma.playerMask.updateMany({
            where: {
              playerId: input.playerId,
              maskId: player.currentMaskId,
            },
            data: {
              corruption: { increment: effects.corruption },
            },
          });
        }
      }

      // Add item if awarded
      if (effects.item) {
        await ctx.prisma.playerItem.upsert({
          where: {
            playerId_itemId: {
              playerId: input.playerId,
              itemId: effects.item,
            },
          },
          update: { quantity: { increment: 1 } },
          create: {
            playerId: input.playerId,
            itemId: effects.item,
            quantity: 1,
          },
        });
      }

      // Mark event as completed
      const playerEvent = await ctx.prisma.playerEvent.upsert({
        where: {
          playerId_eventId: {
            playerId: input.playerId,
            eventId: input.eventId,
          },
        },
        update: {
          completed: true,
          choiceMade: input.choiceId,
        },
        create: {
          playerId: input.playerId,
          eventId: input.eventId,
          completed: true,
          choiceMade: input.choiceId,
        },
        include: { event: true },
      });

      return {
        playerEvent,
        appliedEffects: effects,
      };
    }),
});

