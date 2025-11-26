import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';
import HUD from '../components/HUD';
import ZoneView from '../components/ZoneView';
import ActionList from '../components/ActionList';
import DialogueModal from '../components/DialogueModal';
import EventModal from '../components/EventModal';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  MainMenu: undefined;
  MaskSelection: undefined;
  Game: { maskId: string };
  Settings: undefined;
  Credits: undefined;
};

type GameScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

// Mock player state (will be replaced with tRPC queries)
const mockPlayer = {
  id: 'player_001',
  username: 'Player',
  energy: 100,
  mood: 'neutral',
  time: '08:00',
  reputation: 0,
  currentMaskId: 'mask_joy',
  zoneId: 'hallway_main',
};

// Mock zone data
const mockZone = {
  id: 'hallway_main',
  name: 'Main Hallway',
  type: 'hallway',
  description: 'Lockers line the walls; students rush between classes.',
};

// Mock NPCs in zone
const mockNPCs = [
  { id: 'rio', name: 'Rio Takahara', portrait: '😊' },
  { id: 'kaito', name: 'Kaito Morozumi', portrait: '😎' },
];

// Mock actions
const mockActions = [
  { id: 'talk_rio', name: 'Talk to Rio', timeCost: 15, riskLevel: 'low' },
  { id: 'explore', name: 'Explore Hallway', timeCost: 10, riskLevel: 'low' },
  { id: 'go_class', name: 'Go to Class', timeCost: 5, riskLevel: 'low' },
];

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { maskId } = route.params;
  const [player, setPlayer] = useState(mockPlayer);
  const [currentZone, setCurrentZone] = useState(mockZone);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<typeof mockNPCs[0] | null>(null);

  const handleNPCTap = (npc: typeof mockNPCs[0]) => {
    setSelectedNPC(npc);
    setShowDialogue(true);
  };

  const handleActionSelect = (actionId: string) => {
    // Execute action - update time, stats, etc.
    console.log('Executing action:', actionId);
    
    // Mock time advancement
    const [hours, minutes] = player.time.split(':').map(Number);
    const newMinutes = minutes + 15;
    const newHours = hours + Math.floor(newMinutes / 60);
    const finalMinutes = newMinutes % 60;
    
    setPlayer({
      ...player,
      time: `${String(newHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`,
      energy: Math.max(0, player.energy - 5),
    });
  };

  const handleZoneChange = (zoneId: string) => {
    console.log('Changing to zone:', zoneId);
    // Would trigger zone transition animation and load new zone
  };

  return (
    <View style={styles.container}>
      {/* HUD - Always visible at top */}
      <HUD
        energy={player.energy}
        mood={player.mood}
        time={player.time}
        reputation={player.reputation}
        maskId={maskId}
        onMenuPress={() => navigation.navigate('MainMenu')}
      />

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Zone View */}
        <ZoneView
          zone={currentZone}
          npcs={mockNPCs}
          onNPCTap={handleNPCTap}
          onHotspotTap={handleZoneChange}
        />

        {/* Actions Panel */}
        <View style={styles.actionsPanel}>
          <Text style={styles.actionsPanelTitle}>Available Actions</Text>
          <ActionList
            actions={mockActions}
            onActionSelect={handleActionSelect}
            playerEnergy={player.energy}
          />
        </View>
      </View>

      {/* Zone Navigation */}
      <View style={styles.zoneNav}>
        <TouchableOpacity
          style={styles.zoneNavButton}
          onPress={() => handleZoneChange('classroom_math')}
        >
          <Text style={styles.zoneNavButtonText}>📚 Classroom</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoneNavButton}
          onPress={() => handleZoneChange('cafeteria')}
        >
          <Text style={styles.zoneNavButtonText}>🍽️ Cafeteria</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoneNavButton}
          onPress={() => handleZoneChange('library')}
        >
          <Text style={styles.zoneNavButtonText}>📖 Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoneNavButton}
          onPress={() => handleZoneChange('courtyard')}
        >
          <Text style={styles.zoneNavButtonText}>🌳 Courtyard</Text>
        </TouchableOpacity>
      </View>

      {/* Dialogue Modal */}
      <DialogueModal
        visible={showDialogue}
        npc={selectedNPC}
        maskId={maskId}
        onClose={() => setShowDialogue(false)}
      />

      {/* Event Modal */}
      <EventModal
        visible={showEvent}
        event={null}
        onChoice={(choiceId) => {
          console.log('Choice made:', choiceId);
          setShowEvent(false);
        }}
        onClose={() => setShowEvent(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gameArea: {
    flex: 1,
  },
  actionsPanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.md,
    maxHeight: height * 0.35,
  },
  actionsPanelTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  zoneNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  zoneNavButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  zoneNavButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
});

export default GameScreen;

