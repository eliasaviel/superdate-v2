import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../utils/colors';
import { useAuth } from '../../store/AuthContext';
import { userService } from '../../services/api/user.service';
import { photoService } from '../../services/api/photo.service';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';

const RELIGIONS = ['Jewish', 'Christian', 'Muslim', 'Druze', 'Other'];
const LIFESTYLES = ['Secular', 'Traditional', 'Religious'];
const GENDERS = ['male', 'female', 'other'];
const INTERESTS = ['male', 'female', 'both'];

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const res = await userService.getMe();
      setForm(res.user);
      setPhotos(res.photos || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await userService.updateMe(form);
      setUser(res.user);
      Alert.alert('Saved', 'Profile updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Please allow photo access'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const res = await photoService.uploadPhoto(result.assets[0].uri);
        setPhotos((prev) => [...prev, res.photo]);
      } catch (err: any) {
        Alert.alert('Upload failed', err.message);
      } finally {
        setUploading(false);
      }
    }
  }

  async function deletePhoto(photoId: string) {
    try {
      await photoService.deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 50, paddingBottom: 60 }}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Profile</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Photos */}
      <Text style={styles.section}>Photos</Text>
      <View style={styles.photosGrid}>
        {photos.map((p) => (
          <View key={p.id} style={styles.photoItem}>
            <Image
              source={{ uri: p.url.startsWith('/') ? `${BASE_URL}${p.url}` : p.url }}
              style={styles.photo}
            />
            <TouchableOpacity style={styles.deletePhoto} onPress={() => deletePhoto(p.id)}>
              <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
            {p.is_primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Main</Text></View>}
          </View>
        ))}
        {photos.length < 6 && (
          <TouchableOpacity style={styles.addPhoto} onPress={pickPhoto} disabled={uploading}>
            {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.addPhotoText}>+</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Basic Info */}
      <Text style={styles.section}>Basic Info</Text>
      {[
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'bio', label: 'Bio', multiline: true },
        { key: 'city', label: 'City' },
      ].map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={[styles.input, f.multiline && { height: 80 }]}
            value={form[f.key] || ''}
            onChangeText={(v) => setForm((prev: any) => ({ ...prev, [f.key]: v }))}
            placeholderTextColor={colors.textMuted}
            multiline={f.multiline}
            placeholder={`Enter ${f.label.toLowerCase()}`}
          />
        </View>
      ))}

      {/* Religion */}
      <Text style={styles.section}>Religion</Text>
      <View style={styles.chips}>
        {RELIGIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, form.religion === r && styles.chipActive]}
            onPress={() => setForm((prev: any) => ({ ...prev, religion: r }))}
          >
            <Text style={[styles.chipText, form.religion === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chips}>
        {LIFESTYLES.map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.chip, form.religious_lifestyle === l && styles.chipActive]}
            onPress={() => setForm((prev: any) => ({ ...prev, religious_lifestyle: l }))}
          >
            <Text style={[styles.chipText, form.religious_lifestyle === l && styles.chipTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gender */}
      <Text style={styles.section}>Gender</Text>
      <View style={styles.chips}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, form.gender === g && styles.chipActive]}
            onPress={() => setForm((prev: any) => ({ ...prev, gender: g }))}
          >
            <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Interested In</Text>
      <View style={styles.chips}>
        {INTERESTS.map((i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, form.interested_in === i && styles.chipActive]}
            onPress={() => setForm((prev: any) => ({ ...prev, interested_in: i }))}
          >
            <Text style={[styles.chipText, form.interested_in === i && styles.chipTextActive]}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 26, fontWeight: '800', color: colors.text },
  logout: { color: colors.primary, fontSize: 14 },
  section: { color: colors.primary, fontWeight: '700', fontSize: 13, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoItem: { width: 100, height: 120, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  deletePhoto: {
    position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  primaryBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.primary, padding: 2,
  },
  primaryText: { color: '#fff', fontSize: 10, textAlign: 'center', fontWeight: '700' },
  addPhoto: {
    width: 100, height: 120, borderRadius: 12, borderWidth: 2, borderColor: colors.border,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
  },
  addPhotoText: { color: colors.textMuted, fontSize: 32 },
  field: { marginBottom: 12 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBackground, borderRadius: 12, padding: 14,
    color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
