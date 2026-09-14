# Publicação do Empregol na Google Play

Runbook do processo de build e envio via EAS. Estado em 14/09/2026.

**Package:** `com.empregolapp` · **Projeto EAS:** `@wellcastrox/empregol-app` (`18fdc8a7-456d-4416-af04-4fd6c263293e`)

> A Play Store **não aceita APK** para apps novos. O artefato de envio é o
> **AAB** (`.aab`). O `empregol-v1.0.0.apk` na raiz do repo é um build antigo e
> não serve para publicação.

---

## Etapa 1 — Configurar o EAS ✅ FEITO

| Item | Estado |
|---|---|
| `eas.json` com perfis `development` / `preview` / `production` | criado |
| `production` gerando **app-bundle** (`.aab`) | ok |
| `appVersionSource: "remote"` + `autoIncrement` | o EAS controla o `versionCode` |
| Projeto vinculado ao EAS | ok |
| Keystore de upload | **gerada e guardada pelo EAS** |
| `google-services.json` como env var de arquivo (secret) | ok, nos 3 ambientes |
| `app.config.js` resolvendo o Firebase pelo env var | criado |
| `credentials/` no `.gitignore` | ok |

### Por que o `app.config.js` existe

`firebase/google-services.json` está no `.gitignore`, então **não sobe** para o
EAS Build. O arquivo foi enviado como variável de ambiente do tipo *file*
(`GOOGLE_SERVICES_JSON`); no builder o EAS materializa o arquivo e expõe o
caminho, e o `app.config.js` lê esse caminho. Localmente o fallback continua
sendo `./firebase/google-services.json`.

### Sobre a keystore

O EAS gerou e armazena a keystore de upload. **Nunca perca ela** — sem ela você
não consegue mais atualizar o app na Play Store (só com reset de chave via
suporte do Google). Faça um backup:

```sh
npx eas-cli credentials --platform android
# > production > Keystore > Download
```

Guarde o `.jks` e as senhas num cofre de senhas, fora do repositório.

---

## Etapa 2 — Build de produção 🔄 EM ANDAMENTO

```sh
npx eas-cli build --platform android --profile production
```

Build atual: https://expo.dev/accounts/wellcastrox/projects/empregol-app/builds/7c3d060f-8694-48a1-a35b-6459950137eb

`versionCode` foi inicializado em **2** (o `1` local já tinha sido consumido).

---

## Etapa 3 — Criar o app na Play Console ⬜ VOCÊ PRECISA FAZER

1. Acesse https://play.google.com/console e clique em **Criar app**.
2. Preencha:
   - **Nome:** Empregol
   - **Idioma padrão:** Português (Brasil)
   - **Tipo:** App
   - **Gratuito ou pago:** Gratuito
3. Aceite as declarações de diretrizes e leis de exportação dos EUA.
4. O nome do pacote **`com.empregolapp`** é definido no primeiro upload e
   **não pode ser alterado depois**. Confira antes.

---

## Etapa 4 — Service account para o `eas submit` ⬜ VOCÊ PRECISA FAZER

Isso é o que permite o envio automático pelo CLI. Guia oficial:
https://expo.fyi/creating-google-service-account

Resumo:

1. Play Console → **Configurações** → **Acesso à API** → vincular a um projeto
   do Google Cloud.
2. No Google Cloud, crie uma **conta de serviço** e gere uma **chave JSON**.
3. Volte à Play Console e conceda a essa conta as permissões de
   **Administrador de versões** (ou pelo menos: ver informações do app, criar e
   editar versões, gerenciar testes).
4. Salve o JSON baixado em:

   ```
   credentials/google-service-account.json
   ```

   Essa pasta já está no `.gitignore`. O caminho já está apontado no `eas.json`.

5. (Opcional, recomendado) Suba a chave para o EAS também:

   ```sh
   npx eas-cli credentials --platform android
   # > production > Google Service Account > Upload
   ```

---

## Etapa 5 — Enviar o AAB ⬜

Com o build finalizado e a service account no lugar:

```sh
npx eas-cli submit --platform android --profile production --latest
```

O perfil está configurado para `track: "internal"` e `releaseStatus: "draft"` —
ou seja, cai no **teste interno como rascunho**, sem publicar para o público.
Você revisa na Play Console e promove quando quiser.

Nos próximos ciclos dá para juntar build + envio num comando só:

```sh
npx eas-cli build --platform android --profile production --auto-submit
```

### Alternativa manual (sem service account)

Se preferir pular a Etapa 4 no primeiro envio: baixe o `.aab` pelo link do build
e faça o upload à mão em **Teste** → **Teste interno** → **Criar nova versão**.

---

## Etapa 6 — Ficha da loja e questionários ⬜

A Play Console **não libera a publicação** enquanto tudo isso não estiver verde
(painel *Visão geral do painel*):

- [ ] **Ficha da loja principal**
  - Nome (30 caracteres), descrição curta (80), descrição completa (4000)
  - Ícone 512×512 PNG
  - Gráfico de destaque 1024×500
  - Mínimo de 2 screenshots de celular (mín. 320px no lado menor)
- [ ] **Classificação de conteúdo** — questionário IARC
- [ ] **Público-alvo e conteúdo** — faixa etária
- [ ] **Segurança dos dados (Data Safety)** — declarar o que o app coleta.
      Atenção ao que o Empregol usa hoje: **Firebase Auth** (e-mail, ID de
      usuário), **fotos e vídeos** (`expo-image-picker`), e dados enviados à API
      própria (`EXPO_PUBLIC_API_URL`).
- [ ] **Política de privacidade** — URL pública obrigatória. Precisa existir
      antes do envio.
- [ ] **App de governo / anúncios / compras no app** — declarações
- [ ] **Acesso ao app** — se há login, fornecer credenciais de teste para os
      revisores do Google. Use as contas do [`TEST_ACCOUNTS.md`](../TEST_ACCOUNTS.md).

---

## Etapa 7 — Verificação de identidade ⬜

Contas de desenvolvedor precisam de verificação (documento, endereço; para
contas de organização, D-U-N-S). Sem isso o app não sai do rascunho. Pode levar
alguns dias — comece cedo.

Para contas pessoais criadas depois de nov/2023, a Play exige ainda **teste
fechado com 12 testadores por 14 dias seguidos** antes de liberar produção.
Contas de organização estão isentas.

---

## Atualizações futuras

1. Suba a `version` em `app.json` quando for uma release visível ao usuário.
2. `npx eas-cli build --platform android --profile production --auto-submit`

O `versionCode` é incrementado sozinho pelo EAS (`appVersionSource: "remote"`).

## Pendências técnicas conhecidas

- **`expo-updates` não está instalado.** Sem ele não dá para fazer OTA updates
  (corrigir bug em produção sem passar pela revisão da loja). Se quiser:
  `npx expo install expo-updates && npx eas-cli update:configure`.
- **`.env` está versionado no git.** As chaves `EXPO_PUBLIC_*` são embutidas no
  bundle e são públicas por natureza, mas convém migrá-las para variáveis de
  ambiente do EAS (`eas env:set`) e tirar o arquivo do repositório.
- **`empregol-v1.0.0.apk` (112 MB) está na raiz.** Não está versionado
  (`*.apk` no `.gitignore`), mas pode ser apagado.
