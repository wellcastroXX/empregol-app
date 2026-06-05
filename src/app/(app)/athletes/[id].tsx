import { useLocalSearchParams } from 'expo-router';

import { AthleteProfileScreen } from '@/features/athlete/screens/AthleteProfileScreen';

export default function AthleteDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AthleteProfileScreen athleteId={id} scout />;
}
