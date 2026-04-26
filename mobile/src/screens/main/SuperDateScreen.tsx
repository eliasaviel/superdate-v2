import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { colors } from '../../utils/colors';
import { venuesService } from '../../services/api/venues.service';
import { superdateService } from '../../services/api/superdate.service';

type Props = {
  route: { params: { matchId: string; matchName: string } };
  navigation: any;
};

export default function SuperDateScreen({ route, navigation }: Props) {
  const { matchId, matchName } = route.params;
  const [venues, setVenues] = useState<any[]>([]);
  const [proposal, setProposal] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [venueRes, proposalRes] = await Promise.all([
        venuesService.getAll(),
        superdateService.getProposal(matchId),
      ]);
      setVenues(venueRes.venues || []);
      setProposal(proposalRes.proposal || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handlePropose() {
    if (!selectedVenue) return Alert.alert('Pick a venue first!');
    setActing(true);
    try {
      const res = await superdateService.propose(matchId, selectedVenue.id);
      setProposal(res.proposal);
      Alert.alert('🎉 Proposal Sent!', `You proposed ${selectedVenue.name}! Paying your half now locks the date.`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  }

  async function handlePay() {
    setActing(true);
    try {
      const res = await superdateService.payHalf(matchId);
      setProposal(res.proposal);
      if (res.chatUnlocked) {
        Alert.alert(
          '🎊 Chat Unlocked!',
          'Both of you paid! Your chat is now open. Have an amazing SuperDate!',
          [{ text: 'Open Chat', onPress: () => navigation.replace('ChatThread', { matchId, matchName }) }]
        );
      } else {
        Alert.alert('✅ Payment Confirmed', 'Waiting for your match to pay their half.');
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

  if (proposal) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>🍷</Text>
        <Text style={styles.title}>SuperDate Planned!</Text>
        <Text style={styles.subtitle}>with <Text style={{ color: colors.primary }}>{matchName}</Text></Text>

        <View style={styles.venueCard}>
          {proposal.image_url && <Image source={{ uri: proposal.image_url }} style={styles.venueImg} />}
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{proposal.venue_name}</Text>
            <Text style={styles.venueAddr}>{proposal.address}</Text>
            <Text style={styles.venueCategory}>{proposal.category}</Text>
            <Text style={styles.venuePrice}>₪{proposal.price_per_person} per person</Text>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Status</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Proposer paid</Text>
            <Text style={proposal.proposer_paid ? styles.payYes : styles.payNo}>
              {proposal.proposer_paid ? '✅ Paid' : '⏳ Pending'}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Partner paid</Text>
            <Text style={proposal.receiver_paid ? styles.payYes : styles.payNo}>
              {proposal.receiver_paid ? '✅ Paid' : '⏳ Pending'}
            </Text>
          </View>

          {proposal.status !== 'confirmed' && (
            <TouchableOpacity style={styles.btn} onPress={handlePay} disabled={acting}>
              {acting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>💳 Pay ₪{proposal.price_per_person} (your half)</Text>
              }
            </TouchableOpacity>
          )}

          {proposal.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.replace('ChatThread', { matchId, matchName })}
            >
              <Text style={styles.btnText}>💬 Open Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pick a Venue</Text>
        <Text style={styles.subtitle}>
          Choose the perfect spot for your date with{' '}
          <Text style={{ color: colors.primary }}>{matchName}</Text>
        </Text>
      </View>

      <FlatList
        data={venues}
        keyExtractor={v => v.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.venueCard, selectedVenue?.id === item.id && styles.venueSelected]}
            onPress={() => setSelectedVenue(item)}
            activeOpacity={0.8}
          >
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.venueImg} />}
            <View style={styles.venueInfo}>
              <View style={styles.venueTopRow}>
                <Text style={styles.venueName}>{item.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.venueDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.venueAddr}>{item.address}</Text>
              <Text style={styles.venuePrice}>₪{item.price_per_person} per person</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedVenue && (
        <View style={styles.proposeCta}>
          <TouchableOpacity style={styles.btn} onPress={handlePropose} disabled={acting}>
            {acting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>🍷 Propose {selectedVenue.name}</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  emoji: { fontSize: 64, marginTop: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  venueCard: {
    backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent', width: '100%',
  },
  venueSelected: { borderColor: colors.primary },
  venueImg: { width: '100%', height: 140, resizeMode: 'cover' },
  venueInfo: { padding: 14, gap: 4 },
  venueTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  venueName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  venueDesc: { fontSize: 13, color: colors.textSecondary },
  venueAddr: { fontSize: 12, color: colors.textSecondary },
  venueCategory: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  venuePrice: { fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 4 },
  categoryBadge: {
    backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  categoryText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  paymentCard: { width: '100%', backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 20, gap: 12 },
  paymentTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payLabel: { color: colors.textSecondary, fontSize: 14 },
  payYes: { color: '#4CAF50', fontWeight: '600' },
  payNo: { color: colors.textSecondary, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  proposeCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background, padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
