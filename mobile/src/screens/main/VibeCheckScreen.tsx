import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../utils/colors';
import { vibecheckService } from '../../services/api/vibecheck.service';

type Props = {
  route: { params: { matchId: string; matchName: string } };
  navigation: any;
};

export default function VibeCheckScreen({ route, navigation }: Props) {
  const { matchId, matchName } = route.params;
  const [vibeCheck, setVibeCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await vibecheckService.get(matchId);
      setVibeCheck(res.vibeCheck);
    } catch {
      // no vibe check yet
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    setActing(true);
    try {
      const res = await vibecheckService.schedule(matchId);
      setVibeCheck(res.vibeCheck);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  }

  async function handleJoin() {
    if (!vibeCheck?.daily_room_url) return;
    await WebBrowser.openBrowserAsync(vibeCheck.daily_room_url);
  }

  async function handleConfirm() {
    setActing(true);
    try {
      const res = await vibecheckService.confirm(matchId);
      setVibeCheck(res.vibeCheck);
      if (res.bothConfirmed) {
        Alert.alert(
          '🎉 Vibe Check Complete!',
          'Both of you confirmed! Time to plan your SuperDate.',
          [{ text: 'Choose a Venue', onPress: () => navigation.replace('SuperDate', { matchId, matchName }) }]
        );
      } else {
        Alert.alert('✅ Confirmed', 'Waiting for your match to confirm too.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🎥</Text>
      <Text style={styles.title}>Vibe Check</Text>
      <Text style={styles.subtitle}>
        A 7-minute video call with <Text style={{ color: colors.primary }}>{matchName}</Text>
        {'\n'}to see if there's a real spark.
      </Text>

      {!vibeCheck && (
        <View style={styles.card}>
          <Text style={styles.cardText}>No Vibe Check scheduled yet.</Text>
          <TouchableOpacity style={styles.btn} onPress={handleSchedule} disabled={acting}>
            {acting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>📅 Schedule Vibe Check</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {vibeCheck && (
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, vibeCheck.status === 'confirmed' && { color: '#4CAF50' }]}>
              {vibeCheck.status === 'confirmed' ? '✅ Confirmed' : vibeCheck.status === 'scheduled' ? '📅 Scheduled' : vibeCheck.status}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Your confirmation</Text>
            <Text style={styles.statusValue}>{vibeCheck.user1_confirmed || vibeCheck.user2_confirmed ? '✅' : '⏳ Pending'}</Text>
          </View>

          {vibeCheck.status !== 'confirmed' && (
            <>
              <TouchableOpacity style={styles.btn} onPress={handleJoin}>
                <Text style={styles.btnText}>🎥 Join Video Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleConfirm} disabled={acting}>
                {acting
                  ? <ActivityIndicator color={colors.primary} />
                  : <Text style={[styles.btnText, { color: colors.primary }]}>✅ Confirm the Vibe</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {vibeCheck.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.replace('SuperDate', { matchId, matchName })}
            >
              <Text style={styles.btnText}>🍷 Plan Your SuperDate</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.rules}>
        <Text style={styles.rulesTitle}>How it works</Text>
        <Text style={styles.rule}>• Both of you join the 7-minute video call</Text>
        <Text style={styles.rule}>• After the call, each confirms "the vibe"</Text>
        <Text style={styles.rule}>• If both confirm → pick a venue & pay for a real date</Text>
        <Text style={styles.rule}>• Chat only opens after both pay 💳</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emoji: { fontSize: 64, marginTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  card: { width: '100%', backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 24, gap: 12 },
  cardText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { color: colors.textSecondary, fontSize: 14 },
  statusValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rules: { width: '100%', marginTop: 32, padding: 20, backgroundColor: colors.card, borderRadius: 16 },
  rulesTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  rule: { color: colors.textSecondary, fontSize: 13, lineHeight: 22 },
});
