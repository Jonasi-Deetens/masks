import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

interface Zone {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface NPC {
  id: string;
  name: string;
  portrait: string;
}

interface ZoneViewProps {
  zone: Zone;
  npcs: NPC[];
  onNPCTap: (npc: NPC) => void;
  onHotspotTap: (zoneId: string) => void;
}

const getZoneBackground = (type: string): string => {
  const backgrounds: Record<string, string> = {
    class: colors.backgroundCard,
    hallway: colors.surface,
    special: colors.surfaceLight,
  };
  return backgrounds[type] || colors.surface;
};

const getZoneIcon = (name: string): string => {
  if (name.toLowerCase().includes('math')) return '📐';
  if (name.toLowerCase().includes('science')) return '🔬';
  if (name.toLowerCase().includes('history')) return '📜';
  if (name.toLowerCase().includes('literature')) return '📚';
  if (name.toLowerCase().includes('art')) return '🎨';
  if (name.toLowerCase().includes('music')) return '🎵';
  if (name.toLowerCase().includes('gym')) return '🏃';
  if (name.toLowerCase().includes('library')) return '📖';
  if (name.toLowerCase().includes('cafeteria')) return '🍽️';
  if (name.toLowerCase().includes('courtyard')) return '🌳';
  if (name.toLowerCase().includes('hallway')) return '🚪';
  if (name.toLowerCase().includes('nurse')) return '🏥';
  if (name.toLowerCase().includes('director')) return '🏛️';
  return '🏫';
};

const ZoneView: React.FC<ZoneViewProps> = ({
  zone,
  npcs,
  onNPCTap,
  onHotspotTap,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: getZoneBackground(zone.type) }]}>
      {/* Zone Header */}
      <View style={styles.header}>
        <Text style={styles.zoneIcon}>{getZoneIcon(zone.name)}</Text>
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneDescription}>{zone.description}</Text>
        </View>
      </View>

      {/* Zone Scene */}
      <View style={styles.scene}>
        {/* Decorative background elements */}
        <View style={styles.sceneDecor}>
          <View style={styles.decorLine1} />
          <View style={styles.decorLine2} />
          <View style={styles.decorCircle} />
        </View>

        {/* NPCs in scene */}
        <View style={styles.npcContainer}>
          {npcs.length > 0 ? (
            npcs.map((npc, index) => (
              <TouchableOpacity
                key={npc.id}
                style={[
                  styles.npcAvatar,
                  { left: `${20 + index * 25}%` },
                ]}
                onPress={() => onNPCTap(npc)}
                activeOpacity={0.8}
              >
                <View style={styles.npcBubble}>
                  <Text style={styles.npcEmoji}>{npc.portrait}</Text>
                </View>
                <Text style={styles.npcName}>{npc.name.split(' ')[0]}</Text>
                <View style={styles.interactHint}>
                  <Text style={styles.interactHintText}>Tap to talk</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyZone}>
              <Text style={styles.emptyZoneText}>No one is here right now...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Zone Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{zone.type.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  zoneIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  zoneDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scene: {
    flex: 1,
    position: 'relative',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  sceneDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorLine1: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.border,
  },
  decorLine2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.surface,
  },
  decorCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  npcContainer: {
    flex: 1,
    position: 'relative',
  },
  npcAvatar: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  npcBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  npcEmoji: {
    fontSize: 32,
  },
  npcName: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  interactHint: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  interactHintText: {
    color: colors.text,
    fontSize: fontSizes.xs,
  },
  emptyZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyZoneText: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    fontStyle: 'italic',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default ZoneView;

