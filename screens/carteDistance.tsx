import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { haversineDistanceMeters } from '../utils/haversine';

/** Carte OpenStreetMap + Leaflet dans une WebView : pas de clé API ni carte bancaire. */

const OSM_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<style>
  html, body { margin:0; padding:0; height:100%; }
  #map { height:100%; width:100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function () {
  var map = L.map('map').setView([46.6, 2.4], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  var userMarker = null;
  var selMarker = null;
  var line = null;

  function clearLine() {
    if (line) { map.removeLayer(line); line = null; }
  }

  function drawLine() {
    clearLine();
    if (!userMarker || !selMarker) return;
    var a = userMarker.getLatLng();
    var b = selMarker.getLatLng();
    line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: '#6366F1', weight: 3 }).addTo(map);
  }

  window.setUser = function (lat, lng) {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker([lat, lng], { color: '#6366F1', radius: 9, fillOpacity: 0.9 }).addTo(map);
    map.setView([lat, lng], 13);
    drawLine();
  };

  window.clearSelected = function () {
    if (selMarker) { map.removeLayer(selMarker); selMarker = null; }
    clearLine();
  };

  map.on('click', function (e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    if (selMarker) map.removeLayer(selMarker);
    selMarker = L.circleMarker([lat, lng], { color: '#EF4444', radius: 9, fillOpacity: 0.9 }).addTo(map);
    drawLine();
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapClick', lat: lat, lng: lng }));
    }
  });
})();
</script>
</body>
</html>`;

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function isValidCoord(c: { latitude: number; longitude: number } | null): boolean {
  if (!c) return false;
  return (
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.latitude) <= 90 &&
    Math.abs(c.longitude) <= 180
  );
}

export default function CarteDistanceScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== 'granted') {
          setPermission('denied');
          return;
        }
        setPermission('granted');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch {
        Alert.alert('Position', 'Impossible de récupérer ta position.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const injectUser = useCallback(() => {
    if (!mapReady || !isValidCoord(userLocation) || !webRef.current) return;
    const { latitude: lat, longitude: lng } = userLocation!;
    webRef.current.injectJavaScript(
      `try { window.setUser && window.setUser(${lat}, ${lng}); } catch(e){}; true;`
    );
  }, [mapReady, userLocation]);

  useEffect(() => {
    injectUser();
  }, [injectUser]);

  const distanceMeters = useMemo(() => {
    if (!isValidCoord(userLocation) || !isValidCoord(selected)) return null;
    return haversineDistanceMeters(
      userLocation.latitude,
      userLocation.longitude,
      selected.latitude,
      selected.longitude
    );
  }, [userLocation, selected]);

  const onWebMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        lat?: number;
        lng?: number;
      };
      if (data.type === 'mapClick' && Number.isFinite(data.lat) && Number.isFinite(data.lng)) {
        setSelected({ latitude: data.lat!, longitude: data.lng! });
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.webMsg}>
          Ouvre l’app sur iOS ou Android pour la carte (OpenStreetMap dans une WebView).
        </Text>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.hint}>Chargement de la position…</Text>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.denied}>
          Active la localisation dans les réglages pour utiliser la carte.
        </Text>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Text style={styles.backBtnText}>← Menu</Text>
        </Pressable>
        <Text style={styles.title}>Carte & distance</Text>
        <Text style={styles.osmNote}>Données © OpenStreetMap (tuiles communautaires)</Text>
      </View>

      <View style={styles.mapWrap} collapsable={false}>
        <WebView
          ref={webRef}
          style={styles.map}
          originWhitelist={['*']}
          source={{ html: OSM_MAP_HTML }}
          onLoadEnd={() => setMapReady(true)}
          onMessage={onWebMessage}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Distance à vol d&apos;oiseau</Text>
        {!isValidCoord(userLocation) ? (
          <Text style={styles.hintTap}>
            Position indisponible — impossible de calculer la distance.
          </Text>
        ) : distanceMeters != null ? (
          <Text style={styles.distance}>{formatDistance(distanceMeters)}</Text>
        ) : (
          <Text style={styles.hintTap}>Touche la carte pour placer un point</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  osmNote: {
    marginTop: 6,
    fontSize: 11,
    color: '#94A3B8',
  },
  mapWrap: {
    flex: 1,
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  distance: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366F1',
  },
  hintTap: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  hint: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
  },
  denied: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  webMsg: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  back: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
