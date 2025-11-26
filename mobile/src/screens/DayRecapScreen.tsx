import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

interface DayStats {
  day: number;
  energySpent: number;
  actionsCompleted: number;
  eventsEncountered: number;
  classesAttended: number;
}

interface RelationshipChange {
  npcId: string;
  npcName: string;
  change: number;
}

interface MaskSummary {
  maskId: string;
  maskName: string;
  maskSymbol: string;
  corruptionGained: number;
  totalCorruption: number;
  commentary: string;
}

interface DayRecapScreenProps {
  dayStats: DayStats;
  relationshipChanges: RelationshipChange[];
  maskSummary: MaskSummary;
  itemsGained: string[];
  onContinue: () => void;
}

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  color?: string;
}> = ({ label, value, icon, color = colors.text }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DayRecapScreen: React.FC<DayRecapScreenProps> = ({
  dayStats,
  relationshipChanges,
  maskSummary,
  itemsGained,
  onContinue,
}) => {
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

  const maskColor = getMaskColor(maskSummary.maskId);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.dayLabel}>Day {dayStats.day} Complete</Text>
            <Text style={styles.title}>Daily Recap</Text>
          </View>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection delay={200}>
          <View style={styles.statsGrid}>
            <StatCard
              label="Actions"
              value={dayStats.actionsCompleted}
              icon="⚡"
              color={colors.primary}
            />
            <StatCard
              label="Events"
              value={dayStats.eventsEncountered}
              icon="📅"
              color={colors.warning}
            />
            <StatCard
              label="Classes"
              value={dayStats.classesAttended}
              icon="📚"
              color={colors.info}
            />
            <StatCard
              label="Energy Used"
              value={dayStats.energySpent}
              icon="🔋"
              color={colors.success}
            />
          </View>
        </AnimatedSection>

        {/* Mask Commentary */}
        <AnimatedSection delay={400}>
          <View style={[styles.section, styles.maskSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.maskSymbol, { color: maskColor }]}>
                {maskSummary.maskSymbol}
              </Text>
              <Text style={styles.sectionTitle}>{maskSummary.maskName} speaks...</Text>
            </View>
            
            <View style={[styles.commentaryBox, { borderLeftColor: maskColor }]}>
              <Text style={[styles.commentaryText, { color: maskColor }]}>
                "{maskSummary.commentary}"
              </Text>
            </View>

            <View style={styles.corruptionRow}>
              <Text style={styles.corruptionLabel}>Corruption</Text>
              <View style={styles.corruptionBarContainer}>
                <View 
                  style={[
                    styles.corruptionBar, 
                    { 
                      width: `${maskSummary.totalCorruption}%`,
                      backgroundColor: maskSummary.totalCorruption > 75 
                        ? colors.danger 
                        : maskSummary.totalCorruption > 50 
                        ? colors.warning 
                        : maskColor,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.corruptionValue}>
                {maskSummary.totalCorruption}%
                {maskSummary.corruptionGained > 0 && (
                  <Text style={styles.corruptionGain}> (+{maskSummary.corruptionGained})</Text>
                )}
              </Text>
            </View>
          </View>
        </AnimatedSection>

        {/* Relationship Changes */}
        {relationshipChanges.length > 0 && (
          <AnimatedSection delay={600}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💕 Relationships</Text>
              {relationshipChanges.map((change, index) => (
                <View key={index} style={styles.relationshipRow}>
                  <Text style={styles.npcName}>{change.npcName}</Text>
                  <Text 
                    style={[
                      styles.relationshipChange,
                      { color: change.change > 0 ? colors.success : colors.danger }
                    ]}
                  >
                    {change.change > 0 ? '↑' : '↓'} {Math.abs(change.change)}
                  </Text>
                </View>
              ))}
            </View>
          </AnimatedSection>
        )}

        {/* Items Gained */}
        {itemsGained.length > 0 && (
          <AnimatedSection delay={800}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎁 Items Acquired</Text>
              <View style={styles.itemsRow}>
                {itemsGained.map((item, index) => (
                  <View key={index} style={styles.itemBadge}>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedSection>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue to Day {dayStats.day + 1}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dayLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  maskSection: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  maskSymbol: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  commentaryBox: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  commentaryText: {
    fontSize: fontSizes.md,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  corruptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corruptionLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  corruptionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundCard,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  corruptionBar: {
    height: '100%',
    borderRadius: 4,
  },
  corruptionValue: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  corruptionGain: {
    color: colors.warning,
  },
  relationshipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  npcName: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  relationshipChange: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  itemBadge: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  itemText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  continueButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DayRecapScreen;

