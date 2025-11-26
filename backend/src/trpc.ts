import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from './db.js';

export type Context = {
  prisma: typeof prisma;
};

export const createContext = (): Context => {
  return { prisma };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

