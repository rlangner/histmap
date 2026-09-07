# HistMap - Historical Event & Cartographic Timeline Visualizer

HistMap is a cross-platform mobile and web application built with **React Native**, **Expo (SDK 57)**, **TypeScript**, and **OpenStreetMap / Leaflet**. It enables users to explore, create, and visualize historical data across thousands of years and down to specific hours, with synchronized multi-resolution timelines and dynamic map geometries (GPS points, routes/paths, and territorial regions/polygons).

---

## Key Features

### 1. Flexible Historical Date Engine
- **Vast Temporal Range**: Spans from thousands of years BCE (e.g. 5000 BCE, ancient Egypt, prehistory) to today and beyond.
- **Micro Resolution**: Precision down to the hour and minute (e.g. Battle of Waterloo hour-by-hour conflict, Apollo 11 lunar landing at 20:17 UTC).
- **Flexible Timing Modes**:
  - **Single Moment**: Instantaneous battles, treaties, landings, or astronomical events.
  - **Date Ranges**: Defined start and end dates (e.g. Roman Empire under Trajan: 27 BCE – 476 CE).
  - **Ongoing Events**: Active from a start date into the present (e.g. United States: July 4, 1776 – Present).
  - **Unbounded / Unknown Origins**: Ancient phenomena where earliest start is lost to record (e.g. Stonehenge: Unknown origin – c. 1500 BCE).
  - **Circa Notation**: Flag approximate dates (e.g. *c. 1550 BCE*).

### 2. Synchronized Multi-Tier Timeline
- **Tier 1: Macro Era (Millennia & Centuries)**: Quick navigation across -4000 BCE to +2100 CE with event distribution dots.
- **Tier 2: Meso Scale (Decades & Years)**: Fine ±30-year active window displaying interactive event pills and decade ticks.
- **Tier 3: Micro Scale (Months, Days & Hours)**: 1-year window displaying month divisions, days, and hour ticks.
- **Bidirectional Synchronization**: Dragging or scrubbing any tier immediately updates the single canonical time cursor across all tiers and dynamically updates the map view.
- **Playback Controls**: Play/Pause time animation, adjustable playback speeds (1 day/s up to 100 years/s), Step to Next/Previous event in history, and Jump to Today.

### 3. Universal Cartographic Visualization (OpenStreetMap / Leaflet)
- **Points / Pins**: Precise GPS coordinates with title tooltips.
- **Routes / Paths**: Polyline vectors with directional dash styling (e.g. Silk Road, Magellan's circumnavigation).
- **Territories / Polygons**: Closed area boundaries with customizable fill opacity and centroid title labels.
- **Interactive Map Drawing**: Tap on the map to place pins, plot routes with multiple waypoints, or trace territorial boundaries with undo/clear support.
- **Zero API Keys**: Uses OpenStreetMap vector tiles, requiring no Google Maps or Apple Maps API keys or subscriptions.

### 4. 100% On-Device Local Storage (No Server)
- All events are stored strictly on the local iOS/Android device.
- Dual-tier local persistence:
  - High-performance local key-value store using `@react-native-async-storage/async-storage`.
  - Direct on-device file persistence in the app's sandboxed Documents directory (`historical_events.json`) via `expo-file-system`.
- Operates entirely offline without remote databases, servers, or cloud accounts.

### 5. Cross-Device Sharing via AirDrop & Text Message Attachments
- **Native iOS Share Sheet Integration**: Built with `expo-sharing` to invoke Apple's `UIActivityViewController`.
- **AirDrop Support**: Instantly beam a single event or your entire historical collection to another nearby iPhone, iPad, or Mac.
- **Text Message Attachments**: Directly attach `.histmap.json` event files to an iMessage or SMS thread with one tap.
- **Import Engine**: Recipient taps the Import button (or opens the attached file via `expo-document-picker`) to automatically validate, merge, and visualize incoming events on their local map.
- **Single Event or Batch Sharing**:
  - Share individual events from the event detail sheet.
  - Share the entire historical database from the top header bar.

---

## Apple Developer Account Requirements

- **To Develop and Test on your iPhone**: **NO Developer Account is needed!**
  - With Expo, you can download the free **Expo Go** app from the iOS App Store on your iPhone.
  - Run `npx expo start` on your computer, scan the QR code with your iPhone's Camera, and the app will open and run natively on your device over your local Wi-Fi.
- **To Publish to the Apple App Store / TestFlight**: A paid Apple Developer Program membership ($99/year) is required by Apple.
- **Future Android Port**: Because the app is built with Expo and React Native, the exact same code runs on Android out of the box (`npx expo start --android` or scan QR code with Expo Go on Android).

---

## Running the Application

### 1. Run in Web Browser (Instant preview on Linux)
```bash
npx expo start --web
```
Or build a production static web export:
```bash
npx expo export -p web
```

### 2. Run on Physical iPhone / iOS
1. Install **Expo Go** from the iOS App Store on your iPhone.
2. In your terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code displayed in the terminal using your iPhone Camera app.

### 3. Run on Android
1. Install **Expo Go** from Google Play Store on your Android device.
2. In your terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code using the Expo Go app.

---

## Project Architecture

```
histmap/
├── App.tsx                        # Root app orchestrator with layout & state
├── src/
│   ├── types/
│   │   └── historical.ts          # HistoricalDate, HistoricalEvent, Geometry types
│   ├── utils/
│   │   ├── dateUtils.ts           # Continuous decimal year math, formatting, active matching
│   │   ├── sampleData.ts          # Pre-loaded historical datasets (BCE to 20th century)
│   │   └── shareUtils.ts          # AirDrop, Messages attachment, and file import utilities
│   ├── storage/
│   │   └── eventStorage.ts        # 100% on-device storage (AsyncStorage + Documents file)
│   ├── components/
│   │   ├── MapView.tsx            # Universal Leaflet & OpenStreetMap component (iOS, Android, Web)
│   │   ├── MultiTierTimeline.tsx  # Synchronized 3-tier timeline (Macro, Meso, Micro)
│   │   ├── TimelineControls.tsx   # Playback speed, play/pause, prev/next, mode switches
│   │   ├── EventDetailModal.tsx   # Event details, dates, sources, and map sync
│   │   ├── EventEditorModal.tsx   # Event creator with date modes and interactive map drawing
│   │   └── HeaderBar.tsx          # Top bar with stats and action triggers
│   └── styles/
│       └── theme.ts               # Historical slate palette and design tokens
```
