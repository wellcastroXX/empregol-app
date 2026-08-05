import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import WordmarkCream from '@/assets/images/logo/empregol-wordmark-cream.svg';
import { palette } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');

// Wordmark maior e centralizado.
const WORD_W = Math.round(W * 0.82);
const WORD_H = Math.round(WORD_W / (692 / 130.59)); // razão real do wordmark
const STAGE_LEFT = Math.round((W - WORD_W) / 2);

const KEEP_W = Math.round(WORD_W * 0.1); // largura do "e" que sobra (apaga até aqui)
const MAX_WIPE = WORD_W - KEEP_W; // quanto o overlay apaga

// O ponto do "e." é o próprio círculo creme (que depois expande).
const DOT = Math.round(WORD_H * 0.22); // menor
const DOT_X = STAGE_LEFT + KEEP_W + Math.round(DOT * 1.4); // mais à direita do "e"
const DOT_Y = Math.round(H / 2 + WORD_H * 0.2);
const COVER = (Math.max(W, H) * 2.6) / DOT;

const STEPS = 8; // m · p · r · e · g · o · l · .
const STEP_MS = 150;
const HOLD_BEFORE = 900;
const HOLD_AFTER = 2000;

/**
 * Splash de marca com o SVG real da logo (única). O wordmark "empregol." aparece
 * centralizado e um overlay verde (cor do fundo) o "apaga" letra por letra, da
 * direita p/ a esquerda, com um cursor "|" — até sobrar o "e". O ponto então
 * surge (círculo creme = o "." do "e.") e expande, revelando o login.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const wipe = useRef(new Animated.Value(0)).current; // largura do overlay
  const dotOp = useRef(new Animated.Value(0)).current; // surgimento do ponto
  const grow = useRef(new Animated.Value(0)).current; // expansão do ponto
  const blink = useRef(new Animated.Value(1)).current; // cursor piscando

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  useEffect(() => {
    const deleteSteps = Array.from({ length: STEPS }, (_, i) =>
      Animated.timing(wipe, {
        toValue: Math.round((MAX_WIPE * (i + 1)) / STEPS),
        duration: STEP_MS,
        easing: Easing.linear,
        useNativeDriver: false, // largura (layout)
      }),
    );
    const seq = Animated.sequence([
      Animated.delay(HOLD_BEFORE),
      ...deleteSteps,
      Animated.timing(dotOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(HOLD_AFTER),
      Animated.timing(grow, { toValue: 1, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    seq.start(({ finished }) => finished && onDone());
    return () => seq.stop();
  }, [wipe, dotOp, grow, onDone]);

  const cursorOpacity = Animated.multiply(
    blink,
    dotOp.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  );

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      <View style={styles.stage}>
        <WordmarkCream width={WORD_W} height={WORD_H} style={styles.layer} />
        <Animated.View style={[styles.eraser, { width: wipe }]}>
          <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
        </Animated.View>
      </View>

      {/* Ponto do "e." → expande */}
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dotOp,
            transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [1, COVER] }) }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.gramado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    width: WORD_W,
    height: WORD_H,
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  eraser: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    right: 0,
    backgroundColor: palette.gramado,
  },
  cursor: {
    position: 'absolute',
    left: -3,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 1,
    backgroundColor: palette.creme,
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    left: DOT_X - DOT / 2,
    top: DOT_Y - DOT / 2,
    backgroundColor: palette.creme,
  },
});
