# Masks Game Backend

Backend server for the School Masks narrative game built with Node.js, tRPC, Prisma, and PostgreSQL.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your database connection:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/masks_game?schema=public"
PORT=3001
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push the schema to your database:
```bash
npm run db:push
```

5. Seed the database with game data:
```bash
npm run db:seed
```

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

The server exposes a tRPC API at `http://localhost:3001/trpc`

### Available Routers

- **player** - Player CRUD, stats, inventory, relationships
- **masks** - Mask data, corruption tracking
- **npcs** - NPC data, schedules, reactions
- **zones** - Zone data, available actions/events
- **items** - Item data, inventory management
- **minigames** - Minigame data, progress tracking
- **events** - Random/triggered events, choices
- **actions** - Time-based actions with effects

### Health Check

```
GET /health
```

## Database

Run Prisma Studio to browse the database:
```bash
npm run db:studio
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── routers/          # tRPC routers
│   │   ├── player.ts
│   │   ├── masks.ts
│   │   ├── npcs.ts
│   │   ├── zones.ts
│   │   ├── items.ts
│   │   ├── minigames.ts
│   │   ├── events.ts
│   │   ├── actions.ts
│   │   └── index.ts
│   ├── db.ts             # Prisma client
│   ├── trpc.ts           # tRPC setup
│   ├── seed.ts           # Database seeder
│   └── index.ts          # Express server
└── package.json
```

