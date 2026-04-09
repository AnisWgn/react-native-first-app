import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const RED_R = 16;
const ORANGE_R = 14;
const PADDING = 12;
/** Réponse linéaire : position ≈ inclinaison (g), pas d’intégration qui dérive. */
const TILT_GAIN = 2.4;
/** Lissage anti-grésillement (0 = brut, 1 = très mou). ~0.22 = fluide sans gros retard. */
const SMOOTH = 0.22;
const CALIB_SAMPLES = 18;
/** Inversion si sur ton téléphone la boule part du mauvais côté (Android/iOS diffèrent parfois). */
const SIGN_X = -1;
/** Souvent inversé par rapport à l’axe Y écran ; change en 1 si le haut/bas est inversé. */
const SIGN_Y = -1;

type Point = { ox: number; oy: number };

/** Boule orange sur un bord, position aléatoire le long du bord. */
function randomOrangeOnEdge(w: number, h: number, avoidCenter?: { x: number; y: number }): Point {
  const m = PADDING + ORANGE_R;
  const minDist = RED_R + ORANGE_R + 28;

  for (let attempt = 0; attempt < 24; attempt++) {
    const side = Math.floor(Math.random() * 4);
    let ox: number;
    let oy: number;
    if (side === 0) {
      ox = m + Math.random() * Math.max(8, w - 2 * m);
      oy = m;
    } else if (side === 1) {
      ox = w - m;
      oy = m + Math.random() * Math.max(8, h - 2 * m);
    } else if (side === 2) {
      ox = m + Math.random() * Math.max(8, w - 2 * m);
      oy = h - m;
    } else {
      ox = m;
      oy = m + Math.random() * Math.max(8, h - 2 * m);
    }

    if (!avoidCenter) return { ox, oy };
    if (Math.hypot(ox - avoidCenter.x, oy - avoidCenter.y) >= minDist) return { ox, oy };
  }

  return { ox: w / 2, oy: m };
}

function edgeHint(ox: number, oy: number, w: number, h: number): string {
  const dx = ox - w / 2;
  const dy = oy - h / 2;
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy < 0 ? 'Haut' : 'Bas';
  }
  return dx < 0 ? 'Gauche' : 'Droite';
}

export default function JeuGyroscopeScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const [arena, setArena] = useState({ w: 0, h: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [orangePos, setOrangePos] = useState<Point | null>(null);
  const [sensorOk, setSensorOk] = useState<boolean | null>(null);
  const [hits, setHits] = useState(0);
  const offsetRef = useRef({ x: 0, y: 0 });
  const overlapRef = useRef(false);
  const baselineRef = useRef({ x: 0, y: 0 });
  const calibCountRef = useRef(0);
  const calibSumRef = useRef({ x: 0, y: 0 });
  const calibratedRef = useRef(false);

  const syncOffset = useCallback((next: { x: number; y: number }) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  const onArenaLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArena({ w: width, h: height });
  }, []);

  useEffect(() => {
    offsetRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
    overlapRef.current = false;
    calibratedRef.current = false;
    calibCountRef.current = 0;
    calibSumRef.current = { x: 0, y: 0 };
    baselineRef.current = { x: 0, y: 0 };
    if (arena.w >= 80 && arena.h >= 80) {
      setOrangePos(randomOrangeOnEdge(arena.w, arena.h));
    } else {
      setOrangePos(null);
    }
  }, [arena.w, arena.h]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setSensorOk(false);
      return;
    }
    let mounted = true;
    (async () => {
      const ok = await Accelerometer.isAvailableAsync();
      if (!mounted) return;
      setSensorOk(ok);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (sensorOk !== true || arena.w < 80 || arena.h < 80) return;

    Accelerometer.setUpdateInterval(16);

    const maxX = arena.w / 2 - RED_R - PADDING;
    const maxY = arena.h / 2 - RED_R - PADDING;

    const sub = Accelerometer.addListener(({ x, y }) => {
      if (!calibratedRef.current) {
        calibCountRef.current += 1;
        calibSumRef.current.x += x;
        calibSumRef.current.y += y;
        if (calibCountRef.current >= CALIB_SAMPLES) {
          const n = calibCountRef.current;
          baselineRef.current = {
            x: calibSumRef.current.x / n,
            y: calibSumRef.current.y / n,
          };
          calibratedRef.current = true;
          offsetRef.current = { x: 0, y: 0 };
          syncOffset({ x: 0, y: 0 });
        }
        return;
      }

      const dx = x - baselineRef.current.x;
      const dy = y - baselineRef.current.y;

      const targetX = Math.max(
        -maxX,
        Math.min(maxX, SIGN_X * dx * TILT_GAIN * maxX)
      );
      const targetY = Math.max(
        -maxY,
        Math.min(maxY, SIGN_Y * dy * TILT_GAIN * maxY)
      );

      const sx = offsetRef.current.x + (targetX - offsetRef.current.x) * SMOOTH;
      const sy = offsetRef.current.y + (targetY - offsetRef.current.y) * SMOOTH;

      syncOffset({ x: sx, y: sy });
    });

    return () => {
      sub.remove();
    };
  }, [arena.w, arena.h, sensorOk, syncOffset]);

  const cx = arena.w / 2;
  const cy = arena.h / 2;
  const redCenterX = cx + offset.x;
  const redCenterY = cy + offset.y;

  useEffect(() => {
    if (arena.w < 80 || !orangePos) return;
    const { ox, oy } = orangePos;
    const dist = Math.hypot(redCenterX - ox, redCenterY - oy);
    const touching = dist < RED_R + ORANGE_R - 1;
    if (touching && !overlapRef.current) {
      overlapRef.current = true;
      setHits((h) => h + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setOrangePos(randomOrangeOnEdge(arena.w, arena.h, { x: redCenterX, y: redCenterY }));
    } else if (!touching) {
      overlapRef.current = false;
    }
  }, [orangePos, offset.x, offset.y, arena.w, arena.h, redCenterX, redCenterY]);

  const ox = orangePos?.ox ?? cx;
  const oy = orangePos?.oy ?? cy;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Le jeu gyroscope nécessite un téléphone (accéléromètre).</Text>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (sensorOk === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Accéléromètre indisponible sur cet appareil.</Text>
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
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeLabel}>Attrapées</Text>
          <Text style={styles.scoreBadgeValue}>{hits}</Text>
        </View>
      </View>

      <View style={styles.arenaWrap}>
        <View style={styles.arenaCard} onLayout={onArenaLayout}>
          <View style={styles.arena}>
            {arena.w > 0 && (
              <>
                {orangePos && (
                  <View
                    style={[
                      styles.orange,
                      {
                        left: ox - ORANGE_R,
                        top: oy - ORANGE_R,
                      },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.red,
                    {
                      left: redCenterX - RED_R,
                      top: redCenterY - RED_R,
                    },
                  ]}
                />
              </>
            )}
          </View>
        </View>
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
    marginLeft: 130,
    fontWeight: '700',
    color: '#1E293B',
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  scoreBadge: {
    marginTop: 12,
    marginLeft: 120,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scoreBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBadgeValue: {
    marginLeft: 10,
    fontSize: 22,
    fontWeight: '800',
    color: '#6366F1',
  },
  arenaWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  arenaCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  arena: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  red: {
    position: 'absolute',
    width: RED_R * 2,
    height: RED_R * 2,
    borderRadius: RED_R,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FECACA',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  orange: {
    position: 'absolute',
    width: ORANGE_R * 2,
    height: ORANGE_R * 2,
    borderRadius: ORANGE_R,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FDBA74',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomPanel: {
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
    marginBottom: 6,
  },
  hint: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  warn: {
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
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
