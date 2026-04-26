import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors } from '../../utils/colors';
import { authService } from '../../services/api/auth.service';
import { useAuth } from '../../store/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
  });
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleRegister() {
    if (!form.first_name.trim()) return Alert.alert('Error', 'First name is required');
    if (!form.email.trim() && !form.phone.trim()) return Alert.alert('Error', 'Email or phone is required');
    if (form.email && !isValidEmail(form.email)) return Alert.alert('Error', 'Invalid email address');
    if (!isValidPassword(form.password)) return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await authService.register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      await login(res.token, res.user);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account 🔥</Text>
        <Text style={styles.subtitle}>Join SuperDate today</Text>

        <View style={styles.form}>
          {[
            { key: 'first_name', label: 'First Name *', placeholder: 'Aviel', keyboardType: 'default' },
            { key: 'last_name', label: 'Last Name', placeholder: 'Elias', keyboardType: 'default' },
            { key: 'email', label: 'Email', placeholder: 'you@example.com', keyboardType: 'email-address' },
            { key: 'phone', label: 'Phone', placeholder: '050-1234567', keyboardType: 'phone-pad' },
            { key: 'password', label: 'Password *', placeholder: 'At least 6 characters', keyboardType: 'default' },
          ].map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                value={(form as any)[field.key]}
                onChangeText={(v) => update(field.key, v)}
                keyboardType={field.keyboardType as any}
                secureTextEntry={field.key === 'password'}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { color: colors.primary, fontSize: 16 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textSecondary, marginTop: 6, marginBottom: 32, fontSize: 15 },
  form: { gap: 12 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
    color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
