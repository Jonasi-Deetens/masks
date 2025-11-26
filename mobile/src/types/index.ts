// Mask types
export interface MaskAbilities {
  hint: boolean;
  dangerSense: boolean;
  illusion: boolean;
  empathy: boolean;
}

export interface MaskDailyEffects {
  dialogueColor: string;
  overlay: string;
  bonusStats: {
    charm: number;
    insight: number;
    chaos: number;
  };
}

export interface Mask {
  id: string;
  name: string;
  alias: string;
  description: string;
  personality: string;
  corruption: number;
  abilities: MaskAbilities;
  dailyEffects: MaskDailyEffects;
  corruptionTriggers: string[];
  unlockRequirements: string[];
  image: string;
  symbol: string;
}

// NPC types
export interface NPCScheduleSlot {
  time: string;
  zoneId: string;
}

export interface NPC {
  id: string;
  name: string;
  role: 'Student' | 'Teacher' | 'Director';
  traits: string[];
  personality: string;
  schedule: NPCScheduleSlot[];
  relationship: number;
  rumorScore: number;
  reactions: Record<string, string>;
  events: string[];
  portrait: string;
}

// Zone types
export interface Zone {
  id: string;
  name: string;
  type: 'class' | 'hallway' | 'special';
  description: string | null;
}

// Item types
export interface ItemEffects {
  energy?: number;
  mood?: string;
  relationship?: Record<string, number>;
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'quest';
  description: string;
  effects: ItemEffects;
  image: string;
}

// Event types
export interface EventChoice {
  id: string;
  text: string;
  effect: {
    time?: number;
    relationship?: Record<string, number>;
    corruption?: number;
    item?: string | null;
  };
}

export interface GameEvent {
  id: string;
  name: string;
  triggerChance: number;
  triggerZones: string[];
  maskModifiers: Record<string, Record<string, string>>;
  choices: EventChoice[];
}

// Action types
export interface ActionEffects {
  reputation?: number;
  grade?: number;
  maskCorruption?: number;
  relationships?: Record<string, number>;
  energy?: number;
  items?: Record<string, number>;
}

export interface Action {
  id: string;
  name: string;
  zoneId: string | null;
  preconditions: Record<string, unknown>;
  timeCost: number;
  effects: ActionEffects;
  riskLevel: 'low' | 'medium' | 'high';
  maskModifiers: Record<string, Record<string, unknown>>;
}

// Minigame types
export interface MinigameRewards {
  grade?: number;
  insight?: number;
  charm?: number;
  chaos?: number;
}

export interface Minigame {
  id: string;
  classId: string;
  name: string;
  description: string;
  difficulty: number;
  maskModifiers: Record<string, Record<string, number>>;
  rewards: MinigameRewards;
}

// Player types
export interface PlayerInventoryItem {
  itemId: string;
  quantity: number;
  item: Item;
}

export interface PlayerRelationship {
  npcId: string;
  affinity: number;
  npc: NPC;
}

export interface PlayerMask {
  maskId: string;
  corruption: number;
  mask: Mask;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  grade: number;
  className: string;
  currentMaskId: string | null;
  currentMask: Mask | null;
  masksOwned: PlayerMask[];
  energy: number;
  mood: string;
  time: string;
  reputation: number;
  zoneId: string | null;
  location: Zone | null;
  inventory: PlayerInventoryItem[];
  relationships: PlayerRelationship[];
}

