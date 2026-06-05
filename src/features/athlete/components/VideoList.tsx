import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { DataRow, Divider, EmptyState, SectionHeader } from '@/components/ui';
import { spacing } from '@/theme';

/** Vídeos/jogadas — opens each link in an in-app browser. */
export function VideoList({ videos }: { videos: string[] }) {
  const count = videos.length;
  const eyebrow = count > 0
    ? `V Í D E O S · & · J O G A D A S · ${count}`
    : 'V Í D E O S · & · J O G A D A S';

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow={eyebrow} />
      {count === 0 ? (
        <EmptyState
          icon="video"
          title="Nenhum vídeo ainda.."
          message="Adicione links das suas melhores jogadas. É o que clubes veem primeiro."
        />
      ) : (
        <View>
          {videos.map((url, index) => (
            <View key={url}>
              {index > 0 && <Divider />}
              <DataRow
                icon="play"
                title={`Jogada ${String(index + 1).padStart(2, '0')}`}
                meta={url}
                chevron
                onPress={() => WebBrowser.openBrowserAsync(url)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
});
