import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

interface HeaderBarProps {
  totalEvents: number;
  onAddEvent: () => void;
  onShareAll: () => void;
  onImportEvents: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  totalEvents,
  onAddEvent,
  onShareAll,
  onImportEvents,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="compass" size={18} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.title}>HistMap</Text>
          <Text style={styles.subtitle}>{totalEvents} on-device records</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Import Events */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onImportEvents}
          accessibilityLabel="Import historical events from file"
        >
          <Ionicons name="download-outline" size={18} color={COLORS.primaryLight} />
        </TouchableOpacity>

        {/* Share All Events via AirDrop / Messages */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onShareAll}
          accessibilityLabel="Share all events via AirDrop or Text"
        >
          <Ionicons name="share-outline" size={18} color={COLORS.primaryLight} />
        </TouchableOpacity>

        {/* Add Event Button */}
        <TouchableOpacity style={styles.addBtn} onPress={onAddEvent} accessibilityLabel="Create Event">
          <Ionicons name="add" size={18} color={COLORS.background} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 54,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  addBtnText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
