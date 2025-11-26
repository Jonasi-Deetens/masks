import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

type RootStackParamList = {
  MainMenu: undefined;
  MaskSelection: undefined;
  Game: undefined;
  Settings: undefined;
  Credits: undefined;
};

type MainMenuScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
};

const MenuButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  delay?: number;
}> = ({ title, onPress, variant = 'secondary', delay = 0 }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
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
      style={[
        styles.buttonContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.buttonTextPrimary,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ navigation }) => {
  const titleFade = React.useRef(new Animated.Value(0)).current;
  const subtitleFade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartGame = () => {
    navigation.navigate('MaskSelection');
  };

  const handleLoadGame = () => {
    // TODO: Implement load game functionality
    console.log('Load game');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleCredits = () => {
    navigation.navigate('Credits');
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientOverlay} />
      
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      {/* Title section */}
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, { opacity: titleFade }]}>
          🎭 MASKS
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
          A School Narrative
        </Animated.Text>
      </View>

      {/* Menu buttons */}
      <View style={styles.menuContainer}>
        <MenuButton
          title="Start Game"
          onPress={handleStartGame}
          variant="primary"
          delay={400}
        />
        <MenuButton title="Load Game" onPress={handleLoadGame} delay={500} />
        <MenuButton title="Settings" onPress={handleSettings} delay={600} />
        <MenuButton title="Credits" onPress={handleCredits} delay={700} />
      </View>

      {/* Version info */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.secondary,
    opacity: 0.05,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 8,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: 4,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    ...shadows.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  buttonTextPrimary: {
    color: colors.text,
  },
  version: {
    position: 'absolute',
    bottom: spacing.lg,
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});

export default MainMenuScreen;

