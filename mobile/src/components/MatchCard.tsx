import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

type ActionConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  filled: boolean;
};

function getAction(stage: string, chat_unlocked: boolean): ActionConfig {
  if (chat_unlocked || stage === 'dating') {
    return { label: 'Open Chat', icon: 'chatbubble-outline', filled: true };
  }
  if (stage === 'superdate') {
    return { label: 'Plan Date', icon: 'restaurant-outline', filled: true };
  }
  if (stage === 'vibe_check') {
    return { label: 'Call Scheduled', icon: 'videocam-outline', filled: false };
  }
  return { label: 'Schedule Call', icon: 'calendar-outline', filled: true };
}

interface Props {
  match: {
    first_name: string;
    age?: number;
    city?: string;
    primary_photo?: string;
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

  const action = getAction(match.stage || 'matched', !!match.chat_unlocked);

  return (
    <View style={styles.card}>
      {/* Photo */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>
          {match.first_name}{match.age ? `, ${match.age}` : ''}
        </Text>
        {match.city && <Text style={styles.city}>{match.city}</Text>}
      </View>

      {/* Action button */}
      <View style={[styles.actionBtn, !action.filled && styles.actionBtnOutline]}>
        <Ionicons
          name={action.icon}
          size={13}
          color={action.filled ? '#fff' : colors.textSecondary}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.actionText, !action.filled && styles.actionTextOutline]}>
          {action.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 14,
  },
  photo: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  photoPlaceholder: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  city: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  actionText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  actionTextOutline: { color: colors.textSecondary },
});
