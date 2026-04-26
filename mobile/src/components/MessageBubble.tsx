import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

interface Props {
  message: { message_text: string; created_at: string };
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  const time = new Date(message.created_at).toLocaleTimeString('en-IL', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={styles.text}>{message.message_text}</Text>
        <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%', borderRadius: 18, padding: 12,
    paddingHorizontal: 16,
  },
  bubbleOwn: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
  text: { color: '#fff', fontSize: 15 },
  time: { fontSize: 10, marginTop: 4 },
  timeOwn: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  timeOther: { color: colors.textMuted },
});
