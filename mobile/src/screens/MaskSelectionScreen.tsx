import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';
import type { Mask } from '../types';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  MainMenu: undefined;
  MaskSelection: undefined;
  Game: { maskId: string };
  Settings: undefined;
  Credits: undefined;
};

type MaskSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MaskSelection'>;
};

// Initial masks available to player
const STARTER_MASKS: Mask[] = [
  {
    id: 'mask_joy',
    name: 'Akari',
    alias: 'Joy Mask',
    description: 'A radiant fox mask that floods its wearer with optimism and charm.',
    personality: 'Cheerful, enabling, obliviously manipulative',
    corruption: 0,
    abilities: { hint: true, dangerSense: false, illusion: false, empathy: true },
    dailyEffects: {
      dialogueColor: '#ffd6e8',
      overlay: 'mask_joy_overlay.png',
      bonusStats: { charm: 3, insight: 0, chaos: 0 },
    },
    corruptionTriggers: ['ignore_negative_emotion', 'fake_happiness'],
    unlockRequirements: [],
    image: 'mask_joy.png',
    symbol: '☺︎',
  },
  {
    id: 'mask_fear',
    name: 'Kage',
    alias: 'Fear Mask',
    description: 'A shadowed mask that warns the wearer of hidden danger.',
    personality: 'Hyper-alert, anxious, cautious to a fault',
    corruption: 0,
    abilities: { hint: false, dangerSense: true, illusion: false, empathy: false },
    dailyEffects: {
      dialogueColor: '#cbb9ff',
      overlay: 'mask_fear_overlay.png',
      bonusStats: { charm: 0, insight: 4, chaos: 0 },
    },
    corruptionTriggers: ['enter_dark_zone', 'threat_detected'],
    unlockRequirements: [],
    image: 'mask_fear.png',
    symbol: '⚠︎',
  },
  {
    id: 'mask_trick',
    name: 'Yoroi',
    alias: 'Trickster Mask',
    description: 'A playful mask that manipulates perception and rewards cleverness.',
    personality: 'Chaotic, witty, unpredictable',
    corruption: 0,
    abilities: { hint: false, dangerSense: false, illusion: true, empathy: false },
    dailyEffects: {
      dialogueColor: '#ffe9a8',
      overlay: 'mask_trick_overlay.png',
      bonusStats: { charm: 1, insight: 0, chaos: 3 },
    },
    corruptionTriggers: ['mislead_npc', 'illusion_backfire'],
    unlockRequirements: [],
    image: 'mask_trick.png',
    symbol: '♢',
  },
];

const MaskCard: React.FC<{
  mask: Mask;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ mask, isSelected, onSelect, index }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  React.useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected]);

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

  const maskColor = getMaskColor(mask.id);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isSelected && { borderColor: maskColor },
        ]}
        onPress={onSelect}
        activeOpacity={0.9}
      >
        {/* Mask Symbol */}
        <View style={[styles.symbolContainer, { backgroundColor: `${maskColor}20` }]}>
          <Text style={[styles.symbol, { color: maskColor }]}>{mask.symbol}</Text>
        </View>

        {/* Mask Info */}
        <Text style={styles.maskName}>{mask.name}</Text>
        <Text style={[styles.maskAlias, { color: maskColor }]}>{mask.alias}</Text>
        <Text style={styles.maskDescription}>{mask.description}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {Object.entries(mask.dailyEffects.bonusStats).map(([stat, value]) => (
            value !== 0 && (
              <View key={stat} style={styles.statBadge}>
                <Text style={styles.statText}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                </Text>
              </View>
            )
          ))}
        </View>

        {/* Abilities */}
        <View style={styles.abilitiesContainer}>
          {mask.abilities.hint && (
            <Text style={styles.abilityText}>💡 Hint</Text>
          )}
          {mask.abilities.dangerSense && (
            <Text style={styles.abilityText}>⚠️ Danger Sense</Text>
          )}
          {mask.abilities.illusion && (
            <Text style={styles.abilityText}>✨ Illusion</Text>
          )}
          {mask.abilities.empathy && (
            <Text style={styles.abilityText}>💜 Empathy</Text>
          )}
        </View>

        {isSelected && (
          <Animated.View
            style={[
              styles.selectedIndicator,
              { opacity: glowAnim, backgroundColor: maskColor },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const MaskSelectionScreen: React.FC<MaskSelectionScreenProps> = ({ navigation }) => {
  const [selectedMask, setSelectedMask] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedMask) {
      navigation.navigate('Game', { maskId: selectedMask });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Mask</Text>
        <Text style={styles.subtitle}>
          Your mask shapes your journey. Choose wisely.
        </Text>
      </View>

      {/* Mask Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.75 + spacing.md}
        decelerationRate="fast"
      >
        {STARTER_MASKS.map((mask, index) => (
          <MaskCard
            key={mask.id}
            mask={mask}
            isSelected={selectedMask === mask.id}
            onSelect={() => setSelectedMask(mask.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedMask && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedMask}
        >
          <Text style={styles.confirmButtonText}>
            {selectedMask ? 'Begin Journey' : 'Select a Mask'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  cardContainer: {
    width: width * 0.75,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.lg,
  },
  cardSelected: {
    borderWidth: 2,
  },
  symbolContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  symbol: {
    fontSize: 40,
  },
  maskName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  maskAlias: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  maskDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBadge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  abilityText: {
    fontSize: fontSizes.xs,
    color: colors.text,
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  confirmButtonText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
});

export default MaskSelectionScreen;

