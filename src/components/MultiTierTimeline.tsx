import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
} from 'react-native';
import { HistoricalEvent, HistoricalDate } from '../types/historical';
import { dateToDecimalYear, decimalYearToDate, formatHistoricalDate } from '../utils/dateUtils';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

interface MultiTierTimelineProps {
  currentDecimalYear: number;
  onTimeChange: (newDecimalYear: number) => void;
  events: HistoricalEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}

const ERA_PRESETS = [
  { label: '3000 BCE', year: -3000, desc: 'Bronze Age' },
  { label: '500 BCE', year: -500, desc: 'Classical Greece' },
  { label: '1 CE', year: 1, desc: 'Pax Romana' },
  { label: '1066 CE', year: 1066, desc: 'Middle Ages' },
  { label: '1500 CE', year: 1500, desc: 'Age of Discovery' },
  { label: '1815 CE', year: 1815, desc: 'Waterloo' },
  { label: '1969 CE', year: 1969.55, desc: 'Moon Landing' },
  { label: 'Today', year: 2026, desc: 'Present' },
];

export const MultiTierTimeline: React.FC<MultiTierTimelineProps> = ({
  currentDecimalYear,
  onTimeChange,
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const [activeTier, setActiveTier] = useState<'macro' | 'meso' | 'micro'>('meso');
  const [macroRange] = useState({ min: -4000, max: 2100 }); // 6100 years span
  const mesoWindow = 60; // +/- 30 years around current year

  // Layout width state for scrubbing
  const [tier1Width, setTier1Width] = useState(360);
  const [tier2Width, setTier2Width] = useState(360);
  const [tier3Width, setTier3Width] = useState(360);

  // Formatted date string for current time
  const currentDate = useMemo(() => {
    return decimalYearToDate(currentDecimalYear, 'hour');
  }, [currentDecimalYear]);

  // Current display string
  const currentFormatted = useMemo(() => {
    return formatHistoricalDate(currentDate, true);
  }, [currentDate]);

  // Tier 1 (Macro) Pan Responder
  const macroPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          handleMacroTouch(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          handleMacroTouch(evt.nativeEvent.locationX);
        },
      }),
    [tier1Width]
  );

  const handleMacroTouch = (x: number) => {
    if (tier1Width <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / tier1Width));
    const newYear = macroRange.min + ratio * (macroRange.max - macroRange.min);
    onTimeChange(parseFloat(newYear.toFixed(2)));
  };

  // Tier 2 (Meso: Decades & Years) Pan Responder
  const mesoPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          handleMesoTouch(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          handleMesoTouch(evt.nativeEvent.locationX);
        },
      }),
    [tier2Width, currentDecimalYear]
  );

  const handleMesoTouch = (x: number) => {
    if (tier2Width <= 0) return;
    // Ratio relative to center
    const centerRatio = (x - tier2Width / 2) / (tier2Width / 2);
    // Delta in years (+/- 30 years)
    const deltaYears = centerRatio * (mesoWindow / 2);
    const newYear = currentDecimalYear + deltaYears * 0.08; // smooth scrub delta
    onTimeChange(parseFloat(newYear.toFixed(3)));
  };

  // Tier 3 (Micro: Months & Days & Hours) Pan Responder
  const microPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          handleMicroTouch(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          handleMicroTouch(evt.nativeEvent.locationX);
        },
      }),
    [tier3Width, currentDecimalYear]
  );

  const handleMicroTouch = (x: number) => {
    if (tier3Width <= 0) return;
    // Window is 1 full year (fraction 0 to 1) or months
    const ratio = Math.max(0, Math.min(1, x / tier3Width));
    const yearBase = Math.floor(currentDecimalYear);
    const newYear = yearBase + ratio;
    onTimeChange(parseFloat(newYear.toFixed(6)));
  };

  // Calculate Macro needle position
  const macroCursorLeft = useMemo(() => {
    const ratio = (currentDecimalYear - macroRange.min) / (macroRange.max - macroRange.min);
    return Math.max(0, Math.min(tier1Width, ratio * tier1Width));
  }, [currentDecimalYear, tier1Width, macroRange]);

  // Meso range around current year
  const mesoMin = Math.round(currentDecimalYear - mesoWindow / 2);
  const mesoMax = Math.round(currentDecimalYear + mesoWindow / 2);

  // Micro: fraction of current year (0 to 1)
  const microFraction = currentDecimalYear - Math.floor(currentDecimalYear);
  const microCursorLeft = Math.max(0, Math.min(tier3Width, microFraction * tier3Width));

  // Find events occurring close to current year to render on Meso tier
  const nearbyEvents = useMemo(() => {
    return events.filter(e => {
      const s = e.startDate ? dateToDecimalYear(e.startDate) : -Infinity;
      const end = e.isOngoing ? Infinity : (e.endDate ? dateToDecimalYear(e.endDate) : s);
      return s <= mesoMax && end >= mesoMin;
    });
  }, [events, mesoMin, mesoMax]);

  return (
    <View style={styles.container}>
      {/* Current Date Display Banner */}
      <View style={styles.dateHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeLabel}>CURRENT TIME</Text>
          <Text style={styles.dateBadgeValue}>{currentFormatted}</Text>
        </View>

        {/* Era Presets Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsList}>
          {ERA_PRESETS.map((preset, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.presetChip,
                Math.abs(currentDecimalYear - preset.year) < 20 && styles.presetChipActive
              ]}
              onPress={() => onTimeChange(preset.year)}
            >
              <Text style={styles.presetChipText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TIER 1: MACRO SCALE (Millennia / Centuries: -4000 to +2100) */}
      <View style={styles.tierSection}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierTitle}>TIER 1: MACRO ERA (4000 BCE — 2100 CE)</Text>
          <Text style={styles.tierSubtitle}>Tap or drag to scrub centuries</Text>
        </View>
        <View
          style={styles.macroTrack}
          onLayout={(e) => setTier1Width(e.nativeEvent.layout.width)}
          {...macroPanResponder.panHandlers}
        >
          {/* Major Millennium Ticks */}
          {[-3000, -2000, -1000, 0, 1000, 2000].map((yr) => {
            const ratio = (yr - macroRange.min) / (macroRange.max - macroRange.min);
            const left = ratio * tier1Width;
            return (
              <View key={yr} style={[styles.macroTick, { left }]}>
                <View style={styles.macroTickLine} />
                <Text style={styles.macroTickText}>
                  {yr <= 0 ? `${Math.abs(yr) || 1}B` : `${yr}`}
                </Text>
              </View>
            );
          })}

          {/* Event Dots on Macro track */}
          {events.map((e) => {
            if (!e.startDate) return null;
            const yr = dateToDecimalYear(e.startDate);
            const ratio = (yr - macroRange.min) / (macroRange.max - macroRange.min);
            if (ratio < 0 || ratio > 1) return null;
            return (
              <View
                key={e.id}
                style={[
                  styles.macroEventDot,
                  { left: ratio * tier1Width, backgroundColor: e.color || COLORS.primary }
                ]}
              />
            );
          })}

          {/* Macro Scrubber Needle */}
          <View style={[styles.needle, { left: macroCursorLeft }]}>
            <View style={styles.needleHead} />
          </View>
        </View>
      </View>

      {/* TIER 2: MESO SCALE (Decades & Years: Window of 60 years) */}
      <View style={styles.tierSection}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierTitle}>
            TIER 2: YEARS & DECADES ({mesoMin <= 0 ? `${Math.abs(mesoMin)} BCE` : `${mesoMin} CE`} —{' '}
            {mesoMax <= 0 ? `${Math.abs(mesoMax)} BCE` : `${mesoMax} CE`})
          </Text>
          <Text style={styles.tierSubtitle}>Scrub fine years</Text>
        </View>
        <View
          style={styles.mesoTrack}
          onLayout={(e) => setTier2Width(e.nativeEvent.layout.width)}
          {...mesoPanResponder.panHandlers}
        >
          {/* Decade tick lines */}
          {Array.from({ length: 7 }).map((_, i) => {
            const yr = mesoMin + i * 10;
            const ratio = (yr - mesoMin) / (mesoMax - mesoMin);
            const left = ratio * tier2Width;
            return (
              <View key={i} style={[styles.mesoTick, { left }]}>
                <View style={styles.mesoTickLine} />
                <Text style={styles.mesoTickText}>{yr <= 0 ? `${Math.abs(yr)}B` : `${yr}`}</Text>
              </View>
            );
          })}

          {/* Nearby Events Badges on Meso Tier */}
          {nearbyEvents.map((e) => {
            const start = e.startDate ? dateToDecimalYear(e.startDate) : mesoMin;
            const end = e.isOngoing ? mesoMax : (e.endDate ? dateToDecimalYear(e.endDate) : start);
            const startRatio = (start - mesoMin) / (mesoMax - mesoMin);
            const endRatio = (end - mesoMin) / (mesoMax - mesoMin);

            const left = Math.max(0, startRatio * tier2Width);
            const width = Math.max(12, (endRatio - startRatio) * tier2Width);
            const isSelected = e.id === selectedEventId;

            return (
              <TouchableOpacity
                key={e.id}
                style={[
                  styles.mesoEventBadge,
                  {
                    left,
                    width: Math.min(tier2Width - left, width),
                    backgroundColor: e.color || COLORS.primary,
                    borderColor: isSelected ? '#ffffff' : 'transparent',
                    borderWidth: isSelected ? 2 : 0,
                  }
                ]}
                onPress={() => onSelectEvent(e.id)}
              >
                <Text style={styles.mesoEventText} numberOfLines={1}>
                  {e.title}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Meso Center Needle */}
          <View style={[styles.needleCenter, { left: tier2Width / 2 }]}>
            <View style={styles.needleHead} />
          </View>
        </View>
      </View>

      {/* TIER 3: MICRO SCALE (Months, Days & Hours: Detailed 1-Year Window) */}
      <View style={styles.tierSection}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierTitle}>
            TIER 3: MONTHS, DAYS & HOURS ({currentDate.year <= 0 ? `${Math.abs(currentDate.year)} BCE` : `${currentDate.year} CE`})
          </Text>
          <Text style={styles.tierSubtitle}>Scrub months & days of the current year</Text>
        </View>
        <View
          style={styles.microTrack}
          onLayout={(e) => setTier3Width(e.nativeEvent.layout.width)}
          {...microPanResponder.panHandlers}
        >
          {/* 12 Months Labels */}
          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => {
            const left = (i / 12) * tier3Width;
            return (
              <View key={i} style={[styles.microMonthTick, { left }]}>
                <View style={styles.microMonthLine} />
                <Text style={styles.microMonthText}>{m}</Text>
              </View>
            );
          })}

          {/* Micro Needle */}
          <View style={[styles.needle, { left: microCursorLeft }]}>
            <View style={[styles.needleHead, { backgroundColor: COLORS.accent }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  dateBadge: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  dateBadgeLabel: {
    color: COLORS.primaryLight,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateBadgeValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  presetsList: {
    flexGrow: 0,
    marginLeft: SPACING.sm,
  },
  presetChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    marginRight: 6,
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  presetChipText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  tierSection: {
    marginTop: 6,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  tierTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  tierSubtitle: {
    color: COLORS.textDim,
    fontSize: 9,
  },
  macroTrack: {
    height: 32,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  macroTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  macroTickLine: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
  },
  macroTickText: {
    color: COLORS.textDim,
    fontSize: 8,
    marginTop: 2,
  },
  macroEventDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 14,
  },
  mesoTrack: {
    height: 38,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mesoTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  mesoTickLine: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
  },
  mesoTickText: {
    color: COLORS.textDim,
    fontSize: 8,
    marginTop: 1,
  },
  mesoEventBadge: {
    position: 'absolute',
    bottom: 3,
    height: 16,
    borderRadius: 3,
    paddingHorizontal: 3,
    justifyContent: 'center',
    opacity: 0.85,
  },
  mesoEventText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  microTrack: {
    height: 28,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  microMonthTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  microMonthLine: {
    width: 1,
    height: 8,
    backgroundColor: COLORS.border,
  },
  microMonthText: {
    color: COLORS.textDim,
    fontSize: 8,
    marginTop: 2,
  },
  needle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    zIndex: 10,
  },
  needleCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    zIndex: 10,
  },
  needleHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    top: 0,
  },
});
