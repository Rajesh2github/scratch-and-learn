import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { TraceableCharacter } from '../features/tracing/tracingEngine';
import { SoundManager } from '../utils/audio';

interface TracingBoardProps {
  item: TraceableCharacter;
  onNext: () => void;
}

export const TracingBoard: React.FC<TracingBoardProps> = ({ item, onNext }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);

  // High performance UI thread path for Skia
  const pathState = useSharedValue(Skia.Path.Make());

  const markDrawn = useCallback(() => {
    setHasDrawn(true);
  }, []);

  useEffect(() => {
    // Reset path when character changes
    pathState.value = Skia.Path.Make();
    setHasDrawn(false);
    if (item && item.char) {
      SoundManager.playWord(item.char);
    }
  }, [item, pathState]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      'worklet';
      const p = Skia.Path.Make();
      p.addPath(pathState.value);
      p.moveTo(e.x, e.y);
      pathState.value = p;
      runOnJS(markDrawn)();
    })
    .onChange((e) => {
      'worklet';
      const p = Skia.Path.Make();
      p.addPath(pathState.value);
      p.lineTo(e.x, e.y);
      pathState.value = p;
    });

  const handleClear = () => {
    pathState.value = Skia.Path.Make();
    setHasDrawn(false);
  };

  const handleSpeak = () => {
    if (item && item.char) {
      SoundManager.playWord(item.char);
    }
  };

  return (
    <View style={styles.container}>
      {/* Target Card Header */}
      <View style={styles.charHeader}>
        <Text style={styles.charEmoji}>{item?.emoji || '✏️'}</Text>
        <Text style={styles.charTitle}>
          {item?.char} is for {item?.name}
        </Text>
        <TouchableOpacity style={styles.soundBtn} onPress={handleSpeak}>
          <Text style={styles.soundBtnText}>📢 Listen</Text>
        </TouchableOpacity>
      </View>

      {/* Tracing Canvas Area */}
      <View style={styles.canvasContainer} onLayout={onLayout}>
        {/* Large Dashed Guide Underneath */}
        <View style={styles.guideContainer} pointerEvents="none">
          <Text
            style={styles.guideText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item?.char}
          </Text>
        </View>

        {/* User's Drawn Path Overlay */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.canvasWrapper}>
              <Canvas style={styles.canvas}>
                <Path
                  path={pathState}
                  color="#4D96FF"
                  strokeWidth={28}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                />
              </Canvas>
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      <Text style={styles.hintText}>{item?.hint}</Text>

      {/* Action Controls */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear drawing"
        >
          <Text style={styles.clearBtnText}>🔄 Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, !hasDrawn && styles.nextBtnDisabled]}
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel="Next character"
        >
          <Text style={styles.nextBtnText}>Great! Next ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  charHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  charEmoji: {
    fontSize: 52,
  },
  charTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2D3748',
    marginTop: 2,
  },
  soundBtn: {
    backgroundColor: '#E6F4FE',
    borderWidth: 1.5,
    borderColor: '#4D96FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  soundBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0066CC',
  },
  canvasContainer: {
    width: 290,
    height: 310,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#FFD93D',
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    fontSize: 160,
    fontWeight: '900',
    color: '#E2E8F0',
  },
  canvasWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B6B',
    marginTop: 10,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginTop: 14,
  },
  clearBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#6BCB77',
    borderWidth: 3,
    borderColor: '#4BAA57',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginLeft: 12,
    alignItems: 'center',
    elevation: 2,
  },
  nextBtnDisabled: {
    backgroundColor: '#94A3B8',
    borderColor: '#64748B',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
