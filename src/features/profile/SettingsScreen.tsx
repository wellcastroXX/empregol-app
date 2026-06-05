import { Alert, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Button,
  DataRow,
  Divider,
  ScreenHeader,
  Screen,
  Tag,
  Text,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';

/** Ajustes — account summary + menu + sign out. */
export function SettingsScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const verified = user.verificacao === 'verified';

  const confirmSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <ScreenHeader title="Ajustes" />

      <View style={styles.account}>
        <Avatar name={user.nome} uri={user.fotoUrl} size={56} tone="ink" />
        <View style={styles.accountInfo}>
          <Text variant="h3" color={colors.fg}>
            {user.nome}
          </Text>
          <Text variant="sm" color={colors.fgMuted}>
            {user.email}
          </Text>
        </View>
        <Tag
          label={verified ? 'VERIFICADO' : 'PENDENTE'}
          variant={verified ? 'live' : 'warn'}
        />
      </View>

      <View style={styles.menu}>
        <DataRow icon="user" title="Editar perfil" chevron onPress={() => {}} />
        <Divider />
        <DataRow icon="bell" title="Notificações" chevron onPress={() => {}} />
        <Divider />
        <DataRow icon="shield" title="Privacidade e segurança" chevron onPress={() => {}} />
        <Divider />
        <DataRow icon="help-circle" title="Ajuda e suporte" chevron onPress={() => {}} />
      </View>

      <Button label="Sair da conta" variant="ghost" fullWidth onPress={confirmSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing['2xl'],
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  accountInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
