import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSizes, borderRadius } from '../theme';

type RootStackParamList = {
  MainMenu: undefined;
  MaskSelection: undefined;
  Game: { maskId: string };
  Settings: undefined;
  Credits: undefined;
};

type CreditsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Credits'>;
};

interface CreditSectionProps {
  title: string;
  names: string[];
  delay: number;
}

const CreditSection: React.FC<CreditSectionProps> = ({ title, names, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.creditSection,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.creditTitle}>{title}</Text>
      {names.map((name, index) => (
        <Text key={index} style={styles.creditName}>
          {name}
        </Text>
      ))}
    </Animated.View>
  );
};

const CreditsScreen: React.FC<CreditsScreenProps> = ({ navigation }) => {
  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Game Title */}
        <Animated.View style={[styles.titleSection, { opacity: titleFade }]}>
          <Text style={styles.gameTitle}>🎭 MASKS</Text>
          <Text style={styles.gameSubtitle}>A School Narrative</Text>
        </Animated.View>

        {/* Credits */}
        <CreditSection
          title="Game Design & Story"
          names={['Jonas Deetens']}
          delay={200}
        />

        <CreditSection
          title="Programming"
          names={['Jonas Deetens', 'AI Assistant']}
          delay={400}
        />

        <CreditSection
          title="Art Direction"
          names={['TBD']}
          delay={600}
        />

        <CreditSection
          title="Music & Sound"
          names={['TBD']}
          delay={800}
        />

        <CreditSection
          title="Special Thanks"
          names={[
            'All playtesters',
            'The React Native community',
            'Everyone who supported this project',
          ]}
          delay={1000}
        />

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: titleFade }]}>
          <Text style={styles.footerText}>
            Made with ❤️ and many cups of ☕
          </Text>
          <Text style={styles.copyright}>
            © 2024 Masks Game. All rights reserved.
          </Text>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
  },
  gameSubtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  creditSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  creditTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  creditName: {
    fontSize: fontSizes.lg,
    color: colors.text,
    marginVertical: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  copyright: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
});

export default CreditsScreen;

