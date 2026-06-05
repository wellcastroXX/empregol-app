import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AthleteProfileScreen } from '@/features/athlete/screens/AthleteProfileScreen';
import { ContractorProfileScreen } from '@/features/contractor/screens/ContractorProfileScreen';

/** Own profile — renders the athlete or contractor view from the auth user. */
export function MyProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return <Screen />;

  const openSettings = () => router.push('/settings');

  return user.role === 'athlete' ? (
    <AthleteProfileScreen athlete={user} showPersonalData onSettings={openSettings} />
  ) : (
    <ContractorProfileScreen contractor={user} onSettings={openSettings} />
  );
}
