import { useLocalSearchParams } from "expo-router";

import { ContractorPublicScreen } from "@/features/contractor/screens/ContractorPublicScreen";

export default function ContractorDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ContractorPublicScreen contractorId={id} />;
}
