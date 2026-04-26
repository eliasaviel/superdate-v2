import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../utils/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HEIGHT = Dimensions.get('window').height * 0.6;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

interface Props {
  card: {
    first_name: string;
    last_name?: string;
    age: number;
    city?: string;
    bio?: string;
    religion?: string;
    religious_lifestyle?: string;
    primary_photo?: string;
  };
  style?: any;
}

export default function SwipeCard({ card, style }: Props) {
  const photoUri = card.primary_photo
    ? card.primary_photo.startsWith('/')
      ? `${BASE_URL}${card.primary_photo}`
      : card.primary_photo
    : null;

  return (
    <View style={[styles.card, style]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderEmoji}>👤</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.name}>
          {card.first_name}{card.last_name ? ` ${card.last_name}` : ''}, {card.age}
        </Text>
        {card.city && <Text style={styles.city}>📍 {card.city}</Text>}
        {(card.religion || card.religious_lifestyle) && (
          <Text style={styles.religion}>
            ✡ {[card.religion, card.religious_lifestyle].filter(Boolean).join(' · ')}
          </Text>
        )}
        {card.bio && <Text style={styles.bio} numberOfLines={2}>{card.bio}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.card,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  imagePlaceholder: {
    width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.cardLight,
  },
  placeholderEmoji: { fontSize: 80 },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 24,
    background: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  name: { color: '#fff', fontSize: 26, fontWeight: '800' },
  city: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  religion: { color: colors.primary, fontSize: 13, marginTop: 2 },
  bio: { color: '#ccc', fontSize: 13, marginTop: 8 },
});
