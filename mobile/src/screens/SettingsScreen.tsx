import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
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

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>{label}</Text>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
    {children}
  </View>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showHints, setShowHints] = useState(true);

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
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Audio Section */}
        <Text style={styles.sectionTitle}>Audio</Text>
        <View style={styles.section}>
          <SettingRow
            label="Sound Effects"
            description="Toggle game sound effects"
          >
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.surface, true: colors.primaryLight }}
              thumbColor={soundEnabled ? colors.primary : colors.textMuted}
            />
          </SettingRow>
          <SettingRow
            label="Background Music"
            description="Toggle background music"
          >
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: colors.surface, true: colors.primaryLight }}
              thumbColor={musicEnabled ? colors.primary : colors.textMuted}
            />
          </SettingRow>
        </View>

        {/* Gameplay Section */}
        <Text style={styles.sectionTitle}>Gameplay</Text>
        <View style={styles.section}>
          <SettingRow
            label="Vibration"
            description="Haptic feedback for interactions"
          >
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.surface, true: colors.primaryLight }}
              thumbColor={vibrationEnabled ? colors.primary : colors.textMuted}
            />
          </SettingRow>
          <SettingRow
            label="Auto-Save"
            description="Automatically save progress"
          >
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: colors.surface, true: colors.primaryLight }}
              thumbColor={autoSaveEnabled ? colors.primary : colors.textMuted}
            />
          </SettingRow>
          <SettingRow
            label="Show Hints"
            description="Display gameplay hints and tips"
          >
            <Switch
              value={showHints}
              onValueChange={setShowHints}
              trackColor={{ false: colors.surface, true: colors.primaryLight }}
              thumbColor={showHints ? colors.primary : colors.textMuted}
            />
          </SettingRow>
        </View>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Reset All Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2024.11.26</Text>
          </View>
        </View>
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
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  secondaryButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
});

export default SettingsScreen;

