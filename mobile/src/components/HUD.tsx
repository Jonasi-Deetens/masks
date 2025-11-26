import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../theme';

interface HUDProps {
  energy: number;
  mood: string;
  time: string;
  reputation: number;
  maskId: string;
  onMenuPress: () => void;
}

const getMaskSymbol = (maskId: string): string => {
  const symbols: Record<string, string> = {
    mask_joy: '☺︎',
    mask_fear: '⚠︎',
    mask_trick: '♢',
    mask_anger: '🔥',
    mask_sad: '☂︎',
    mask_wisdom: '✦',
    mask_love: '♥︎',
    mask_hatred: '⛧',
    mask_empty: '□',
  };
  return symbols[maskId] || '🎭';
};

const getMaskColor = (maskId: string): string => {
  const colorMap: Record<string, string> = {
    mask_joy: colors.maskJoy,
    mask_fear: colors.maskFear,
    mask_trick: colors.maskTrick,
    mask_anger: colors.maskAnger,
    mask_sad: colors.maskSad,
    mask_wisdom: colors.maskWisdom,
    mask_love: colors.maskLove,
    mask_hatred: colors.maskHatred,
    mask_empty: colors.maskEmpty,
  };
  return colorMap[maskId] || colors.primary;
};

const getMoodEmoji = (mood: string): string => {
  const moods: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    calm: '😌',
    excited: '😄',
    tired: '😫',
  };
  return moods[mood] || '😐';
};

const HUD: React.FC<HUDProps> = ({
  energy,
  mood,
  time,
  reputation,
  maskId,
  onMenuPress,
}) => {
  const maskColor = getMaskColor(maskId);
  const energyPercent = Math.max(0, Math.min(100, energy));
  
  return (
    <View style={styles.container}>
      {/* Top Row - Time & Menu */}
      <View style={styles.topRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>🕐 {time}</Text>
        </View>
        
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Mask Indicator */}
        <View style={[styles.maskIndicator, { borderColor: maskColor }]}>
          <Text style={[styles.maskSymbol, { color: maskColor }]}>
            {getMaskSymbol(maskId)}
          </Text>
        </View>

        {/* Energy Bar */}
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>⚡ Energy</Text>
          <View style={styles.energyBarContainer}>
            <View 
              style={[
                styles.energyBar, 
                { 
                  width: `${energyPercent}%`,
                  backgroundColor: energyPercent > 50 ? colors.success : 
                                   energyPercent > 25 ? colors.warning : 
                                   colors.danger,
                }
              ]} 
            />
          </View>
          <Text style={styles.statValue}>{energy}/100</Text>
        </View>

        {/* Mood */}
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Mood</Text>
          <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
        </View>

        {/* Reputation */}
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Rep</Text>
          <Text style={[
            styles.statValue,
            { color: reputation > 0 ? colors.success : 
                     reputation < 0 ? colors.danger : 
                     colors.text }
          ]}>
            {reputation > 0 ? '+' : ''}{reputation}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    paddingTop: spacing.xxl + spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  timeText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuButtonText: {
    color: colors.text,
    fontSize: fontSizes.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  maskIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  maskSymbol: {
    fontSize: 22,
  },
  statContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginBottom: 2,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  energyBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  energyBar: {
    height: '100%',
    borderRadius: 4,
  },
  moodEmoji: {
    fontSize: 24,
  },
});

export default HUD;

