import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ChatThreadScreen from '../screens/main/ChatThreadScreen';
import VibeCheckScreen from '../screens/main/VibeCheckScreen';
import SuperDateScreen from '../screens/main/SuperDateScreen';
import { colors } from '../utils/colors';

export type AppStackParamList = {
  MainTabs: undefined;
  ChatThread: { matchId: string; matchName: string };
  VibeCheck: { matchId: string; matchName: string };
  SuperDate: { matchId: string; matchName: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={({ route }) => ({ title: route.params.matchName })}
      />
      <Stack.Screen
        name="VibeCheck"
        component={VibeCheckScreen}
        options={({ route }) => ({ title: `Vibe Check — ${route.params.matchName}` })}
      />
      <Stack.Screen
        name="SuperDate"
        component={SuperDateScreen}
        options={({ route }) => ({ title: `SuperDate — ${route.params.matchName}` })}
      />
    </Stack.Navigator>
  );
}
