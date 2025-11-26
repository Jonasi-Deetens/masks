# Masks Game - Mobile App

React Native mobile application for the School Masks narrative game.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on a simulator/emulator:
```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web (for quick testing)
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── HUD.tsx
│   │   ├── ZoneView.tsx
│   │   ├── ActionList.tsx
│   │   ├── DialogueModal.tsx
│   │   └── EventModal.tsx
│   ├── screens/          # Screen components
│   │   ├── MainMenuScreen.tsx
│   │   ├── MaskSelectionScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── CreditsScreen.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── store/            # State management (Zustand)
│   │   └── gameStore.ts
│   ├── theme/            # Styling constants
│   │   └── index.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── utils/            # Utilities and API
│       └── trpc.ts
├── App.tsx               # Root component
└── package.json
```

## Features

### Implemented
- Main Menu with animated UI
- Mask Selection screen with card carousel
- Game screen with HUD, zone view, and action system
- Dialogue system with NPC interactions
- Event modal for random/triggered events
- Settings screen with toggles
- Credits screen with animations
- Dark theme with mask-specific colors
- tRPC client setup for backend communication
- Zustand store for game state

### Planned
- Full backend integration
- Minigame implementations
- Day/Night cycle
- Inventory management
- Save/Load functionality
- Sound effects and music

## Development

### Running with Backend

1. Start the backend server:
```bash
cd ../backend
npm run dev
```

2. Update the API URL in `src/utils/trpc.ts` if needed

3. Run the mobile app:
```bash
npm start
```

### Building for Production

```bash
# Build for all platforms
expo build

# Or use EAS Build
eas build
```

## Theme Colors

The app uses a dark mystical theme with mask-specific accent colors:

- **Background**: Deep navy (#0F0F1A)
- **Primary**: Violet (#8B5CF6)
- **Secondary**: Amber (#F59E0B)
- **Mask Colors**: Each mask has its own color palette

See `src/theme/index.ts` for the complete color scheme.

