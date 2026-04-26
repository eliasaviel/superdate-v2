import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors } from '../../utils/colors';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'> };

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.hero}>
        <Text style={styles.logo}>🔥</Text>
        <Text style={styles.title}>SuperDate</Text>
        <Text style={styles.subtitle}>Find your match in Israel</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', padding: 32 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 42, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  buttons: { gap: 12 },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnSecondary: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  btnSecondaryText: { color: colors.textSecondary, fontSize: 15 },
});
