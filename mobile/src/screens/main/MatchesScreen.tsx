import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../utils/colors';
import { matchService } from '../../services/api/match.service';
import MatchCard from '../../components/MatchCard';
import { AppStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const TABS = [
  { key: 'matches',     label: 'Matches',    stages: ['matched'] },
  { key: 'vibe_checks', label: 'Vibe Check', stages: ['vibe_check'] },
  { key: 'dates',       label: 'Dates',      stages: ['superdate', 'dating'] },
];

export default function MatchesScreen() {
  const navigation = useNavigation<Nav>();
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => { loadMatches(); }, []);

  async function loadMatches() {
    try {
      const res = await matchService.getMatches();
      setAllMatches(res.matches || []);
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

  const filtered = allMatches.filter(m =>
    TABS[activeTab].stages.includes(m.stage || 'matched')
  );

  const counts = TABS.map(tab =>
    allMatches.filter(m => tab.stages.includes(m.stage || 'matched')).length
  );

  const emptyMessages = [
    { emoji: '💔', title: 'No new matches yet', sub: 'Keep swiping to find your match!' },
    { emoji: '🎥', title: 'No Vibe Checks yet', sub: 'Schedule a call with your matches' },
    { emoji: '🍷', title: 'No dates yet', sub: 'Complete a Vibe Check to plan your date' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>My Dates</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {counts[i] > 0 && (
              <Text style={[styles.tabCount, activeTab === i && styles.tabCountActive]}>
                {' '}{counts[i]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>{emptyMessages[activeTab].emoji}</Text>
          <Text style={styles.emptyTitle}>{emptyMessages[activeTab].title}</Text>
          <Text style={styles.emptySub}>{emptyMessages[activeTab].sub}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.match_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleMatchPress(item)} activeOpacity={0.7}>
              <MatchCard match={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerBlock: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: { backgroundColor: colors.primary },
  tabLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabLabelActive: { color: '#fff' },
  tabCount: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  tabCountActive: { color: '#fff' },

  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptySub: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
