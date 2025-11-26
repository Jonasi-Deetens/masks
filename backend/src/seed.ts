import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');

const prisma = new PrismaClient();

function loadJson<T>(filename: string): T {
  const path = join(dataDir, filename);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

interface MaskData {
  id: string;
  name: string;
  alias: string;
  description: string;
  personality: string;
  corruption: number;
  abilities: Record<string, boolean>;
  dailyEffects: Record<string, unknown>;
  corruptionTriggers: string[];
  unlockRequirements: string[];
  image: string;
  symbol: string;
}

interface ZoneData {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface ItemData {
  id: string;
  name: string;
  type: string;
  description: string;
  effects: Record<string, unknown>;
  image: string;
}

interface NPCData {
  id: string;
  name: string;
  role: string;
  traits: string[];
  personality: string;
  schedule: Array<{ time: string; zoneId: string }>;
  relationship: number;
  rumorScore: number;
  reactions: Record<string, string>;
  events: string[];
  portrait: string;
}

interface MinigameData {
  id: string;
  classId: string;
  name: string;
  description: string;
  difficulty: number;
  maskModifiers: Record<string, Record<string, number>>;
  rewards: Record<string, number>;
}

interface EventData {
  id: string;
  name: string;
  triggerChance: number;
  triggerZones: string[];
  maskModifiers: Record<string, Record<string, string>>;
  choices: Array<{
    id: string;
    text: string;
    effect: Record<string, unknown>;
  }>;
}

interface ActionData {
  id: string;
  name: string;
  zone: string;
  preconditions: Record<string, unknown>;
  timeCost: number;
  effects: Record<string, unknown>;
  riskLevel: string;
  maskModifiers: Record<string, Record<string, unknown>>;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.playerEvent.deleteMany();
  await prisma.playerMinigame.deleteMany();
  await prisma.playerItem.deleteMany();
  await prisma.playerRelationship.deleteMany();
  await prisma.playerMask.deleteMany();
  await prisma.player.deleteMany();
  await prisma.action.deleteMany();
  await prisma.event.deleteMany();
  await prisma.minigame.deleteMany();
  await prisma.item.deleteMany();
  await prisma.nPC.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.mask.deleteMany();

  // Load and seed zones
  console.log('🗺️  Seeding zones...');
  const zones = loadJson<ZoneData[]>('zones.json');
  for (const zone of zones) {
    await prisma.zone.create({
      data: {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        description: zone.description,
      },
    });
  }
  console.log(`   ✓ Created ${zones.length} zones`);

  // Load and seed masks
  console.log('🎭 Seeding masks...');
  const masks = loadJson<MaskData[]>('masks.json');
  for (const mask of masks) {
    await prisma.mask.create({
      data: {
        id: mask.id,
        name: mask.name,
        alias: mask.alias,
        description: mask.description,
        personality: mask.personality,
        corruption: mask.corruption,
        abilities: mask.abilities,
        dailyEffects: mask.dailyEffects,
        corruptionTriggers: mask.corruptionTriggers,
        unlockRequirements: mask.unlockRequirements,
        image: mask.image,
        symbol: mask.symbol,
      },
    });
  }
  console.log(`   ✓ Created ${masks.length} masks`);

  // Load and seed items
  console.log('🎒 Seeding items...');
  const items = loadJson<ItemData[]>('items.json');
  for (const item of items) {
    await prisma.item.create({
      data: {
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        effects: item.effects,
        image: item.image,
      },
    });
  }
  console.log(`   ✓ Created ${items.length} items`);

  // Load and seed NPCs (students + teachers)
  console.log('👥 Seeding NPCs...');
  const students = loadJson<NPCData[]>('students.json');
  const teachers = loadJson<NPCData[]>('teachers.json');
  const allNPCs = [...students, ...teachers];

  for (const npc of allNPCs) {
    await prisma.nPC.create({
      data: {
        id: npc.id,
        name: npc.name,
        role: npc.role,
        traits: npc.traits,
        personality: npc.personality,
        schedule: npc.schedule,
        relationship: npc.relationship,
        rumorScore: npc.rumorScore,
        reactions: npc.reactions,
        events: npc.events,
        portrait: npc.portrait,
      },
    });
  }
  console.log(`   ✓ Created ${allNPCs.length} NPCs (${students.length} students, ${teachers.length} teachers)`);

  // Load and seed minigames
  console.log('🎮 Seeding minigames...');
  const minigames = loadJson<MinigameData[]>('minigames.json');
  for (const minigame of minigames) {
    await prisma.minigame.create({
      data: {
        id: minigame.id,
        classId: minigame.classId,
        name: minigame.name,
        description: minigame.description,
        difficulty: minigame.difficulty,
        maskModifiers: minigame.maskModifiers,
        rewards: minigame.rewards,
      },
    });
  }
  console.log(`   ✓ Created ${minigames.length} minigames`);

  // Load and seed events
  console.log('📅 Seeding events...');
  const events = loadJson<EventData[]>('events.json');
  for (const event of events) {
    await prisma.event.create({
      data: {
        id: event.id,
        name: event.name,
        triggerChance: event.triggerChance,
        triggerZones: event.triggerZones,
        maskModifiers: event.maskModifiers,
        choices: event.choices,
      },
    });
  }
  console.log(`   ✓ Created ${events.length} events`);

  // Load and seed actions
  console.log('⚡ Seeding actions...');
  const actions = loadJson<ActionData[]>('actions.json');
  for (const action of actions) {
    // Map zone names to zone IDs if needed
    let zoneId: string | null = null;
    if (action.zone && action.zone !== 'any') {
      const zone = zones.find(z => z.id === action.zone || z.name.toLowerCase().includes(action.zone.toLowerCase()));
      zoneId = zone?.id ?? null;
    }

    await prisma.action.create({
      data: {
        id: action.id,
        name: action.name,
        zoneId,
        preconditions: action.preconditions,
        timeCost: action.timeCost,
        effects: action.effects,
        riskLevel: action.riskLevel,
        maskModifiers: action.maskModifiers,
      },
    });
  }
  console.log(`   ✓ Created ${actions.length} actions`);

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`   - ${zones.length} zones`);
  console.log(`   - ${masks.length} masks`);
  console.log(`   - ${items.length} items`);
  console.log(`   - ${allNPCs.length} NPCs`);
  console.log(`   - ${minigames.length} minigames`);
  console.log(`   - ${events.length} events`);
  console.log(`   - ${actions.length} actions`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

