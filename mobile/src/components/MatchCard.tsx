import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  matched: { label: '💬 Schedule Vibe Check', color: '#FF6B35' },
  vibe_check: { label: '🎥 Vibe Check', color: '#9C27B0' },
  superdate: { label: '🍷 Plan SuperDate', color: '#E91E63' },
  dating: { label: '💬 Chat Open', color: '#4CAF50' },
};

interface Props {
  match: {
    first_name: string;
    age?: number;
    city?: string;
    primary_photo?: string;
    matched_at?: string;
    last_message?: string;
    stage?: string;
    chat_unlocked?: boolean;
  };
}

export default function MatchCard({ match }: Props) {
  const photoUri = match.primary_photo
    ? match.primary_photo.startsWith('/')
      ? `${BASE_URL}${match.primary_photo}`
      : match.primary_photo
    : null;

  const stageInfo = STAGE_LABELS[match.stage || 'matched'] || STAGE_LABELS.matched;

  return (
    <View style={styles.card}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>
          {match.first_name}{match.age ? `, ${match.age}` : ''}
        </Text>
        {match.city && <Text style={styles.city}>📍 {match.city}</Text>}
        <View style={[styles.stageBadge, { backgroundColor: stageInfo.color + '22' }]}>
          <Text style={[styles.stageText, { color: stageInfo.color }]}>{stageInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  avatarPlaceholder: {
    width: 56, height: 56, borderRadius: 28, marginRight: 14,
    backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  city: { color: colors.textSecondary, fontSize: 13 },
  stageBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  stageText: { fontSize: 12, fontWeight: '700' },
  arrow: { color: colors.textSecondary, fontSize: 22 },
});
