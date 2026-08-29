import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, LayoutChangeEvent } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ScratchCardProps {
  emoji: string;
  image?: any;
  onComplete: () => void;
  isComplete: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  emoji,
  image,
  onComplete,
  isComplete,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCoverVisible, setIsCoverVisible] = useState(true);

  // Shared values for high-performance UI-thread calculations
  const pathState = useSharedValue(Skia.Path.Make());
  const cardWidth = useSharedValue(0);
  const cardHeight = useSharedValue(0);
  const grid = useSharedValue<boolean[]>(new Array(64).fill(false));
  const revealPercentage = useSharedValue(0);
  const isCompleteTriggered = useSharedValue(false);
  const canvasOpacity = useSharedValue(1);

  // Sync parent state (e.g. if category/question changes)
  useEffect(() => {
    // Reset canvas path and grid on question changes
    pathState.value = Skia.Path.Make();
    grid.value = new Array(64).fill(false);
    revealPercentage.value = 0;
    isCompleteTriggered.value = false;
    canvasOpacity.value = 1;
    setIsCoverVisible(true);
  }, [emoji, image, pathState, grid, revealPercentage, isCompleteTriggered, canvasOpacity]);

  // When parent tells us it's complete, fade out the cover canvas
  useEffect(() => {
    if (isComplete) {
      canvasOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsCoverVisible)(false);
        }
      });
    }
  }, [isComplete, canvasOpacity]);

  const handleComplete = () => {
    onComplete();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
    cardWidth.value = width;
    cardHeight.value = height;
  };

  // Reanimated gesture for scratching
  const panGesture = Gesture.Pan()
    .enabled(!isComplete)
    .onStart((e) => {
      const p = Skia.Path.Make();
      p.addPath(pathState.value);
      p.moveTo(e.x, e.y);
      pathState.value = p;
    })
    .onChange((e) => {
      const p = Skia.Path.Make();
      p.addPath(pathState.value);
      p.lineTo(e.x, e.y);
      pathState.value = p;

      // Check reveal percentage on UI thread
      const cellW = cardWidth.value / 8;
      const cellH = cardHeight.value / 8;
      if (cellW <= 0 || cellH <= 0) return;

      const radius = 35; // Large kid-friendly touch brush
      let updated = false;
      const newGrid = [...grid.value];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const idx = r * 8 + c;
          if (newGrid[idx]) continue;

          const cellX = c * cellW + cellW / 2;
          const cellY = r * cellH + cellH / 2;

          const dx = cellX - e.x;
          const dy = cellY - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            newGrid[idx] = true;
            updated = true;
          }
        }
      }

      if (updated) {
        grid.value = newGrid;
        let count = 0;
        for (let i = 0; i < 64; i++) {
          if (newGrid[i]) count++;
        }
        const percent = count / 64;
        revealPercentage.value = percent;

        if (percent >= 0.5 && !isCompleteTriggered.value) {
          isCompleteTriggered.value = true;
          runOnJS(handleComplete)();
        }
      }
    });

  // Animated styles for fading out the scratch layer
  const animatedCanvasStyle = useAnimatedStyle(() => {
    return {
      opacity: canvasOpacity.value,
      // Disable pointer events when fully revealed
      pointerEvents: canvasOpacity.value === 0 ? 'none' : 'auto',
    };
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* 1. Underneath revealed content */}
      <View style={styles.revealedContent}>
        {image ? (
          <Animated.Image
            source={image}
            style={styles.revealedImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.revealedEmoji} adjustsFontSizeToFit>
            {emoji}
          </Text>
        )}
      </View>

      {/* 2. Overlapping Scratch Layer (Skia Canvas) */}
      {isCoverVisible && dimensions.width > 0 && dimensions.height > 0 && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.canvasWrapper, animatedCanvasStyle]}>
            <Canvas style={styles.canvas}>
              {/* Group with layer enables offscreen rendering to support DST_OUT/CLEAR blend mode */}
              <Group layer>
                {/* The Cover Layer: pastel grey-blue background */}
                <Path
                  path={(() => {
                    const rectPath = Skia.Path.Make();
                    rectPath.addRect(
                      Skia.XYWHRect(0, 0, dimensions.width, dimensions.height)
                    );
                    return rectPath;
                  })()}
                  color="#D1D8E0"
                />

                {/* The Scratched Paths drawn with blendMode="clear" */}
                <Path
                  path={pathState}
                  strokeWidth={70} // Match radius * 2
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="clear"
                />
              </Group>
            </Canvas>

            {/* Hint text to guide the child */}
            {!isComplete && (
              <View style={styles.hintContainer} pointerEvents="none">
                <Text style={styles.hintTitle}>SCRATCH HERE!</Text>
                <Text style={styles.hintSub}>✨ 🖐🏼 ✨</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#FFF8EA',
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  revealedContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
  },
  revealedEmoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  revealedImage: {
    width: '80%',
    height: '80%',
  },
  canvasWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
  hintContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4B6584',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hintSub: {
    fontSize: 32,
    marginTop: 8,
  },
});
