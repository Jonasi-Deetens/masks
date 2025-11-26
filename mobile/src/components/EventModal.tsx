import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

const { height } = Dimensions.get('window');

interface EventChoice {
  id: string;
  text: string;
  effect: {
    time?: number;
    relationship?: Record<string, number>;
    corruption?: number;
    item?: string | null;
  };
}

interface GameEvent {
  id: string;
  name: string;
  choices: EventChoice[];
}

interface EventModalProps {
  visible: boolean;
  event: GameEvent | null;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

// Mock event for testing
const mockEvent: GameEvent = {
  id: 'event_test',
  name: 'A Strange Encounter',
  choices: [
    {
      id: 'choice_1',
      text: 'Approach carefully',
      effect: { time: 10, corruption: 0 },
    },
    {
      id: 'choice_2',
      text: 'Ignore and walk away',
      effect: { time: 5, corruption: 0 },
    },
    {
      id: 'choice_3',
      text: 'Confront boldly',
      effect: { time: 15, corruption: 2 },
    },
  ],
};

const EventModal: React.FC<EventModalProps> = ({
  visible,
  event,
  onChoice,
  onClose,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  const displayEvent = event || (visible ? mockEvent : null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!displayEvent) return null;

  const handleChoicePress = (choiceId: string) => {
    // Animate out then call onChoice
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onChoice(choiceId);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Event Header */}
          <View style={styles.header}>
            <Text style={styles.eventIcon}>⚡</Text>
            <Text style={styles.eventTitle}>{displayEvent.name}</Text>
          </View>

          {/* Event Description */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Something unexpected happens. What will you do?
            </Text>
          </View>

          {/* Choices */}
          <View style={styles.choicesContainer}>
            {displayEvent.choices.map((choice, index) => (
              <TouchableOpacity
                key={choice.id}
                style={styles.choiceButton}
                onPress={() => handleChoicePress(choice.id)}
                activeOpacity={0.8}
              >
                <View style={styles.choiceNumber}>
                  <Text style={styles.choiceNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceText}>{choice.text}</Text>
                  <View style={styles.choiceEffects}>
                    {choice.effect.time && (
                      <Text style={styles.effectText}>
                        🕐 {choice.effect.time}min
                      </Text>
                    )}
                    {choice.effect.corruption !== undefined && choice.effect.corruption > 0 && (
                      <Text style={[styles.effectText, styles.corruptionText]}>
                        ⚠️ +{choice.effect.corruption} corruption
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.choiceArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Skip/Close option */}
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Skip this event</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eventIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  eventTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  descriptionBox: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  choicesContainer: {
    gap: spacing.sm,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  choiceNumberText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  choiceContent: {
    flex: 1,
  },
  choiceText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  choiceEffects: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  effectText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  corruptionText: {
    color: colors.warning,
  },
  choiceArrow: {
    color: colors.primary,
    fontSize: fontSizes.xl,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  skipButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.sm,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
});

export default EventModal;

