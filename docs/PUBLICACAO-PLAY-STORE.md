# Publicação do Empregol nas lojas

Runbook de release. Atualizado em 07/10/2026.

| | |
|---|---|
| Package Android | `com.empregolapp` |
| Bundle ID iOS | `com.empregol` |
| Projeto EAS | `@wellcastrox/empregol-app` (`18fdc8a7-456d-4416-af04-4fd6c263293e`) |
| `version` atual | `1.0.0` |
| `versionCode` atual | `5` (controlado pelo EAS, incrementa sozinho) |
| Keystore de upload | configuração **`Build Credentials 5O9YGXPgGf`** no EAS |
| SHA1 que a Play exige | `D1:9B:99:25:1D:0C:AE:8F:21:34:67:C2:61:8E:4B:7F:72:95:10:72` |

A Play Store **não aceita APK** — o artefato é o **AAB** (`.aab`). Outras lojas
(Galaxy, Amazon, Aptoide) querem APK; veja [Outras lojas](#outras-lojas).

---

# Subir uma nova versão

## Passo 1 — Instalar dependências

**Nunca pule este passo.** Já derrubou dois builds neste projeto.

```sh
npm install
```

Se alguém adicionou uma dependência e você não rodou o install, o `eas build`
falha com uma mensagem que não diz a causa real:

```
node_modules\expo\bin\cli config --json exited with non-zero code: 1
```

Para ver o erro de verdade, rode o comando direto:

```sh
node node_modules/expo/bin/cli config --json
```

Checar o que está declarado mas ausente:

```sh
node -e "const p=require('./package.json'),fs=require('fs');const a={...p.dependencies,...p.devDependencies};const m=Object.keys(a).filter(d=>!fs.existsSync('node_modules/'+d));console.log(m.length?'AUSENTES: '+m.join(', '):'ok')"
```

## Passo 2 — Subir a `version`

Em [`app.json`](../app.json), o campo `expo.version` é o que o usuário vê na
loja. Suba conforme a mudança:

| Mudança | Exemplo |
|---|---|
| Correção de bug | `1.0.0` → `1.0.1` |
| Funcionalidade nova | `1.0.0` → `1.1.0` |
| Redesenho / quebra | `1.0.0` → `2.0.0` |

O **`versionCode`** (o contador interno que a Play usa para ordenar versões)
**não precisa ser mexido** — o `eas.json` usa `appVersionSource: "remote"` com
`autoIncrement`, então o EAS incrementa sozinho a cada build.

> Cada `versionCode` enviado à Play é **consumido para sempre**, mesmo em
> rascunho ou em versão descartada. Nunca dá para reutilizar.

## Passo 3 — Build

```sh
npx eas-cli build --platform android --profile production
```

Confira a linha da keystore no início da saída:

```
✔ Using Keystore from configuration: Build Credentials 5O9YGXPgGf (default)
```

**Se aparecer outro nome, cancele o build** (Ctrl+C e descarte na dashboard) e
veja [Keystore](#keystore-a-parte-mais-perigosa). Assinar com a chave errada
desperdiça a fila inteira.

A fila do plano gratuito tem variado de **30 min a 2 h**; a compilação em si
leva ~20 min. Para não ficar olhando, use `--no-wait` e acompanhe pelo link.

## Passo 4 — Conferir a assinatura antes de subir

Esta etapa existe porque o erro já aconteceu. A Play rejeita o AAB se a
assinatura divergir, e você só descobre **depois** de esperar a fila.

```sh
# baixe o .aab pelo link do build, depois:
keytool -printcert -jarfile empregol-v1.0.0-vc5.aab | grep SHA1
```

Tem que sair **exatamente**:

```
SHA1: D1:9B:99:25:1D:0C:AE:8F:21:34:67:C2:61:8E:4B:7F:72:95:10:72
```

Verificação automática:

```sh
keytool -printcert -jarfile SEU_ARQUIVO.aab 2>&1 \
  | grep -q "D1:9B:99:25:1D:0C:AE:8F:21:34:67:C2:61:8E:4B:7F:72:95:10:72" \
  && echo "CONFERE: pode subir" || echo "DIVERGENTE: nao suba"
```

Se usar `eas submit` (Passo 5A), o download é automático e esta conferência é
opcional — mas continua valendo quando houver qualquer dúvida sobre credenciais.

## Passo 5A — Enviar automaticamente (Expo → Google)

Caminho recomendado. A service account já está em
`credentials/google-service-account.json` e o `eas.json` já aponta para ela.

```sh
npx eas-cli submit --platform android --profile production --latest
```

`--latest` pega o build mais recente da nuvem — não precisa baixar nada.

Pelo [`eas.json`](../eas.json), cai em **teste interno** como **rascunho**:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./credentials/google-service-account.json",
      "track": "internal",
      "releaseStatus": "draft"
    }
  }
}
```

Nada vai ao ar sem você promover na Play Console (Passo 6).

### Build e envio num comando

```sh
npx eas-cli build --platform android --profile production --auto-submit
```

Envia sozinho ao terminar. **Use só quando a keystore estiver confirmada** — com
`--auto-submit` você não tem a chance de conferir a assinatura antes.

### Enviar direto para produção

Para pular o teste interno, mude o `track` no `eas.json` ou passe na hora:

```sh
npx eas-cli submit --platform android --profile production --latest \
  --track production
```

Valores de `track`: `internal`, `alpha`, `beta`, `production`.
Valores de `releaseStatus`: `draft`, `completed`, `halted`, `inProgress`.

## Passo 5B — Enviar manualmente

Quando a service account falha, a permissão expira, ou você só quer ver o
arquivo antes.

1. Baixe o `.aab` pelo link do build (ou pela dashboard do EAS).
2. Confira a assinatura (Passo 4).
3. Play Console → **Testes** → **Teste interno** → **Criar nova versão**.
4. Arraste o `.aab`, escreva as notas da versão, **Salvar** → **Revisar** →
   **Iniciar lançamento**.

> Tome cuidado com AABs antigos na pasta: builds consecutivos saem com tamanhos
> quase idênticos (vc4 e vc5 diferiram em 20 bytes) e é fácil subir o errado.
> Apague os anteriores depois de cada release.

## Passo 6 — Promover para produção

O envio cai em teste interno. Para liberar ao público:

Play Console → **Teste interno** → a versão → **Promover versão** →
**Produção** → definir rollout (ex.: 20%) → **Iniciar lançamento**.

Revisão do Google: algumas horas a 7 dias. Atualizações costumam ser mais
rápidas que o primeiro envio.

---

# Keystore: a parte mais perigosa

O projeto tem **duas** configurações de keystore no EAS, e só uma funciona:

| Configuração | SHA1 | |
|---|---|---|
| **`Build Credentials 5O9YGXPgGf`** | `D1:9B:99:25:…` | ✅ **a Play só aceita esta** |
| `empregolTeam` | `DE:88:73:DB:…` | ❌ gerou builds rejeitados |
| `android/app/debug.keystore` | `5E:8F:16:06:…` | ❌ nunca use para release |

A `D1:9B:99` é a chave de upload registrada na Play Console. Assinar com
qualquer outra dá este erro no upload:

> Seu Android App Bundle foi assinado com uma chave incorreta. (…) Ele deveria
> ser assinado com um certificado com a seguinte impressão digital: SHA1:
> D1:9B:99:…

**O nome do pacote não tem relação com isso.** Uma keystore assina qualquer
package; `com.empregol` vs `com.empregolapp` não influencia a assinatura.

### Conferir qual está ativa

```sh
npx eas-cli credentials --platform android
# > production > Keystore
```

Se a default estiver errada, selecione a `Build Credentials 5O9YGXPgGf`.

### ⚠️ Backup incompleto

`Docs/keys/` tem o `.jks` e o `keystore.txt`, **mas o `keystore.txt` só guarda
as impressões digitais — não as senhas.** Sem elas aquele `.jks` não abre.

Hoje a única cópia utilizável da `D1:9B:99` está nos servidores do Expo.

Para fechar essa lacuna:

```sh
npx eas-cli credentials --platform android
# > production > Credentials.json: Upload/Download…
# > Download credentials from EAS to credentials.json
```

Guarde o `credentials.json` (traz `keystorePassword`, `keyAlias`,
`keyPassword`) junto do `.jks`, fora do repositório. Ambos estão no
`.gitignore` — mantenha assim.

Se a chave for perdida: Play Console → **Integridade do app** → **Solicitar
redefinição da chave de upload**. Leva ~2 dias úteis. A chave de *assinatura*
do app fica com o Google (Play App Signing), então o app não se perde — mas
você fica parado até o reset.

---

# Outras lojas

O `.aab` serve **só para a Google Play**.

## Galaxy Store, Amazon Appstore, Aptoide, APK direto

Essas querem **APK**. O perfil `preview` já gera APK, mas com
`distribution: "internal"`. Para um APK de loja, adicione um perfil ao
[`eas.json`](../eas.json):

```json
"production-apk": {
  "environment": "production",
  "autoIncrement": true,
  "android": {
    "buildType": "apk"
  }
}
```

```sh
npx eas-cli build --platform android --profile production-apk
```

Assinado com a mesma keystore. O upload nessas lojas é sempre manual — o
`eas submit` só fala com a Google Play e a App Store.

## App Store (iOS)

Processo separado, ainda não configurado:

- Conta Apple Developer — US$ 99/ano
- Bundle ID `com.empregol` (atenção: **diverge** do Android `com.empregolapp`;
  decida antes do primeiro envio, porque também é imutável)
- `GOOGLE_SERVICES_INFO_PLIST` já existe como env var no EAS ✅
- `npx eas-cli build --platform ios --profile production`
- `npx eas-cli submit --platform ios` (pede `appleId`, `ascAppId`,
  `appleTeamId` no `eas.json`)

---

# Referência: setup já feito

Não precisa repetir. Documentado para quem for mexer.

| Item | |
|---|---|
| `eas.json` com `development` / `preview` / `production` | ✅ |
| `production` gerando app-bundle | ✅ |
| `appVersionSource: "remote"` + `autoIncrement` | ✅ |
| Projeto vinculado ao EAS | ✅ |
| Keystore de upload | ✅ (ver [Keystore](#keystore-a-parte-mais-perigosa)) |
| `google-services.json` como env var de arquivo | ✅ 3 ambientes |
| `GOOGLE_SERVICES_INFO_PLIST` (iOS) | ✅ production |
| `app.config.js` resolvendo o Firebase | ✅ |
| Service account da Play instalada | ✅ |
| `credentials/` e `credentials.json` no `.gitignore` | ✅ |
| `.env` fora do git | ✅ |

### Por que o `app.config.js` existe

`firebase/google-services.json` está no `.gitignore`, então **não sobe** para o
EAS Build. Os arquivos viajam como variáveis de ambiente do tipo *file*
(`GOOGLE_SERVICES_JSON`, `GOOGLE_SERVICES_INFO_PLIST`); no builder o EAS
materializa o arquivo e expõe o caminho, e o
[`app.config.js`](../app.config.js) lê esse caminho. Localmente cai no fallback
`./firebase/…` do `app.json`.

### Requisitos da ficha da loja

Bloqueiam a publicação enquanto não estiverem verdes no painel:

- [ ] Ficha principal — nome (30), descrição curta (80), completa (4000),
      ícone 512×512, destaque 1024×500, 2+ screenshots
- [ ] Classificação de conteúdo (IARC)
- [ ] Público-alvo e conteúdo
- [ ] **Segurança dos dados** — o Empregol coleta: Firebase Auth (e-mail, ID),
      fotos e vídeos (`expo-image-picker`, `expo-media-library`), token de push
      (`expo-notifications`), dados enviados à API própria
- [ ] Política de privacidade — URL pública, obrigatória
- [ ] Anúncios / compras no app / app de governo
- [ ] Acesso ao app — credenciais de teste para os revisores, de
      [`TEST_ACCOUNTS.md`](../TEST_ACCOUNTS.md)
- [ ] Verificação de identidade da conta de desenvolvedor

Contas **pessoais** criadas depois de nov/2023: a Play exige teste fechado com
**12 testadores por 14 dias seguidos** antes de liberar produção. Contas de
organização são isentas.

---

# Pendências

- **Senhas da keystore sem backup.** A mais urgente — ver
  [Keystore](#keystore-a-parte-mais-perigosa).
- **`expo-updates` não instalado.** Sem OTA: corrigir um bug em produção exige
  build novo + revisão da loja. Para habilitar:
  `npx expo install expo-updates && npx eas-cli update:configure`. Depois os
  perfis do `eas.json` podem voltar a declarar `channel`.
- **Bundle ID iOS (`com.empregol`) diverge do package Android
  (`com.empregolapp`).** Resolver antes do primeiro envio à App Store.
- **AABs antigos acumulando na raiz do projeto.** Fora do git, mas confundem na
  hora do upload manual. Limpe depois de cada release.
