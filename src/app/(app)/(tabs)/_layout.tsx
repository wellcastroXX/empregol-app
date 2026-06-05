import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, fontFamily, palette } from '@/theme';

/** Bottom tabs for the logged-in area: FEED · EXPLORAR · CONVERSAS · PERFIL. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.gramado,
        tabBarInactiveTintColor: colors.fgMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.rule,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 1.4 },
        tabBarItemStyle: { paddingTop: 4 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'FEED',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'EXPLORAR',
          tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="conversas"
        options={{
          title: 'CONVERSAS',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
      {/* Reachable from the profile (gear), not shown in the bar. */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
