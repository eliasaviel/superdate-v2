import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Animated,
  PanResponder, Dimensions, TouchableOpacity, Alert,
} from 'react-native';
import { colors } from '../../utils/colors';
import { discoveryService } from '../../services/api/discovery.service';
import { swipeService } from '../../services/api/swipe.service';
import SwipeCard from '../../components/SwipeCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function DiscoverScreen() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
  });
  const likeOpacity = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1] });
  const passOpacity = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0] });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeCard('LIKE');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeCard('PASS');
      } else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      }
    },
  });

  useEffect(() => { loadCandidates(); }, []);

  async function loadCandidates() {
    try {
      setLoading(true);
      const res = await discoveryService.getCandidates();
      setCandidates(res.candidates || []);
      setCurrentIndex(0);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function swipeCard(action: 'LIKE' | 'PASS') {
    const card = candidates[currentIndex];
    if (!card) return;

    const toX = action === 'LIKE' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(async () => {
      position.setValue({ x: 0, y: 0 });
      try {
        const res = await swipeService.swipe(card.id, action);
        if (res.match) {
          setMatchAlert(`You matched with ${card.first_name}! 🎉`);
          setTimeout(() => setMatchAlert(null), 3000);
        }
      } catch {}
      setCurrentIndex((i) => i + 1);
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentCard = candidates[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SuperDate 🔥</Text>

      {matchAlert && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchText}>{matchAlert}</Text>
        </View>
      )}

      {currentCard ? (
        <View style={styles.cardContainer}>
          {candidates[currentIndex + 1] && (
            <SwipeCard card={candidates[currentIndex + 1]} style={styles.nextCard} />
          )}
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.animatedCard, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
          >
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.passLabel, { opacity: passOpacity }]}>
              <Text style={styles.passLabelText}>PASS</Text>
            </Animated.View>
            <SwipeCard card={currentCard} />
          </Animated.View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.passBtn} onPress={() => swipeCard('PASS')}>
              <Text style={styles.passBtnText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeBtn} onPress={() => swipeCard('LIKE')}>
              <Text style={styles.likeBtnText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🌟</Text>
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptySubtitle}>Check back later for new matches</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadCandidates}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '800', color: colors.primary, textAlign: 'center', marginBottom: 12 },
  cardContainer: { flex: 1, alignItems: 'center' },
  animatedCard: { position: 'absolute', width: '90%' },
  nextCard: { position: 'absolute', width: '90%', transform: [{ scale: 0.95 }] },
  likeLabel: {
    position: 'absolute', top: 40, left: 20, zIndex: 10,
    borderWidth: 3, borderColor: colors.primary, borderRadius: 8, padding: 8,
  },
  likeLabelText: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  passLabel: {
    position: 'absolute', top: 40, right: 20, zIndex: 10,
    borderWidth: 3, borderColor: colors.textMuted, borderRadius: 8, padding: 8,
  },
  passLabelText: { color: colors.textMuted, fontSize: 24, fontWeight: '800' },
  actions: {
    flexDirection: 'row', justifyContent: 'center', gap: 40,
    position: 'absolute', bottom: 30,
  },
  passBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.textMuted,
  },
  passBtnText: { color: colors.textMuted, fontSize: 26 },
  likeBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  likeBtnText: { color: '#fff', fontSize: 30 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '700' },
  emptySubtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
  refreshBtn: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  refreshText: { color: '#fff', fontWeight: '700' },
  matchBanner: {
    backgroundColor: colors.primary, marginHorizontal: 24, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  matchText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
