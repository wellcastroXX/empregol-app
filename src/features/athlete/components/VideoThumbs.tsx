import * as WebBrowser from "expo-web-browser";
import {
  Alert,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState, SectionHeader, VideoThumb } from "@/components/ui";
import { spacing } from "@/theme";
import type { AthleteMediaItem } from "@/types";

/** seconds → "2:18". */
function formatDuration(secs?: number): string | undefined {
  if (!secs) return undefined;
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Opens a media URL safely — normalizes bare links, guards local URIs (no crash). */
async function openMedia(url: string): Promise<void> {
  const raw = url.trim();
  if (!raw) {
    Alert.alert("Mídia indisponível", "Este conteúdo não tem um link válido.");
    return;
  }
  // Arquivo local (ainda não enviado ao servidor) — não dá pra abrir no navegador.
  if (/^(file|content):/i.test(raw)) {
    Alert.alert(
      "Mídia não publicada",
      "Este arquivo ainda não foi enviado para o servidor.",
    );
    return;
  }
  // Link sem protocolo (ex.: "youtube.com/...") → assume https.
  const target = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    await WebBrowser.openBrowserAsync(target);
  } catch {
    Alert.alert("Não foi possível abrir", "Tente novamente em instantes.");
  }
}

export type VideoThumbsProps = {
  media: AthleteMediaItem[];
  /** Athlete profile photo used as each card's background (black when absent). */
  photoUrl?: string;
  jerseyNumber?: number;
  emptyMessage?: string;
  onOpen?: (item: AthleteMediaItem) => void;
  /** Dark canvas (contractor environment). */
  dark?: boolean;
};

/** Vídeos/jogadas — horizontal carousel of brand media cards. */
export function VideoThumbs({
  media,
  photoUrl,
  jerseyNumber,
  emptyMessage,
  onOpen,
  dark,
}: VideoThumbsProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.round(width * 0.6);
  const count = media.length;
  const eyebrow =
    count > 0
      ? `V Í D E O S · & · J O G A D A S · ${count}`
      : "V Í D E O S · & · J O G A D A S";

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow={eyebrow} dark={dark} />
      {count === 0 ? (
        <EmptyState
          icon="video"
          title="Nenhum vídeo ainda.."
          message={emptyMessage ?? "Esse atleta ainda não subiu jogadas."}
          dark={dark}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + spacing.md}
          contentContainerStyle={styles.scroll}
        >
          {media.map((item, index) => (
            <VideoThumb
              key={item.id ?? `${item.url}-${index}`}
              width={cardWidth}
              photoUrl={photoUrl}
              jerseyNumber={jerseyNumber}
              category={item.categoria}
              title={item.titulo}
              gameInfo={item.jogoInfo}
              duration={formatDuration(item.duracaoSegundos)}
              onPress={() => (onOpen ? onOpen(item) : openMedia(item.url))}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  scroll: {
    gap: spacing.md,
    paddingRight: "5%",
  },
});
