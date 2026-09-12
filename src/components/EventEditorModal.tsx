import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  HistoricalEvent,
  HistoricalDate,
  GeometryType,
  DatePrecision,
  EventCategory,
} from '../types/historical';
import { showAlert } from '../utils/alertUtils';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

interface EventEditorModalProps {
  visible: boolean;
  eventToEdit: HistoricalEvent | null;
  onClose: () => void;
  onSave: (event: HistoricalEvent) => void;
  // Interactive map drawing triggers
  onStartMapPlacement: (
    type: GeometryType,
    existingPoints: [number, number][],
    onConfirmed: (points: [number, number][]) => void
  ) => void;
}

const CATEGORIES: EventCategory[] = [
  'Patriarchs',
  'Exodus',
  'David y Solomon',
  'Jesus',
  'Apostles',
  'Other',
];

const PRESET_COLORS = [
  '#f59e0b', // Amber / Gold (Patriarchs)
  '#f97316', // Orange (Exodus)
  '#8b5cf6', // Royal Purple (David y Solomon)
  '#38bdf8', // Sky Blue (Jesus)
  '#10b981', // Emerald (Apostles)
  '#64748b', // Slate Grey (Other)
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  visible,
  eventToEdit,
  onClose,
  onSave,
  onStartMapPlacement,
}) => {
  // Event basics
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<EventCategory>('Patriarchs');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Date type mode
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'ongoing' | 'no_start'>('single');

  // Start Date
  const [startIsBCE, setStartIsBCE] = useState(false);
  const [startYear, setStartYear] = useState('2026');
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startIsCirca, setStartIsCirca] = useState(false);

  // End Date
  const [endIsBCE, setEndIsBCE] = useState(false);
  const [endYear, setEndYear] = useState('2026');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endIsCirca, setEndIsCirca] = useState(false);

  // Geometry
  const [geometryType, setGeometryType] = useState<GeometryType>('point');
  const [pointCoords, setPointCoords] = useState<[number, number]>([37.9838, 23.7275]); // Athens default
  const [pathCoords, setPathCoords] = useState<[number, number][]>([]);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);

  // Manual GPS Input String
  const [latInput, setLatInput] = useState('37.9838');
  const [lngInput, setLngInput] = useState('23.7275');

  // Track if editor was temporarily hidden for picking a location on the map
  const isPickingOnMapRef = useRef(false);

  const handleLatChange = (val: string) => {
    setLatInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setPointCoords((prev) => [parsed, prev[1]]);
    }
  };

  const handleLngChange = (val: string) => {
    setLngInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setPointCoords((prev) => [prev[0], parsed]);
    }
  };

  // Populate form if editing or reset on fresh open
  useEffect(() => {
    if (!visible) return;

    // If we are just returning from map placement, preserve all entered fields!
    if (isPickingOnMapRef.current) {
      isPickingOnMapRef.current = false;
      return;
    }

    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setNotes(eventToEdit.notes || '');
      if (eventToEdit.category && CATEGORIES.includes(eventToEdit.category as any)) {
        setCategory(eventToEdit.category as EventCategory);
      } else {
        setCategory('Other');
      }
      setColor(eventToEdit.color || PRESET_COLORS[0]);

      if (eventToEdit.hasNoStartDate) {
        setDateMode('no_start');
      } else if (eventToEdit.isOngoing) {
        setDateMode('ongoing');
      } else if (eventToEdit.endDate) {
        setDateMode('range');
      } else {
        setDateMode('single');
      }

      if (eventToEdit.startDate) {
        setStartIsBCE(eventToEdit.startDate.year <= 0);
        setStartYear(String(Math.abs(eventToEdit.startDate.year) || 1));
        setStartMonth(eventToEdit.startDate.month ? String(eventToEdit.startDate.month) : '');
        setStartDay(eventToEdit.startDate.day ? String(eventToEdit.startDate.day) : '');
        setStartHour(eventToEdit.startDate.hour !== undefined ? String(eventToEdit.startDate.hour) : '');
        setStartIsCirca(!!eventToEdit.startDate.isCirca);
      }

      if (eventToEdit.endDate) {
        setEndIsBCE(eventToEdit.endDate.year <= 0);
        setEndYear(String(Math.abs(eventToEdit.endDate.year) || 1));
        setEndMonth(eventToEdit.endDate.month ? String(eventToEdit.endDate.month) : '');
        setEndDay(eventToEdit.endDate.day ? String(eventToEdit.endDate.day) : '');
        setEndHour(eventToEdit.endDate.hour !== undefined ? String(eventToEdit.endDate.hour) : '');
        setEndIsCirca(!!eventToEdit.endDate.isCirca);
      }

      setGeometryType(eventToEdit.geometry.type);
      if (eventToEdit.geometry.point) {
        setPointCoords(eventToEdit.geometry.point);
        setLatInput(String(eventToEdit.geometry.point[0]));
        setLngInput(String(eventToEdit.geometry.point[1]));
      }
      if (eventToEdit.geometry.path) {
        setPathCoords(eventToEdit.geometry.path);
      }
      if (eventToEdit.geometry.polygon) {
        setPolygonCoords(eventToEdit.geometry.polygon);
      }
    } else {
      // Reset form for fresh event creation
      setTitle('');
      setNotes('');
      setCategory('Patriarchs');
      setColor(PRESET_COLORS[0]);
      setDateMode('single');
      setStartIsBCE(false);
      setStartYear('2026');
      setStartMonth('');
      setStartDay('');
      setStartHour('');
      setStartIsCirca(false);
      setEndIsBCE(false);
      setEndYear('2026');
      setEndMonth('');
      setEndDay('');
      setEndHour('');
      setEndIsCirca(false);
      setGeometryType('point');
      setPointCoords([37.9838, 23.7275]);
      setLatInput('37.9838');
      setLngInput('23.7275');
      setPathCoords([]);
      setPolygonCoords([]);
    }
  }, [eventToEdit, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      showAlert('Validation Error', 'Please enter a title for the historical event.');
      return;
    }

    // Build startDate
    let startDate: HistoricalDate | undefined = undefined;
    if (dateMode !== 'no_start') {
      const parsedYear = parseInt(startYear, 10);
      if (isNaN(parsedYear)) {
        showAlert('Validation Error', 'Please enter a valid start year.');
        return;
      }
      const actualYear = startIsBCE ? -Math.abs(parsedYear) : Math.abs(parsedYear);
      const m = startMonth ? parseInt(startMonth, 10) : undefined;
      const d = startDay ? parseInt(startDay, 10) : undefined;
      const h = startHour ? parseInt(startHour, 10) : undefined;

      let precision: DatePrecision = 'year';
      if (h !== undefined) precision = 'hour';
      else if (d !== undefined) precision = 'day';
      else if (m !== undefined) precision = 'month';

      startDate = {
        year: actualYear,
        month: m,
        day: d,
        hour: h,
        precision,
        isCirca: startIsCirca,
      };
    }

    // Build endDate
    let endDate: HistoricalDate | undefined = undefined;
    if (dateMode === 'range' || dateMode === 'no_start') {
      const parsedYear = parseInt(endYear, 10);
      if (isNaN(parsedYear)) {
        showAlert('Validation Error', 'Please enter a valid end year.');
        return;
      }
      const actualYear = endIsBCE ? -Math.abs(parsedYear) : Math.abs(parsedYear);
      const m = endMonth ? parseInt(endMonth, 10) : undefined;
      const d = endDay ? parseInt(endDay, 10) : undefined;
      const h = endHour ? parseInt(endHour, 10) : undefined;

      let precision: DatePrecision = 'year';
      if (h !== undefined) precision = 'hour';
      else if (d !== undefined) precision = 'day';
      else if (m !== undefined) precision = 'month';

      endDate = {
        year: actualYear,
        month: m,
        day: d,
        hour: h,
        precision,
        isCirca: endIsCirca,
      };
    }

    // Coordinates validation
    let point: [number, number] | undefined = undefined;
    if (geometryType === 'point') {
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        showAlert(
          'Validation Error',
          'Please enter valid GPS coordinates (Latitude between -90 and 90, Longitude between -180 and 180).'
        );
        return;
      }
      point = [lat, lng];
    }

    if (geometryType === 'path' && pathCoords.length < 2) {
      showAlert('Validation Error', 'A path requires at least 2 waypoints. Use the map to draw your route.');
      return;
    }

    if (geometryType === 'polygon' && polygonCoords.length < 3) {
      showAlert('Validation Error', 'A region/polygon requires at least 3 vertices. Use the map to outline the region.');
      return;
    }

    const newEvent: HistoricalEvent = {
      id: eventToEdit ? eventToEdit.id : `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      notes: notes.trim(),
      category,
      color,
      hasNoStartDate: dateMode === 'no_start',
      startDate,
      isOngoing: dateMode === 'ongoing',
      endDate,
      geometry: {
        type: geometryType,
        point: geometryType === 'point' ? point : undefined,
        path: geometryType === 'path' ? pathCoords : undefined,
        polygon: geometryType === 'polygon' ? polygonCoords : undefined,
      },
      createdAt: eventToEdit ? eventToEdit.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newEvent);
  };

  const handleLaunchMapDrawing = () => {
    isPickingOnMapRef.current = true;
    let current: [number, number][] = [];
    if (geometryType === 'point') {
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);
      current = !isNaN(lat) && !isNaN(lng) ? [[lat, lng]] : [pointCoords];
    } else if (geometryType === 'path') {
      current = pathCoords;
    } else if (geometryType === 'polygon') {
      current = polygonCoords;
    }

    onStartMapPlacement(geometryType, current, (newPoints) => {
      if (geometryType === 'point' && newPoints.length > 0) {
        setPointCoords(newPoints[0]);
        setLatInput(String(newPoints[0][0]));
        setLngInput(String(newPoints[0][1]));
      } else if (geometryType === 'path') {
        setPathCoords(newPoints);
      } else if (geometryType === 'polygon') {
        setPolygonCoords(newPoints);
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {eventToEdit ? 'Edit Historical Event' : 'Create New Historical Event'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>EVENT TITLE *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Battle of Actium, Silk Road, Kingdom of Kush"
                placeholderTextColor={COLORS.textDim}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category & Color */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Color Palette */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>DISPLAY COLOR</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleSelected]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            {/* Date Type Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>DATE CONFIGURATION</Text>
              <View style={styles.dateModeRow}>
                <TouchableOpacity
                  style={[styles.dateModeBtn, dateMode === 'single' && styles.dateModeBtnActive]}
                  onPress={() => setDateMode('single')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'single' && styles.dateModeTextActive]}>
                    Single Point
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateModeBtn, dateMode === 'range' && styles.dateModeBtnActive]}
                  onPress={() => setDateMode('range')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'range' && styles.dateModeTextActive]}>
                    Date Range
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateModeBtn, dateMode === 'ongoing' && styles.dateModeBtnActive]}
                  onPress={() => setDateMode('ongoing')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'ongoing' && styles.dateModeTextActive]}>
                    Ongoing
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateModeBtn, dateMode === 'no_start' && styles.dateModeBtnActive]}
                  onPress={() => setDateMode('no_start')}
                >
                  <Text style={[styles.dateModeText, dateMode === 'no_start' && styles.dateModeTextActive]}>
                    No Start
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Start Date Inputs */}
            {dateMode !== 'no_start' && (
              <View style={styles.dateInputSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.subheading}>
                    {dateMode === 'single' ? 'EVENT DATE' : 'START DATE'}
                  </Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Circa (c.)</Text>
                    <Switch
                      value={startIsCirca}
                      onValueChange={setStartIsCirca}
                      trackColor={{ false: COLORS.surfaceLight, true: COLORS.primaryDark }}
                      thumbColor={startIsCirca ? COLORS.primary : COLORS.textDim}
                    />
                  </View>
                </View>

                {/* Year + Era */}
                <View style={styles.dateTimeGrid}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputSublabel}>Year *</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="e.g. 490"
                      placeholderTextColor={COLORS.textDim}
                      value={startYear}
                      onChangeText={setStartYear}
                    />
                  </View>

                  <View style={{ flex: 1.5, justifyContent: 'flex-end' }}>
                    <View style={styles.eraToggleContainer}>
                      <TouchableOpacity
                        style={[styles.eraBtn, startIsBCE && styles.eraBtnActive]}
                        onPress={() => setStartIsBCE(true)}
                      >
                        <Text style={[styles.eraBtnText, startIsBCE && styles.eraBtnTextActive]}>BCE</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.eraBtn, !startIsBCE && styles.eraBtnActive]}
                        onPress={() => setStartIsBCE(false)}
                      >
                        <Text style={[styles.eraBtnText, !startIsBCE && styles.eraBtnTextActive]}>CE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Optional Month / Day / Hour */}
                <View style={styles.dateTimeGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Month (1-12)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={startMonth}
                      onChangeText={setStartMonth}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Day (1-31)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={startDay}
                      onChangeText={setStartDay}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Hour (0-23)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={startHour}
                      onChangeText={setStartHour}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* End Date Inputs (for Range or No Start) */}
            {(dateMode === 'range' || dateMode === 'no_start') && (
              <View style={styles.dateInputSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.subheading}>END DATE</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Circa (c.)</Text>
                    <Switch
                      value={endIsCirca}
                      onValueChange={setEndIsCirca}
                      trackColor={{ false: COLORS.surfaceLight, true: COLORS.primaryDark }}
                      thumbColor={endIsCirca ? COLORS.primary : COLORS.textDim}
                    />
                  </View>
                </View>

                {/* Year + Era */}
                <View style={styles.dateTimeGrid}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputSublabel}>End Year *</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="e.g. 14"
                      placeholderTextColor={COLORS.textDim}
                      value={endYear}
                      onChangeText={setEndYear}
                    />
                  </View>

                  <View style={{ flex: 1.5, justifyContent: 'flex-end' }}>
                    <View style={styles.eraToggleContainer}>
                      <TouchableOpacity
                        style={[styles.eraBtn, endIsBCE && styles.eraBtnActive]}
                        onPress={() => setEndIsBCE(true)}
                      >
                        <Text style={[styles.eraBtnText, endIsBCE && styles.eraBtnTextActive]}>BCE</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.eraBtn, !endIsBCE && styles.eraBtnActive]}
                        onPress={() => setEndIsBCE(false)}
                      >
                        <Text style={[styles.eraBtnText, !endIsBCE && styles.eraBtnTextActive]}>CE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Optional Month / Day / Hour */}
                <View style={styles.dateTimeGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Month (1-12)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={endMonth}
                      onChangeText={setEndMonth}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Day (1-31)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={endDay}
                      onChangeText={setEndDay}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Hour (0-23)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Opt"
                      placeholderTextColor={COLORS.textDim}
                      value={endHour}
                      onChangeText={setEndHour}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Map Geometry Section */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>MAP GEOMETRY TYPE</Text>
              <View style={styles.geometryTypeRow}>
                <TouchableOpacity
                  style={[styles.geomTypeBtn, geometryType === 'point' && styles.geomTypeBtnActive]}
                  onPress={() => setGeometryType('point')}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={geometryType === 'point' ? COLORS.primary : COLORS.textDim}
                  />
                  <Text style={[styles.geomTypeText, geometryType === 'point' && styles.geomTypeTextActive]}>
                    GPS Point
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.geomTypeBtn, geometryType === 'path' && styles.geomTypeBtnActive]}
                  onPress={() => setGeometryType('path')}
                >
                  <Ionicons
                    name="trail-sign"
                    size={16}
                    color={geometryType === 'path' ? COLORS.primary : COLORS.textDim}
                  />
                  <Text style={[styles.geomTypeText, geometryType === 'path' && styles.geomTypeTextActive]}>
                    Route / Path
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.geomTypeBtn, geometryType === 'polygon' && styles.geomTypeBtnActive]}
                  onPress={() => setGeometryType('polygon')}
                >
                  <Ionicons
                    name="map"
                    size={16}
                    color={geometryType === 'polygon' ? COLORS.primary : COLORS.textDim}
                  />
                  <Text style={[styles.geomTypeText, geometryType === 'polygon' && styles.geomTypeTextActive]}>
                    Region / Area
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Geometry Placement Trigger Button */}
              <TouchableOpacity style={styles.interactiveMapBtn} onPress={handleLaunchMapDrawing}>
                <Ionicons name="finger-print-outline" size={18} color={COLORS.primary} />
                <Text style={styles.interactiveMapBtnText}>
                  {geometryType === 'point'
                    ? 'Tap on Map to Place Marker'
                    : geometryType === 'path'
                    ? `Draw Route on Map (${pathCoords.length} pts)`
                    : `Draw Region on Map (${polygonCoords.length} pts)`}
                </Text>
              </TouchableOpacity>

              {/* GPS Manual Input (if point) */}
              {geometryType === 'point' && (
                <View style={styles.dateTimeGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Latitude</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={latInput}
                      onChangeText={handleLatChange}
                      placeholder="e.g. 37.9838"
                      placeholderTextColor={COLORS.textDim}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSublabel}>Longitude</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={lngInput}
                      onChangeText={handleLngChange}
                      placeholder="e.g. 23.7275"
                      placeholderTextColor={COLORS.textDim}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Notes Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>NOTES & HISTORICAL CONTEXT</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Add historical details, sources, bibliography, dating rationale..."
                placeholderTextColor={COLORS.textDim}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Footer Save / Cancel */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={18} color={COLORS.background} />
              <Text style={styles.saveBtnText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    maxHeight: '90%',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    flexShrink: 1,
    marginBottom: SPACING.md,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputSublabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notesInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 6,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  categoryChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  dateModeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  dateModeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  dateModeBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  dateModeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  dateModeTextActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  dateInputSection: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subheading: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  eraToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    height: 38,
  },
  eraBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eraBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  eraBtnText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  eraBtnTextActive: {
    color: COLORS.text,
  },
  geometryTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  geomTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  geomTypeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  geomTypeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  geomTypeTextActive: {
    color: COLORS.primary,
  },
  interactiveMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  interactiveMapBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
