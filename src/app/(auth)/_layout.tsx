import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

/** Auth flow stack. Redirects into the app once a session exists. */
export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
