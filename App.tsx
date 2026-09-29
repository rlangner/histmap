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
import { showAlert } from './src/utils/alertUtils';
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

  // Helper to extract the primary chronological decimal year of an event
  const getEventYear = (e: HistoricalEvent): number => {
    if (e.startDate) return dateToDecimalYear(e.startDate);
    if (e.endDate) return dateToDecimalYear(e.endDate);
    return 0;
  };

  // Stably sorted events with secondary tie-breakers (title, then id)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const yearDiff = getEventYear(a) - getEventYear(b);
      if (Math.abs(yearDiff) > 0.000001) {
        return yearDiff;
      }
      const titleDiff = a.title.localeCompare(b.title);
      if (titleDiff !== 0) return titleDiff;
      return a.id.localeCompare(b.id);
    });
  }, [events]);

  // Compute active events (strictly single event when in active_only mode)
  const activeEvents = useMemo(() => {
    if (events.length === 0) return [];

    if (filterMode === 'show_all') {
      return events;
    }

    if (filterMode === 'window') {
      return events.filter((e) => isEventActiveAt(e, currentDecimalYear, 'window', 5));
    }

    // filterMode === 'active_only': strictly ONE single event
    // 1. If an event is selected and active or close to current timeline position, isolate strictly that one
    if (selectedEventId) {
      const selected = events.find((e) => e.id === selectedEventId);
      if (selected) {
        const isNear =
          Math.abs(getEventYear(selected) - currentDecimalYear) <= 1.0 ||
          isEventActiveAt(selected, currentDecimalYear, 'active_only');
        if (isNear) {
          return [selected];
        }
      }
    }

    // 2. Find any active candidates from sortedEvents at currentDecimalYear
    const activeCandidates = sortedEvents.filter((e) =>
      isEventActiveAt(e, currentDecimalYear, 'active_only')
    );

    if (activeCandidates.length > 0) {
      // Pick the single closest candidate to currentDecimalYear
      let best = activeCandidates[0];
      let bestDiff = Math.abs(getEventYear(best) - currentDecimalYear);
      for (let i = 1; i < activeCandidates.length; i++) {
        const diff = Math.abs(getEventYear(activeCandidates[i]) - currentDecimalYear);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = activeCandidates[i];
        }
      }
      return [best];
    }

    // 3. No candidate active at currentDecimalYear
    return [];
  }, [events, sortedEvents, currentDecimalYear, filterMode, selectedEventId]);

  const activeEventIds = useMemo(() => {
    return activeEvents.map((e) => e.id);
  }, [activeEvents]);

  // When in active_only mode, keep selectedEventId synchronized with the single active event
  useEffect(() => {
    if (filterMode === 'active_only' && activeEvents.length === 1) {
      const singleEvent = activeEvents[0];
      if (selectedEventId !== singleEvent.id) {
        setSelectedEventId(singleEvent.id);
      }
    }
  }, [filterMode, activeEvents, selectedEventId]);

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
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setCurrentDecimalYear(getEventYear(ev));
    }
    setDetailModalVisible(true);
  };

  // Step Prev Event (chronological backward traversal)
  const handleStepPrev = () => {
    if (sortedEvents.length === 0) return;

    let prevIndex = -1;

    // If an event is currently selected and the timeline scrubber hasn't drifted far away
    if (selectedEventId) {
      const currentIndex = sortedEvents.findIndex((e) => e.id === selectedEventId);
      if (currentIndex !== -1) {
        const currentEvent = sortedEvents[currentIndex];
        const isNearCurrent = Math.abs(getEventYear(currentEvent) - currentDecimalYear) < 1.0;
        if (isNearCurrent) {
          // Go to previous event index, wrapping around to the end
          prevIndex = (currentIndex - 1 + sortedEvents.length) % sortedEvents.length;
        }
      }
    }

    // If no event selected or scrubber moved away, find the last event before currentDecimalYear
    if (prevIndex === -1) {
      for (let i = sortedEvents.length - 1; i >= 0; i--) {
        if (getEventYear(sortedEvents[i]) < currentDecimalYear - 0.0001) {
          prevIndex = i;
          break;
        }
      }
      if (prevIndex === -1) {
        prevIndex = sortedEvents.length - 1;
      }
    }

    const prevEvent = sortedEvents[prevIndex];
    if (prevEvent) {
      const yr = getEventYear(prevEvent);
      setCurrentDecimalYear(yr);
      setSelectedEventId(prevEvent.id);
    }
  };

  // Step Next Event (chronological forward traversal)
  const handleStepNext = () => {
    if (sortedEvents.length === 0) return;

    let nextIndex = -1;

    // If an event is currently selected and the timeline scrubber hasn't drifted far away
    if (selectedEventId) {
      const currentIndex = sortedEvents.findIndex((e) => e.id === selectedEventId);
      if (currentIndex !== -1) {
        const currentEvent = sortedEvents[currentIndex];
        const isNearCurrent = Math.abs(getEventYear(currentEvent) - currentDecimalYear) < 1.0;
        if (isNearCurrent) {
          // Go to next event index, wrapping around to the beginning
          nextIndex = (currentIndex + 1) % sortedEvents.length;
        }
      }
    }

    // If no event selected or scrubber moved away, find the first event after currentDecimalYear
    if (nextIndex === -1) {
      const foundIndex = sortedEvents.findIndex(
        (e) => getEventYear(e) > currentDecimalYear + 0.0001
      );
      nextIndex = foundIndex !== -1 ? foundIndex : 0;
    }

    const nextEvent = sortedEvents[nextIndex];
    if (nextEvent) {
      const yr = getEventYear(nextEvent);
      setCurrentDecimalYear(yr);
      setSelectedEventId(nextEvent.id);
    }
  };

  // Jump to Today
  const handleJumpToday = () => {
    setCurrentDecimalYear(2026.68);
  };

  // Handle Filter Mode Change
  const handleChangeFilterMode = (newMode: 'active_only' | 'show_all' | 'window') => {
    setFilterMode(newMode);
    if (newMode === 'active_only') {
      if (selectedEventId) {
        const selected = events.find((e) => e.id === selectedEventId);
        if (selected) {
          setCurrentDecimalYear(getEventYear(selected));
        }
      }
    }
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
    showAlert('Delete Event', 'Are you sure you want to remove this historical record?', [
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
      showAlert('No Events', 'There are no historical events to share.');
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

    showAlert(
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
          onChangeMode={handleChangeFilterMode}
          activeCount={activeEvents.length}
          totalCount={events.length}
          selectedEvent={selectedEvent}
          onOpenDetail={() => setDetailModalVisible(true)}
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
