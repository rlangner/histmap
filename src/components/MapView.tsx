import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { HistoricalEvent } from '../types/historical';
import { COLORS } from '../styles/theme';

const CARTO_API_KEY = 'cb1_30pi_1_de76df80dc0685303637564a';

interface MapViewProps {
  events: HistoricalEvent[];
  activeEventIds: string[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  // Drawing mode props
  isDrawingMode?: boolean;
  drawingGeometryType?: 'point' | 'path' | 'polygon';
  drawingPoints?: [number, number][];
  onDrawingPointsChange?: (points: [number, number][]) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  activeEventIds,
  selectedEventId,
  onSelectEvent,
  isDrawingMode = false,
  drawingGeometryType = 'point',
  drawingPoints = [],
  onDrawingPointsChange,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Generate the HTML for Leaflet
  const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-event-label {
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #f8fafc;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 7px;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      white-space: nowrap;
      pointer-events: auto;
    }
    .custom-event-label.selected {
      border: 2px solid #38bdf8;
      box-shadow: 0 0 10px #38bdf8;
      color: #38bdf8;
    }
    .leaflet-tooltip-top:before {
      border-top-color: rgba(15, 23, 42, 0.88);
    }
    .drawing-marker {
      background: #38bdf8;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 12px;
      height: 12px;
    }
    body.is-drawing .custom-event-label {
      pointer-events: none !important;
    }
    body.is-drawing #map {
      cursor: crosshair !important;
    }
    .pin-coord-label {
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([28.0, 15.0], 3);

    // Beautiful Voyager / OpenStreetMap Carto tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    let eventLayers = {};
    let drawingLayers = [];
    let isDrawing = false;
    let currentDrawingType = 'point';
    let currentPoints = [];

    function postToReactNative(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(JSON.stringify(data), '*');
      }
    }

    function renderEvents(allEvents, activeIds, selectedId) {
      // Clear previous layers
      Object.keys(eventLayers).forEach(id => {
        map.removeLayer(eventLayers[id]);
      });
      eventLayers = {};

      // If we are not in drawing mode, ensure all temporary drawing layers are cleared
      if (!isDrawing && drawingLayers.length > 0) {
        drawingLayers.forEach(l => map.removeLayer(l));
        drawingLayers = [];
      }

      allEvents.forEach(event => {
        const isActive = activeIds.includes(event.id);
        const isSelected = event.id === selectedId;

        // Only render active events (in 'show_all' mode, activeIds contains all events)
        if (!isActive) {
          return;
        }

        const opacity = 0.95;
        const fillOpacity = 0.38;
        const color = event.color || '#38bdf8';
        const weight = isSelected ? 4 : 2;

        let layer = null;

        if (event.geometry.type === 'point' && event.geometry.point) {
          const latLng = event.geometry.point;
          layer = L.circleMarker(latLng, {
            radius: isSelected ? 10 : 7,
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity * 2,
            weight: weight
          });

          // Permanent title tooltip
          layer.bindTooltip(event.title, {
            permanent: true,
            direction: 'top',
            className: 'custom-event-label ' + (isSelected ? 'selected' : '')
          });
        } else if (event.geometry.type === 'path' && event.geometry.path && event.geometry.path.length > 1) {
          layer = L.polyline(event.geometry.path, {
            color: color,
            weight: weight + 1,
            opacity: opacity,
            dashArray: '6, 6'
          });

          // Midpoint tooltip for path
          const midIdx = Math.floor(event.geometry.path.length / 2);
          const midPoint = event.geometry.path[midIdx];
          layer.bindTooltip(event.title, {
            permanent: true,
            direction: 'top',
            className: 'custom-event-label ' + (isSelected ? 'selected' : '')
          });
        } else if (event.geometry.type === 'polygon' && event.geometry.polygon && event.geometry.polygon.length > 2) {
          layer = L.polygon(event.geometry.polygon, {
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity,
            weight: weight
          });

          // Center tooltip for polygon
          layer.bindTooltip(event.title, {
            permanent: true,
            direction: 'center',
            className: 'custom-event-label ' + (isSelected ? 'selected' : '')
          });
        }

        if (layer) {
          layer.on('click', (e) => {
            if (isDrawing) return;
            L.DomEvent.stopPropagation(e);
            postToReactNative({ type: 'EVENT_CLICKED', eventId: event.id });
          });
          layer.addTo(map);
          eventLayers[event.id] = layer;
        }
      });
    }

    function renderDrawing(type, points) {
      drawingLayers.forEach(l => map.removeLayer(l));
      drawingLayers = [];

      if (!points || points.length === 0) return;

      if (type === 'point') {
        const pt = points[0];
        const marker = L.circleMarker(pt, {
          radius: 9,
          color: '#ffffff',
          fillColor: '#38bdf8',
          fillOpacity: 1,
          weight: 3,
          interactive: false
        }).addTo(map);
        drawingLayers.push(marker);

        const label = L.marker(pt, {
          icon: L.divIcon({
            className: 'pin-coord-label',
            html: '<div style="background:rgba(15,23,42,0.92);border:1px solid #38bdf8;color:#38bdf8;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;transform:translate(-50%, -32px);box-shadow:0 2px 8px rgba(0,0,0,0.6);pointer-events:none;">📍 ' + pt[0].toFixed(4) + ', ' + pt[1].toFixed(4) + '</div>',
            iconSize: [0, 0]
          }),
          interactive: false
        }).addTo(map);
        drawingLayers.push(label);
      } else {
        // Path or Polygon vertices
        points.forEach((pt) => {
          const marker = L.circleMarker(pt, {
            radius: 6,
            color: '#38bdf8',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2,
            interactive: false
          }).addTo(map);
          drawingLayers.push(marker);
        });

        if (type === 'path' && points.length > 1) {
          const line = L.polyline(points, {
            color: '#38bdf8',
            weight: 3,
            dashArray: '4, 4',
            interactive: false
          }).addTo(map);
          drawingLayers.push(line);
        } else if (type === 'polygon' && points.length > 2) {
          const poly = L.polygon(points, {
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.3,
            weight: 2,
            interactive: false
          }).addTo(map);
          drawingLayers.push(poly);
        }
      }
    }

    // Map click handler
    map.on('click', function(e) {
      if (isDrawing) {
        const lat = parseFloat(e.latlng.lat.toFixed(5));
        const lng = parseFloat(e.latlng.lng.toFixed(5));

        if (currentDrawingType === 'point') {
          currentPoints = [[lat, lng]];
        } else {
          currentPoints.push([lat, lng]);
        }

        renderDrawing(currentDrawingType, currentPoints);
        postToReactNative({ type: 'DRAWING_UPDATED', points: currentPoints });
      }
    });

    // Handle messages from React Native
    window.addEventListener('message', function(event) {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(err) { return; }
      }
      if (!data) return;

      if (data.type === 'UPDATE_EVENTS') {
        renderEvents(data.events, data.activeIds, data.selectedId);
      } else if (data.type === 'SET_DRAWING_MODE') {
        isDrawing = !!data.isDrawing;
        if (isDrawing) {
          document.body.classList.add('is-drawing');
          currentDrawingType = data.drawingType || 'point';
          currentPoints = data.points || [];
          renderDrawing(currentDrawingType, currentPoints);

          // Smoothly pan to existing point when entering placement mode
          if (currentPoints.length > 0 && currentPoints[0]) {
            map.panTo(currentPoints[0], { animate: true });
          }
        } else {
          document.body.classList.remove('is-drawing');
          // Fully remove and clear temporary drawing markers and labels
          drawingLayers.forEach(l => map.removeLayer(l));
          drawingLayers = [];
          currentPoints = [];
        }
      } else if (data.type === 'FOCUS_EVENT') {
        const layer = eventLayers[data.eventId];
        if (layer) {
          if (layer.getBounds) {
            map.flyToBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 8 });
          } else if (layer.getLatLng) {
            map.flyTo(layer.getLatLng(), Math.max(map.getZoom(), 5));
          }
        }
      }
    });

    // Notify ready
    postToReactNative({ type: 'MAP_READY' });
  </script>
</body>
</html>
  `;

  const handleMessage = (data: any) => {
    if (!data) return;
    if (data.type === 'EVENT_CLICKED') {
      onSelectEvent(data.eventId);
    } else if (data.type === 'DRAWING_UPDATED') {
      if (onDrawingPointsChange) {
        onDrawingPointsChange(data.points);
      }
    } else if (data.type === 'MAP_READY') {
      sendStateToMap();
    }
  };

  const sendStateToMap = () => {
    const payload = JSON.stringify({
      type: 'UPDATE_EVENTS',
      events,
      activeIds: activeEventIds,
      selectedId: selectedEventId,
    });

    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(payload, '*');
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.postMessage(payload);
      }
    }
  };

  // Sync event updates to Map
  useEffect(() => {
    sendStateToMap();
  }, [events, activeEventIds, selectedEventId]);

  // Sync drawing state
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'SET_DRAWING_MODE',
      isDrawing: isDrawingMode,
      drawingType: drawingGeometryType,
      points: drawingPoints,
    });

    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(payload, '*');
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.postMessage(payload);
      }
    }
  }, [isDrawingMode, drawingGeometryType, drawingPoints]);

  // Focus event when selected
  useEffect(() => {
    if (selectedEventId) {
      const payload = JSON.stringify({
        type: 'FOCUS_EVENT',
        eventId: selectedEventId,
      });
      if (Platform.OS === 'web') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(payload, '*');
        }
      } else {
        if (webViewRef.current) {
          webViewRef.current.postMessage(payload);
        }
      }
    }
  }, [selectedEventId]);

  // Web event listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onWebMessage = (e: MessageEvent) => {
        try {
          const parsed = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          handleMessage(parsed);
        } catch (err) {
          // ignore unrelated message
        }
      };
      window.addEventListener('message', onWebMessage);
      return () => window.removeEventListener('message', onWebMessage);
    }
  }, [onSelectEvent, onDrawingPointsChange]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Historical Map"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            handleMessage(data);
          } catch (e) {
            console.error('Error parsing webview message', e);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
