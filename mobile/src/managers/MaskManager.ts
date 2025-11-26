// MaskManager - Handles mask selection, effects, corruption, and abilities

import type { Mask, MaskAbilities } from '../types';

export interface MaskState {
  maskId: string;
  corruption: number;
  isEquipped: boolean;
}

export interface CorruptionEffect {
  threshold: number;
  effect: string;
  description: string;
}

const CORRUPTION_EFFECTS: CorruptionEffect[] = [
  { threshold: 25, effect: 'mild', description: 'Slight personality shifts' },
  { threshold: 50, effect: 'moderate', description: 'NPCs notice changes in behavior' },
  { threshold: 75, effect: 'severe', description: 'Dark dialogue options unlock' },
  { threshold: 90, effect: 'critical', description: 'Nightmares and loss of control' },
  { threshold: 100, effect: 'consumed', description: 'Mask has taken over' },
];

class MaskManager {
  private currentMaskId: string | null = null;
  private ownedMasks: Map<string, MaskState> = new Map();
  private maskData: Map<string, Mask> = new Map();

  // Initialize with mask data
  setMaskData(masks: Mask[]): void {
    masks.forEach(mask => {
      this.maskData.set(mask.id, mask);
    });
  }

  // Set owned masks from player data
  setOwnedMasks(masks: { maskId: string; corruption: number }[]): void {
    masks.forEach(({ maskId, corruption }) => {
      this.ownedMasks.set(maskId, {
        maskId,
        corruption,
        isEquipped: maskId === this.currentMaskId,
      });
    });
  }

  // Equip a mask
  equipMask(maskId: string): boolean {
    if (!this.ownedMasks.has(maskId)) {
      console.warn(`Cannot equip mask ${maskId}: not owned`);
      return false;
    }

    // Unequip current mask
    if (this.currentMaskId) {
      const currentState = this.ownedMasks.get(this.currentMaskId);
      if (currentState) {
        currentState.isEquipped = false;
      }
    }

    // Equip new mask
    this.currentMaskId = maskId;
    const newState = this.ownedMasks.get(maskId);
    if (newState) {
      newState.isEquipped = true;
    }

    return true;
  }

  // Unequip current mask
  unequipMask(): void {
    if (this.currentMaskId) {
      const currentState = this.ownedMasks.get(this.currentMaskId);
      if (currentState) {
        currentState.isEquipped = false;
      }
      this.currentMaskId = null;
    }
  }

  // Get current mask
  getCurrentMask(): Mask | null {
    if (!this.currentMaskId) return null;
    return this.maskData.get(this.currentMaskId) ?? null;
  }

  // Get current mask ID
  getCurrentMaskId(): string | null {
    return this.currentMaskId;
  }

  // Add corruption to current mask
  addCorruption(amount: number): number {
    if (!this.currentMaskId) return 0;

    const state = this.ownedMasks.get(this.currentMaskId);
    if (!state) return 0;

    state.corruption = Math.min(100, Math.max(0, state.corruption + amount));
    return state.corruption;
  }

  // Reduce corruption (from items, rest, etc.)
  reduceCorruption(maskId: string, amount: number): number {
    const state = this.ownedMasks.get(maskId);
    if (!state) return 0;

    state.corruption = Math.max(0, state.corruption - amount);
    return state.corruption;
  }

  // Get corruption level for a mask
  getCorruption(maskId: string): number {
    return this.ownedMasks.get(maskId)?.corruption ?? 0;
  }

  // Get current mask's corruption
  getCurrentCorruption(): number {
    if (!this.currentMaskId) return 0;
    return this.getCorruption(this.currentMaskId);
  }

  // Get corruption effect for current level
  getCorruptionEffect(): CorruptionEffect | null {
    const corruption = this.getCurrentCorruption();
    
    // Find the highest threshold that's been passed
    let activeEffect: CorruptionEffect | null = null;
    for (const effect of CORRUPTION_EFFECTS) {
      if (corruption >= effect.threshold) {
        activeEffect = effect;
      }
    }
    
    return activeEffect;
  }

  // Check if a mask ability is available
  hasAbility(ability: keyof MaskAbilities): boolean {
    const mask = this.getCurrentMask();
    return mask?.abilities[ability] ?? false;
  }

  // Get mask bonus stats
  getBonusStats(): { charm: number; insight: number; chaos: number } {
    const mask = this.getCurrentMask();
    return mask?.dailyEffects.bonusStats ?? { charm: 0, insight: 0, chaos: 0 };
  }

  // Get dialogue color for current mask
  getDialogueColor(): string {
    const mask = this.getCurrentMask();
    return mask?.dailyEffects.dialogueColor ?? '#ffffff';
  }

  // Check if action triggers corruption
  checkCorruptionTrigger(action: string): number {
    const mask = this.getCurrentMask();
    if (!mask) return 0;

    // Check if action matches any corruption triggers
    const isTriggered = mask.corruptionTriggers.some(trigger => 
      action.toLowerCase().includes(trigger.toLowerCase())
    );

    if (isTriggered) {
      // Add 1-3 corruption based on action severity
      const corruptionGain = Math.floor(Math.random() * 3) + 1;
      return this.addCorruption(corruptionGain);
    }

    return this.getCurrentCorruption();
  }

  // Check if player can unlock a mask
  canUnlockMask(mask: Mask, playerState: {
    relationships: Record<string, number>;
    completedClasses: number;
    totalCorruption: number;
  }): boolean {
    if (mask.unlockRequirements.length === 0) return true;

    for (const requirement of mask.unlockRequirements) {
      if (requirement === 'experience_conflict') {
        // Requires specific event completion - handled externally
        continue;
      }
      if (requirement === 'experience_loss_event') {
        continue;
      }
      if (requirement === 'complete_three_classes') {
        if (playerState.completedClasses < 3) return false;
      }
      if (requirement === 'reach_relationship_60') {
        const hasHighRelationship = Object.values(playerState.relationships)
          .some(r => r >= 60);
        if (!hasHighRelationship) return false;
      }
      if (requirement === 'relationship_below_20') {
        const hasLowRelationship = Object.values(playerState.relationships)
          .some(r => r <= -20);
        if (!hasLowRelationship) return false;
      }
      if (requirement === 'corruption_50_all_masks') {
        // Check if all masks have 50+ corruption
        const allCorrupted = Array.from(this.ownedMasks.values())
          .every(m => m.corruption >= 50);
        if (!allCorrupted) return false;
      }
    }

    return true;
  }

  // Unlock a new mask
  unlockMask(maskId: string): boolean {
    if (this.ownedMasks.has(maskId)) {
      return false; // Already owned
    }

    this.ownedMasks.set(maskId, {
      maskId,
      corruption: 0,
      isEquipped: false,
    });

    return true;
  }

  // Get all owned masks
  getOwnedMasks(): MaskState[] {
    return Array.from(this.ownedMasks.values());
  }

  // Check if mask is owned
  ownsMask(maskId: string): boolean {
    return this.ownedMasks.has(maskId);
  }

  // Get mask symbol
  getMaskSymbol(maskId: string): string {
    return this.maskData.get(maskId)?.symbol ?? '🎭';
  }
}

export const maskManager = new MaskManager();
export default maskManager;

