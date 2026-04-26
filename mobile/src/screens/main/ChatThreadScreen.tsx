import React, { useEffect, useState, useRef } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { colors } from '../../utils/colors';
import { chatService } from '../../services/api/chat.service';
import { useAuth } from '../../store/AuthContext';
import MessageBubble from '../../components/MessageBubble';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../navigation/AppNavigator';

type Route = RouteProp<AppStackParamList, 'ChatThread'>;

export default function ChatThreadScreen() {
  const route = useRoute<Route>();
  const { matchId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      const res = await chatService.getMessages(matchId);
      setMessages(res.messages || []);
      if (loading) setLoading(false);
    } catch (err: any) {
      if (loading) {
        Alert.alert('Error', err.message);
        setLoading(false);
      }
    }
  }

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    const tempText = text.trim();
    setText('');
    try {
      const res = await chatService.sendMessage(matchId, tempText);
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setText(tempText);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.sender_id === user?.id} />
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending || !text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? '#fff' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: 16, gap: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card,
  },
  input: {
    flex: 1, backgroundColor: colors.inputBackground, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: colors.text, maxHeight: 100, fontSize: 15,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
