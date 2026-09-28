import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoricalEvent } from '../types/historical';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

interface TimelineControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onJumpToday: () => void;
  mode: 'active_only' | 'show_all' | 'window';
  onChangeMode: (mode: 'active_only' | 'show_all' | 'window') => void;
  activeCount: number;
  totalCount: number;
  selectedEvent?: HistoricalEvent | null;
  onOpenDetail?: () => void;
}

const SPEEDS = [
  { label: '1d/s', value: 1 / 365.25 },
  { label: '1m/s', value: 1 / 12 },
  { label: '1y/s', value: 1 },
  { label: '10y/s', value: 10 },
  { label: '50y/s', value: 50 },
  { label: '100y/s', value: 100 },
];

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  onStepPrev,
  onStepNext,
  onJumpToday,
  mode,
  onChangeMode,
  activeCount,
  totalCount,
  selectedEvent,
  onOpenDetail,
}) => {
  return (
    <View style={styles.container}>
      {/* Playback Button Group */}
      <View style={styles.buttonGroup}>
        {/* Step Prev */}
        <TouchableOpacity style={styles.iconButton} onPress={onStepPrev} accessibilityLabel="Previous Event">
          <Ionicons name="play-skip-back" size={16} color={COLORS.text} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={onTogglePlay}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color={isPlaying ? COLORS.background : COLORS.text}
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>

        {/* Step Next */}
        <TouchableOpacity style={styles.iconButton} onPress={onStepNext} accessibilityLabel="Next Event">
          <Ionicons name="play-skip-forward" size={16} color={COLORS.text} />
        </TouchableOpacity>

        {/* Today */}
        <TouchableOpacity style={styles.iconButton} onPress={onJumpToday} accessibilityLabel="Jump to Today">
          <Ionicons name="today-outline" size={16} color={COLORS.primaryLight} />
        </TouchableOpacity>

        {/* View Selected Event Detail Button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            selectedEvent && styles.detailButtonActive,
            !selectedEvent && styles.iconButtonDisabled,
          ]}
          onPress={onOpenDetail}
          disabled={!selectedEvent || !onOpenDetail}
          accessibilityLabel={
            selectedEvent
              ? `View details for "${selectedEvent.title}"`
              : 'No event selected'
          }
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={
              selectedEvent
                ? selectedEvent.color || COLORS.primaryLight
                : COLORS.textDim
            }
          />
        </TouchableOpacity>

        {/* Selected Event Title Pill */}
        {selectedEvent && onOpenDetail && (
          <TouchableOpacity
            style={[
              styles.selectedEventPill,
              { borderColor: selectedEvent.color || COLORS.borderHighlight },
            ]}
            onPress={onOpenDetail}
            accessibilityLabel={`Open details for "${selectedEvent.title}"`}
          >
            <View
              style={[
                styles.eventDot,
                { backgroundColor: selectedEvent.color || COLORS.primary },
              ]}
            />
            <Text style={styles.selectedEventText} numberOfLines={1}>
              {selectedEvent.title}
            </Text>
            <Ionicons name="open-outline" size={12} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Speed Selector */}
      <View style={styles.speedRow}>
        <Text style={styles.controlLabel}>Speed:</Text>
        {SPEEDS.map((s) => {
          const isSelected = Math.abs(speed - s.value) < 0.001;
          return (
            <TouchableOpacity
              key={s.label}
              style={[styles.speedChip, isSelected && styles.speedChipSelected]}
              onPress={() => onChangeSpeed(s.value)}
            >
              <Text style={[styles.speedChipText, isSelected && styles.speedChipTextSelected]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Map Filter Mode & Active Count */}
      <View style={styles.modeRow}>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'active_only' && styles.modeButtonActive]}
            onPress={() => onChangeMode('active_only')}
          >
            <Text style={[styles.modeButtonText, mode === 'active_only' && styles.modeButtonTextActive]}>
              Active Only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'window' && styles.modeButtonActive]}
            onPress={() => onChangeMode('window')}
          >
            <Text style={[styles.modeButtonText, mode === 'window' && styles.modeButtonTextActive]}>
              Window (±5y)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'show_all' && styles.modeButtonActive]}
            onPress={() => onChangeMode('show_all')}
          >
            <Text style={[styles.modeButtonText, mode === 'show_all' && styles.modeButtonTextActive]}>
              Show All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {activeCount}/{totalCount} Active
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.accent,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginRight: 2,
  },
  speedChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  speedChipSelected: {
    backgroundColor: COLORS.primary,
  },
  speedChipText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  speedChipTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  modeButtonText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  detailButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  selectedEventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 180,
  },
  eventDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  selectedEventText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
});
