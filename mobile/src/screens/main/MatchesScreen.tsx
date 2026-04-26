import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../utils/colors';
import { matchService } from '../../services/api/match.service';
import MatchCard from '../../components/MatchCard';
import { AppStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function MatchesScreen() {
  const navigation = useNavigation<Nav>();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMatches(); }, []);

  async function loadMatches() {
    try {
      const res = await matchService.getMatches();
      setMatches(res.matches || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMatchPress(item: any) {
    const { match_id, first_name, stage, chat_unlocked } = item;
    if (chat_unlocked || stage === 'dating') {
      navigation.navigate('ChatThread', { matchId: match_id, matchName: first_name });
    } else if (stage === 'superdate') {
      navigation.navigate('SuperDate', { matchId: match_id, matchName: first_name });
    } else {
      navigation.navigate('VibeCheck', { matchId: match_id, matchName: first_name });
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches ♥</Text>
      {matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>Keep swiping to find your match!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleMatchPress(item)}>
              <MatchCard match={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '800', color: colors.text, paddingHorizontal: 20, marginBottom: 8 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
});
