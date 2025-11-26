import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';
import { trpc } from '../utils/trpc';
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

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { maskId } = route.params;
  
  // Local player state (will be persisted to DB later)
  const [player, setPlayer] = useState({
    id: 'local_player',
    username: 'Player',
    energy: 100,
    mood: 'neutral',
    time: '08:00',
    reputation: 0,
    currentMaskId: maskId,
    zoneId: 'hallway_main',
  });
  
  const [currentZoneId, setCurrentZoneId] = useState('hallway_main');
  const [showDialogue, setShowDialogue] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<{ id: string; name: string; portrait: string } | null>(null);

  // Fetch current zone with NPCs based on time
  const { data: zoneData, isLoading: zoneLoading } = trpc.zones.getWithNPCs.useQuery({
    zoneId: currentZoneId,
    time: player.time,
  });

  // Fetch actions for current zone
  const { data: actions, isLoading: actionsLoading } = trpc.zones.getActions.useQuery(currentZoneId);

  // Fetch all zones for navigation
  const { data: allZones } = trpc.zones.getAll.useQuery();

  // Fetch current mask data
  const { data: currentMask } = trpc.masks.getById.useQuery(maskId);

  const currentZone = zoneData?.zone;
  const npcsInZone = zoneData?.npcs || [];

  // Map NPCs to the format expected by ZoneView
  const mappedNPCs = npcsInZone.map(npc => ({
    id: npc.id,
    name: npc.name,
    portrait: npc.portrait || '👤',
  }));

  // Map actions to the format expected by ActionList
  const mappedActions = (actions || []).map(action => ({
    id: action.id,
    name: action.name,
    timeCost: action.timeCost,
    riskLevel: action.riskLevel,
  }));

  const handleNPCTap = (npc: { id: string; name: string; portrait: string }) => {
    setSelectedNPC(npc);
    setShowDialogue(true);
  };

  const handleActionSelect = (actionId: string) => {
    const action = actions?.find(a => a.id === actionId);
    const timeCost = action?.timeCost || 15;
    
    // Advance time
    const [hours, minutes] = player.time.split(':').map(Number);
    const newMinutes = minutes + timeCost;
    const newHours = hours + Math.floor(newMinutes / 60);
    const finalMinutes = newMinutes % 60;
    
    setPlayer({
      ...player,
      time: `${String(newHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`,
      energy: Math.max(0, player.energy - 5),
    });
  };

  const handleZoneChange = (zoneId: string) => {
    setCurrentZoneId(zoneId);
    setPlayer(prev => ({ ...prev, zoneId }));
  };

  // Quick access zones for navigation bar
  const quickAccessZones = allZones?.filter(z => 
    ['classroom_math', 'cafeteria', 'library', 'courtyard', 'hallway_main'].includes(z.id)
  ).slice(0, 4) || [];

  const zoneEmojis: Record<string, string> = {
    classroom: '📚',
    cafeteria: '🍽️',
    library: '📖',
    courtyard: '🌳',
    hallway: '🚶',
    rooftop: '🌤️',
    gym: '🏃',
    auditorium: '🎭',
  };

  const getZoneEmoji = (zoneType: string) => zoneEmojis[zoneType] || '📍';

  if (zoneLoading && !currentZone) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading zone...</Text>
      </View>
    );
  }

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
          zone={currentZone || { id: currentZoneId, name: 'Loading...', type: 'hallway', description: '' }}
          npcs={mappedNPCs}
          onNPCTap={handleNPCTap}
          onHotspotTap={handleZoneChange}
        />

        {/* Actions Panel */}
        <View style={styles.actionsPanel}>
          <Text style={styles.actionsPanelTitle}>
            Available Actions {actionsLoading && '(loading...)'}
          </Text>
          <ActionList
            actions={mappedActions}
            onActionSelect={handleActionSelect}
            playerEnergy={player.energy}
          />
        </View>
      </View>

      {/* Zone Navigation */}
      <View style={styles.zoneNav}>
        {quickAccessZones.length > 0 ? (
          quickAccessZones.map(zone => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneNavButton,
                currentZoneId === zone.id && styles.zoneNavButtonActive
              ]}
              onPress={() => handleZoneChange(zone.id)}
            >
              <Text style={styles.zoneNavButtonText}>
                {getZoneEmoji(zone.type)} {zone.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <>
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
          </>
        )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    marginTop: spacing.md,
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
  zoneNavButtonActive: {
    backgroundColor: colors.primary + '30',
    borderRadius: borderRadius.md,
  },
  zoneNavButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
});

export default GameScreen;

