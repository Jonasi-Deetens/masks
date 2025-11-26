import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

interface Action {
  id: string;
  name: string;
  timeCost: number;
  riskLevel: string;
}

interface ActionListProps {
  actions: Action[];
  onActionSelect: (actionId: string) => void;
  playerEnergy: number;
}

const getRiskColor = (risk: string): string => {
  const riskColors: Record<string, string> = {
    low: colors.success,
    medium: colors.warning,
    high: colors.danger,
  };
  return riskColors[risk] || colors.textSecondary;
};

const getRiskIcon = (risk: string): string => {
  const icons: Record<string, string> = {
    low: '✓',
    medium: '⚡',
    high: '⚠',
  };
  return icons[risk] || '•';
};

const ActionList: React.FC<ActionListProps> = ({
  actions,
  onActionSelect,
  playerEnergy,
}) => {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {actions.map((action) => {
        const canPerform = playerEnergy >= 10; // Basic energy check
        
        return (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              !canPerform && styles.actionItemDisabled,
            ]}
            onPress={() => canPerform && onActionSelect(action.id)}
            activeOpacity={canPerform ? 0.7 : 1}
            disabled={!canPerform}
          >
            <View style={styles.actionContent}>
              <Text style={[
                styles.actionName,
                !canPerform && styles.actionNameDisabled,
              ]}>
                {action.name}
              </Text>
              <View style={styles.actionMeta}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>🕐 {action.timeCost}min</Text>
                </View>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: `${getRiskColor(action.riskLevel)}20` },
                ]}>
                  <Text style={[
                    styles.riskText,
                    { color: getRiskColor(action.riskLevel) },
                  ]}>
                    {getRiskIcon(action.riskLevel)} {action.riskLevel}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actionArrow}>
              <Text style={[
                styles.arrowText,
                !canPerform && styles.arrowTextDisabled,
              ]}>
                →
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      
      {actions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No actions available here</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionItemDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surface,
  },
  actionContent: {
    flex: 1,
  },
  actionName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionNameDisabled: {
    color: colors.textMuted,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  timeText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  riskText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionArrow: {
    marginLeft: spacing.md,
  },
  arrowText: {
    fontSize: fontSizes.xl,
    color: colors.primary,
    fontWeight: '600',
  },
  arrowTextDisabled: {
    color: colors.textMuted,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    fontStyle: 'italic',
  },
});

export default ActionList;

