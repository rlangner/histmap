import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoricalEvent, GeometryType } from './src/types/historical';
import { dateToDecimalYear, isEventActiveAt } from './src/utils/dateUtils';
import { loadEvents, saveEvents } from './src/storage/eventStorage';
import { shareSingleEvent, shareAllEvents, importEventsFromFile } from './src/utils/shareUtils';
import { HeaderBar } from './src/components/HeaderBar';
import { MapView } from './src/components/MapView';
import { MultiTierTimeline } from './src/components/MultiTierTimeline';
import { TimelineControls } from './src/components/TimelineControls';
import { EventDetailModal } from './src/components/EventDetailModal';
import { EventEditorModal } from './src/components/EventEditorModal';
import { COLORS, SPACING, RADIUS } from './src/styles/theme';

export default function App() {
  // Events state
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Time & Timeline state
  // Default to 2026 CE
  const [currentDecimalYear, setCurrentDecimalYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1 year per second default
  const [filterMode, setFilterMode] = useState<'active_only' | 'show_all' | 'window'>('active_only');

  // Modals state
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [editorModalVisible, setEditorModalVisible] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<HistoricalEvent | null>(null);

  // Interactive Map Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawingGeometryType, setDrawingGeometryType] = useState<GeometryType>('point');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const onPointsConfirmedRef = useRef<((points: [number, number][]) => void) | null>(null);

  // Load events on mount
  useEffect(() => {
    loadEvents().then((loaded) => {
      setEvents(loaded);
    });
  }, []);

  // Compute active events
  const activeEvents = useMemo(() => {
    return events.filter((e) => isEventActiveAt(e, currentDecimalYear, filterMode, 5));
  }, [events, currentDecimalYear, filterMode]);

  const activeEventIds = useMemo(() => {
    return activeEvents.map((e) => e.id);
  }, [activeEvents]);

  // Selected event object
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100; // 10 updates per second for smooth movement
    const step = playbackSpeed * (intervalMs / 1000);

    const timer = setInterval(() => {
      setCurrentDecimalYear((prev) => {
        const next = prev + step;
        // Cap at year 2100 or loop
        if (next > 2100) {
          setIsPlaying(false);
          return 2100;
        }
        return parseFloat(next.toFixed(4));
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Handle Event Selection
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setDetailModalVisible(true);
  };

  // Step Prev Event
  const handleStepPrev = () => {
    const sorted = [...events]
      .filter((e) => e.startDate)
      .sort((a, b) => dateToDecimalYear(a.startDate!) - dateToDecimalYear(b.startDate!));

    const prev = [...sorted]
      .reverse()
      .find((e) => dateToDecimalYear(e.startDate!) < currentDecimalYear - 0.01);

    if (prev && prev.startDate) {
      const yr = dateToDecimalYear(prev.startDate);
      setCurrentDecimalYear(yr);
      setSelectedEventId(prev.id);
    }
  };

  // Step Next Event
  const handleStepNext = () => {
    const sorted = [...events]
      .filter((e) => e.startDate)
      .sort((a, b) => dateToDecimalYear(a.startDate!) - dateToDecimalYear(b.startDate!));

    const next = sorted.find((e) => dateToDecimalYear(e.startDate!) > currentDecimalYear + 0.01);

    if (next && next.startDate) {
      const yr = dateToDecimalYear(next.startDate);
      setCurrentDecimalYear(yr);
      setSelectedEventId(next.id);
    }
  };

  // Jump to Today
  const handleJumpToday = () => {
    setCurrentDecimalYear(2026.68);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEventToEdit(null);
    setEditorModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (event: HistoricalEvent) => {
    setDetailModalVisible(false);
    setEventToEdit(event);
    setEditorModalVisible(true);
  };

  // Save Event
  const handleSaveEvent = async (savedEvent: HistoricalEvent) => {
    setIsDrawingMode(false);
    setDrawingPoints([]);
    let updated: HistoricalEvent[];
    const exists = events.some((e) => e.id === savedEvent.id);
    if (exists) {
      updated = events.map((e) => (e.id === savedEvent.id ? savedEvent : e));
    } else {
      updated = [savedEvent, ...events];
    }
    setEvents(updated);
    await saveEvents(updated);
    setEditorModalVisible(false);
    setSelectedEventId(savedEvent.id);

    // Sync timeline to event start or end
    if (savedEvent.startDate) {
      setCurrentDecimalYear(dateToDecimalYear(savedEvent.startDate));
    } else if (savedEvent.endDate) {
      setCurrentDecimalYear(dateToDecimalYear(savedEvent.endDate));
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to remove this historical record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = events.filter((e) => e.id !== eventId);
          setEvents(updated);
          await saveEvents(updated);
          setDetailModalVisible(false);
          setSelectedEventId(null);
        },
      },
    ]);
  };


  // Share a single event via AirDrop / Messages
  const handleShareSingleEvent = async (event: HistoricalEvent) => {
    await shareSingleEvent(event);
  };

  // Share all events via AirDrop / Messages
  const handleShareAllEvents = async () => {
    if (events.length === 0) {
      Alert.alert('No Events', 'There are no historical events to share.');
      return;
    }
    await shareAllEvents(events);
  };

  // Import events from file (AirDrop or text message attachment received)
  const handleImportEvents = async () => {
    const imported = await importEventsFromFile();
    if (!imported || imported.length === 0) return;

    const existingIds = new Set(events.map((e) => e.id));
    const merged = [...events];
    let newCount = 0;

    imported.forEach((item) => {
      if (existingIds.has(item.id)) {
        const idx = merged.findIndex((e) => e.id === item.id);
        if (idx !== -1) merged[idx] = item;
      } else {
        merged.unshift(item);
        newCount++;
      }
    });

    setEvents(merged);
    await saveEvents(merged);

    Alert.alert(
      'Import Successful',
      `Loaded ${imported.length} historical record(s) directly into device storage.`
    );

    // Jump to the first imported event if it has a date
    if (imported[0].startDate) {
      setCurrentDecimalYear(dateToDecimalYear(imported[0].startDate));
      setSelectedEventId(imported[0].id);
    }
  };

  // Interactive Map Drawing Start
  const handleStartMapPlacement = (
    type: GeometryType,
    currentPoints: [number, number][],
    onPointsConfirmed: (points: [number, number][]) => void
  ) => {
    onPointsConfirmedRef.current = onPointsConfirmed;
    setDrawingGeometryType(type);
    setDrawingPoints(currentPoints);
    setEditorModalVisible(false); // Hide modal so user can tap map
    setIsDrawingMode(true);
  };

  // Finish Map Drawing
  const handleFinishDrawing = () => {
    if (onPointsConfirmedRef.current) {
      onPointsConfirmedRef.current(drawingPoints);
    }
    setIsDrawingMode(false);
    setDrawingPoints([]);
    setEditorModalVisible(true); // Re-open editor with updated points
  };

  // Cancel Map Drawing
  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setDrawingPoints([]);
    setEditorModalVisible(true);
  };

  // Undo Last Point in Drawing
  const handleUndoPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  // Clear All Points in Drawing
  const handleClearPoints = () => {
    setDrawingPoints([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      <View style={styles.rootContainer}>
        {/* Header Bar */}
        <HeaderBar
          totalEvents={events.length}
          onAddEvent={handleOpenCreateModal}
          onShareAll={handleShareAllEvents}
          onImportEvents={handleImportEvents}
        />

        {/* Map View Container */}
        <View style={styles.mapContainer}>
          <MapView
            events={events}
            activeEventIds={activeEventIds}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            isDrawingMode={isDrawingMode}
            drawingGeometryType={drawingGeometryType}
            drawingPoints={drawingPoints}
            onDrawingPointsChange={setDrawingPoints}
          />

          {/* Interactive Drawing Mode Toolbar Banner */}
          {isDrawingMode && (
            <View style={styles.drawingToolbar}>
              <View style={styles.drawingInfoRow}>
                <Ionicons name="create" size={16} color={COLORS.primary} />
                <Text style={styles.drawingInfoText}>
                  {drawingGeometryType === 'point'
                    ? 'Tap map to place event pin'
                    : drawingGeometryType === 'path'
                    ? `Tap map to add waypoints (${drawingPoints.length} points)`
                    : `Tap map to outline region vertices (${drawingPoints.length} points)`}
                </Text>
              </View>

              <View style={styles.drawingActionsRow}>
                {drawingGeometryType !== 'point' && drawingPoints.length > 0 && (
                  <>
                    <TouchableOpacity style={styles.drawingBtnSec} onPress={handleUndoPoint}>
                      <Ionicons name="arrow-undo" size={14} color={COLORS.text} />
                      <Text style={styles.drawingBtnSecText}>Undo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.drawingBtnSec} onPress={handleClearPoints}>
                      <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                      <Text style={[styles.drawingBtnSecText, { color: COLORS.danger }]}>Clear</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.drawingBtnCancel} onPress={handleCancelDrawing}>
                  <Text style={styles.drawingBtnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.drawingBtnConfirm} onPress={handleFinishDrawing}>
                  <Ionicons name="checkmark" size={16} color={COLORS.background} />
                  <Text style={styles.drawingBtnConfirmText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Playback & Mode Controls */}
        <TimelineControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          speed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          onStepPrev={handleStepPrev}
          onStepNext={handleStepNext}
          onJumpToday={handleJumpToday}
          mode={filterMode}
          onChangeMode={setFilterMode}
          activeCount={activeEvents.length}
          totalCount={events.length}
        />

        {/* Multi-Tier Timeline (Macro, Meso, Micro) */}
        <MultiTierTimeline
          currentDecimalYear={currentDecimalYear}
          onTimeChange={setCurrentDecimalYear}
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={handleSelectEvent}
        />

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent}
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteEvent}
          onShare={handleShareSingleEvent}
          onJumpToEvent={(event) => {
            if (event.startDate) {
              setCurrentDecimalYear(dateToDecimalYear(event.startDate));
            }
            setDetailModalVisible(false);
          }}
        />

        {/* Event Editor / Creator Modal */}
        <EventEditorModal
          visible={editorModalVisible}
          eventToEdit={eventToEdit}
          onClose={() => {
            setEditorModalVisible(false);
            setIsDrawingMode(false);
            setDrawingPoints([]);
          }}
          onSave={handleSaveEvent}
          onStartMapPlacement={handleStartMapPlacement}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  drawingToolbar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  drawingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  drawingInfoText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  drawingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  drawingBtnSec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  drawingBtnSecText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  drawingBtnCancel: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHover,
  },
  drawingBtnCancelText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  drawingBtnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  drawingBtnConfirmText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
