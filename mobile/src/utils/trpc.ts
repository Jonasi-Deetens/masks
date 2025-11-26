import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/src/routers/index';

export const trpc = createTRPCReact<AppRouter>();

const API_URL = __DEV__ 
  ? 'http://localhost:3001/trpc'  // Development
  : 'https://your-production-url.com/trpc'; // Production

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: API_URL,
      transformer: superjson,
    }),
  ],
});

