export type DatePrecision = 'millennium' | 'century' | 'decade' | 'year' | 'month' | 'day' | 'hour';

export interface HistoricalDate {
  // Astronomical / historical year:
  // <= 0 represents BCE (e.g. -500 = 500 BCE, 0 = 1 BCE, +1 = 1 CE, +2026 = 2026 CE)
  year: number;
  month?: number; // 1 - 12
  day?: number;   // 1 - 31
  hour?: number;  // 0 - 23
  minute?: number;// 0 - 59
  precision: DatePrecision;
  isCirca?: boolean; // e.g. c. 450 BCE
  label?: string;    // Custom display override like "Spring 1066"
}

export type GeometryType = 'point' | 'path' | 'polygon';

export interface HistoricalGeometry {
  type: GeometryType;
  // [latitude, longitude]
  point?: [number, number];
  // [[latitude, longitude], ...]
  path?: [number, number][];
  // [[latitude, longitude], ...] (closed boundary polygon)
  polygon?: [number, number][];
}

export type EventCategory =
  | 'Patriarchs'
  | 'Exodus'
  | 'David/Solomon'
  | 'Jesus'
  | 'Apostles'
  | 'Other';

export interface HistoricalEvent {
  id: string;
  title: string;
  notes: string;
  color: string;
  category: EventCategory;
  
  // Date configuration
  hasNoStartDate?: boolean; // Existed from earliest times / unbounded start
  startDate?: HistoricalDate;
  isOngoing?: boolean;      // Extends into the present / future
  endDate?: HistoricalDate;

  // Geometry
  geometry: HistoricalGeometry;

  // Metadata
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  source?: string;
}

export interface TimelineState {
  currentDecimalYear: number;
  isPlaying: boolean;
  playbackSpeed: number; // in decimal years per second (e.g. 1, 10, 100)
  selectedEventId: string | null;
  mode: 'active_only' | 'show_all' | 'window';
  windowYears: number; // when mode is 'window'
}
