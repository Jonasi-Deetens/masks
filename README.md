# 🎭 Masks - A School Narrative Game

A React Native narrative game where you navigate high school life while wearing mystical masks that alter your personality and interactions.

## Overview

In **Masks**, you play as a student who discovers they can wear supernatural masks, each representing a different emotion or personality trait. Your choices, the mask you wear, and your relationships with NPCs all influence the story and its multiple endings.

## Features

- **9 Unique Masks**: Joy, Fear, Trickster, Anger, Sorrow, Wisdom, Love, Hatred, and Void
- **30+ NPCs**: Students, teachers, and school staff with unique personalities
- **Dynamic Dialogue**: Conversations change based on your current mask
- **Time-Based Actions**: Manage your day through classes, clubs, and social interactions
- **Event System**: Random and triggered events with branching choices
- **Mask Corruption**: Using masks has consequences - watch your corruption levels
- **Minigames**: Class-based minigames affected by your mask abilities
- **Night Exploration**: Unlock nighttime zones and spirit missions

## Project Structure

```
Coding/
├── data/                 # Game data (JSON files)
│   ├── masks.json
│   ├── students.json
│   ├── teachers.json
│   ├── zones.json
│   ├── items.json
│   ├── events.json
│   ├── actions.json
│   ├── minigames.json
│   └── player.json
├── backend/              # Node.js + tRPC + Prisma backend
│   ├── prisma/
│   ├── src/
│   │   ├── routers/     # tRPC routers
│   │   ├── seed.ts      # Database seeder
│   │   └── index.ts     # Server entry
│   └── package.json
└── mobile/               # React Native Expo app
    ├── src/
    │   ├── screens/     # App screens
    │   ├── components/  # UI components
    │   ├── navigation/  # React Navigation
    │   ├── store/       # Zustand state
    │   └── theme/       # Styling
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (for backend)
- Expo CLI (for mobile)

### Backend Setup

```bash
cd backend
npm install
# Create .env file with DATABASE_URL
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npm start
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **API**: tRPC
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod

### Mobile
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State**: Zustand
- **API Client**: tRPC + React Query
- **Styling**: React Native StyleSheet

## Game Mechanics

### Masks
Each mask provides different abilities and affects NPC interactions:
- **Joy (Akari)**: Charm bonus, empathy ability
- **Fear (Kage)**: Insight bonus, danger sense
- **Trickster (Yoroi)**: Chaos bonus, illusion ability
- And 6 more...

### Corruption
Using masks increases corruption over time. High corruption can:
- Unlock dark dialogue options
- Trigger nightmares
- Change NPC reactions
- Lead to different endings

### Time System
Each action costs time. Manage your day wisely:
- Morning: Classes and clubs
- Afternoon: Free time and events
- Night: Mask-specific exploration (unlockable)

## License

MIT License - see LICENSE file for details.

## Credits

- Game Design: Jonas Deetens
- Development: Jonas Deetens + AI Assistant

