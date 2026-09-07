import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoricalEvent } from '../types/historical';
import { formatEventDateRange } from '../utils/dateUtils';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

interface EventDetailModalProps {
  event: HistoricalEvent | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (event: HistoricalEvent) => void;
  onDelete: (eventId: string) => void;
  onJumpToEvent: (event: HistoricalEvent) => void;
  onShare: (event: HistoricalEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  visible,
  onClose,
  onEdit,
  onDelete,
  onJumpToEvent,
  onShare,
}) => {
  if (!event) return null;

  const dateRangeStr = formatEventDateRange(event);
  const categoryColor = COLORS.categories[event.category] || event.color || COLORS.primary;

  const geometryDesc = () => {
    if (event.geometry.type === 'point' && event.geometry.point) {
      return `GPS Point: ${event.geometry.point[0].toFixed(4)}°, ${event.geometry.point[1].toFixed(4)}°`;
    }
    if (event.geometry.type === 'path' && event.geometry.path) {
      return `Path / Route: ${event.geometry.path.length} waypoints`;
    }
    if (event.geometry.type === 'polygon' && event.geometry.polygon) {
      return `Territory / Region: ${event.geometry.polygon.length} boundary vertices`;
    }
    return 'Geometry unspecified';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                <Text style={styles.categoryBadgeText}>{event.category.toUpperCase()}</Text>
              </View>
              {event.isOngoing && (
                <View style={styles.ongoingBadge}>
                  <Text style={styles.ongoingBadgeText}>ONGOING</Text>
                </View>
              )}
              {event.hasNoStartDate && (
                <View style={styles.unboundedBadge}>
                  <Text style={styles.unboundedBadgeText}>ORIGIN UNKNOWN</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.title}>{event.title}</Text>

            {/* Date Range Banner */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primaryLight} />
              <Text style={styles.dateText}>{dateRangeStr}</Text>
            </View>

            {/* Spatial Geometry Info */}
            <View style={styles.infoRow}>
              <Ionicons
                name={
                  event.geometry.type === 'point'
                    ? 'location-outline'
                    : event.geometry.type === 'path'
                    ? 'trail-sign-outline'
                    : 'map-outline'
                }
                size={16}
                color={COLORS.accentGold}
              />
              <Text style={styles.geometryText}>{geometryDesc()}</Text>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>HISTORICAL NOTES & SOURCES</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{event.notes || 'No additional notes provided.'}</Text>
              </View>
            </View>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {event.tags.map((tag, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionJumpBtn]}
              onPress={() => onJumpToEvent(event)}
            >
              <Ionicons name="time-outline" size={16} color={COLORS.background} />
              <Text style={styles.actionJumpText}>Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(event)}>
              <Ionicons name="share-outline" size={16} color={COLORS.primaryLight} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(event)}>
              <Ionicons name="create-outline" size={16} color={COLORS.text} />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionDeleteBtn]}
              onPress={() => onDelete(event.id)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ongoingBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  ongoingBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  unboundedBadge: {
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  unboundedBadgeText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginVertical: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dateText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  geometryText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  notesBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.md,
  },
  tagChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  actionJumpBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  actionJumpText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
});
