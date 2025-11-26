import { router } from '../trpc.js';
import { playerRouter } from './player.js';
import { masksRouter } from './masks.js';
import { npcsRouter } from './npcs.js';
import { zonesRouter } from './zones.js';
import { itemsRouter } from './items.js';
import { minigamesRouter } from './minigames.js';
import { eventsRouter } from './events.js';
import { actionsRouter } from './actions.js';

export const appRouter = router({
  player: playerRouter,
  masks: masksRouter,
  npcs: npcsRouter,
  zones: zonesRouter,
  items: itemsRouter,
  minigames: minigamesRouter,
  events: eventsRouter,
  actions: actionsRouter,
});

export type AppRouter = typeof appRouter;

