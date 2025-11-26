import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'quest';
  description: string;
  effects: {
    energy?: number;
    mood?: string;
    relationship?: Record<string, number>;
  };
}

interface InventoryItem {
  item: Item;
  quantity: number;
}

interface InventoryModalProps {
  visible: boolean;
  inventory: InventoryItem[];
  onUseItem: (itemId: string) => void;
  onClose: () => void;
}

const getItemIcon = (type: string, name: string): string => {
  if (name.toLowerCase().includes('drink') || name.toLowerCase().includes('coffee')) return '🥤';
  if (name.toLowerCase().includes('snack') || name.toLowerCase().includes('candy')) return '🍫';
  if (name.toLowerCase().includes('book') || name.toLowerCase().includes('notebook')) return '📕';
  if (name.toLowerCase().includes('letter') || name.toLowerCase().includes('note')) return '✉️';
  if (name.toLowerCase().includes('mask')) return '🎭';
  if (name.toLowerCase().includes('charm') || name.toLowerCase().includes('lucky')) return '🍀';
  if (name.toLowerCase().includes('flashlight')) return '🔦';
  if (name.toLowerCase().includes('camera')) return '📷';
  
  if (type === 'consumable') return '💊';
  if (type === 'equipment') return '⚙️';
  if (type === 'quest') return '📜';
  
  return '📦';
};

const getTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    consumable: colors.success,
    equipment: colors.info,
    quest: colors.warning,
  };
  return typeColors[type] || colors.textSecondary;
};

const InventoryModal: React.FC<InventoryModalProps> = ({
  visible,
  inventory,
  onUseItem,
  onClose,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {
      consumable: [],
      equipment: [],
      quest: [],
    };
    
    inventory.forEach(item => {
      if (groups[item.item.type]) {
        groups[item.item.type].push(item);
      }
    });
    
    return groups;
  }, [inventory]);

  const renderItemCard = (invItem: InventoryItem) => {
    const { item, quantity } = invItem;
    const canUse = item.type === 'consumable';

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>{getItemIcon(item.type, item.name)}</Text>
        </View>
        
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>×{quantity}</Text>
          </View>
          <Text style={styles.itemDescription}>{item.description}</Text>
          
          {/* Effects preview */}
          <View style={styles.effectsRow}>
            {item.effects.energy && (
              <View style={styles.effectBadge}>
                <Text style={styles.effectText}>⚡ +{item.effects.energy}</Text>
              </View>
            )}
            {item.effects.mood && item.effects.mood !== 'neutral' && (
              <View style={styles.effectBadge}>
                <Text style={styles.effectText}>😊 {item.effects.mood}</Text>
              </View>
            )}
          </View>
        </View>

        {canUse && (
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => onUseItem(item.id)}
          >
            <Text style={styles.useButtonText}>Use</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSection = (title: string, items: InventoryItem[], type: string) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.typeDot, { backgroundColor: getTypeColor(type) }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{items.length}</Text>
        </View>
        {items.map(renderItemCard)}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎒 Inventory</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {inventory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={styles.emptyText}>Your inventory is empty</Text>
                <Text style={styles.emptySubtext}>
                  Find items around the school or receive them from NPCs
                </Text>
              </View>
            ) : (
              <>
                {renderSection('Consumables', groupedItems.consumable, 'consumable')}
                {renderSection('Equipment', groupedItems.equipment, 'equipment')}
                {renderSection('Quest Items', groupedItems.quest, 'quest')}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  itemQuantity: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  effectsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  effectBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  effectText: {
    fontSize: fontSizes.xs,
    color: colors.success,
  },
  useButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  useButtonText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default InventoryModal;

