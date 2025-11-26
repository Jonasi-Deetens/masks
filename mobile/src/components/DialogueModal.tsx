import React, { useState, useEffect } from 'react';
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

const { width, height } = Dimensions.get('window');

interface NPC {
  id: string;
  name: string;
  portrait: string;
}

interface DialogueModalProps {
  visible: boolean;
  npc: NPC | null;
  maskId: string;
  onClose: () => void;
}

// Mock dialogue based on mask
const getDialogue = (npcId: string, maskId: string): string[] => {
  const dialogues: Record<string, Record<string, string[]>> = {
    rio: {
      mask_joy: [
        "Oh, hi there! You seem really happy today.",
        "Your positive energy is... kind of calming.",
        "I wish I could be as cheerful as you.",
      ],
      mask_fear: [
        "H-hey... you look nervous. Is everything okay?",
        "I understand how you feel. The world can be scary.",
        "We can be anxious together, I guess...",
      ],
      mask_trick: [
        "Um, why are you looking at me like that?",
        "Are you planning something? I can never tell with you.",
        "Please don't prank me again...",
      ],
      default: [
        "Hello there.",
        "How are you doing today?",
        "Nice to see you.",
      ],
    },
    kaito: {
      mask_joy: [
        "Tch. You're way too cheerful. It's annoying.",
        "...but whatever. At least you're not boring.",
        "Just don't expect me to smile back.",
      ],
      mask_fear: [
        "What, you scared? Don't worry, I got your back.",
        "Nobody's gonna mess with you while I'm around.",
        "Stop shaking, it's embarrassing.",
      ],
      mask_trick: [
        "Hah! I like your style.",
        "Got any good pranks planned? I want in.",
        "Let's cause some chaos together!",
      ],
      default: [
        "Yo.",
        "What do you want?",
        "Make it quick.",
      ],
    },
  };

  const npcDialogues = dialogues[npcId] || {};
  return npcDialogues[maskId] || npcDialogues.default || ["..."];
};

const DialogueModal: React.FC<DialogueModalProps> = ({
  visible,
  npc,
  maskId,
  onClose,
}) => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const dialogue = npc ? getDialogue(npc.id, maskId) : [];

  useEffect(() => {
    if (visible) {
      setCurrentDialogueIndex(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentDialogueIndex < dialogue.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      onClose();
    }
  };

  if (!npc) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleNext}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* NPC Portrait */}
          <View style={styles.portraitContainer}>
            <View style={styles.portrait}>
              <Text style={styles.portraitEmoji}>{npc.portrait}</Text>
            </View>
            <Text style={styles.npcName}>{npc.name}</Text>
          </View>

          {/* Dialogue Box */}
          <View style={styles.dialogueBox}>
            <Text style={styles.dialogueText}>
              {dialogue[currentDialogueIndex]}
            </Text>
            
            {/* Progress indicators */}
            <View style={styles.progressContainer}>
              {dialogue.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentDialogueIndex && styles.progressDotActive,
                    index < currentDialogueIndex && styles.progressDotComplete,
                  ]}
                />
              ))}
            </View>

            {/* Continue hint */}
            <Text style={styles.continueHint}>
              {currentDialogueIndex < dialogue.length - 1 
                ? 'Tap to continue...' 
                : 'Tap to close'}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    minHeight: height * 0.35,
  },
  portraitContainer: {
    position: 'absolute',
    top: -50,
    left: spacing.lg,
    alignItems: 'center',
  },
  portrait: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.lg,
  },
  portraitEmoji: {
    fontSize: 40,
  },
  npcName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  dialogueBox: {
    marginTop: spacing.xxl + spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dialogueText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    lineHeight: 28,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  progressDotComplete: {
    backgroundColor: colors.success,
  },
  continueHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.lg,
  },
});

export default DialogueModal;

