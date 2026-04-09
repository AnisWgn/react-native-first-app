import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import { resolveQrLinkToRouteName } from '../utils/resolveQrLink';

export default function ScanQrScreen({
  navigation,
}: {
  navigation: {
    navigate: (name: string) => void;
    replace: (name: string) => void;
    goBack: () => void;
  };
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const scannedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
    }, [])
  );

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scannedRef.current) return;
      const data = result.data?.trim();
      if (!data) return;
      scannedRef.current = true;
      setLastUrl(data);

      const route = resolveQrLinkToRouteName(data);
      if (route) {
        navigation.replace(route as never);
        return;
      }

      Alert.alert('QR non reconnu', data.slice(0, 200), [
        { text: 'OK', onPress: () => (scannedRef.current = false) },
      ]);
    },
    [navigation]
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Le scan QR nécessite l’appareil photo sur mobile.</Text>
        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>La caméra est nécessaire pour scanner un QR code.</Text>
        <Pressable style={styles.btn} onPress={() => requestPermission()}>
          <Text style={styles.btnText}>Autoriser la caméra</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnGhostText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Scanner un QR</Text>
        <Text style={styles.hint}>
          Liens acceptés : monsite://menu, monsite://carte, ou https://ton-site/app/... si configuré.
        </Text>
      </View>

      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {lastUrl && (
        <View style={styles.footer}>
          <Text style={styles.lastLabel}>Dernier scan</Text>
          <Text style={styles.lastUrl} numberOfLines={3}>
            {lastUrl}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#1E293B',
  },
  back: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  footer: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  lastLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lastUrl: {
    fontSize: 12,
    color: '#E2E8F0',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  muted: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnGhostText: {
    color: '#475569',
    fontWeight: '600',
  },
});
