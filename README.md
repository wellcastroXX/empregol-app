# Empregol — App

Marketplace de futebol que conecta **Atletas** a **Contratantes** (Agente / Clube).
Expo SDK 56 (React Native 0.85, React 19) · expo-router · arquitetura feature-based.

## Pré-requisitos

- **Node 22+** e npm
- **JDK 17** (Temurin/Eclipse Adoptium) — exigido pelo RN 0.85
- **Android SDK** (com `ANDROID_HOME` configurado) + build-tools/platform 36
- Dependências: `npm install`

## Rodar em desenvolvimento

```bash
npx expo start            # abre o Metro; tecle "a" para Android, "i" para iOS
npx expo run:android      # build de dev + instala no emulador/dispositivo conectado
```

> O app lê variáveis `EXPO_PUBLIC_*` do `.env` (ex.: `EXPO_PUBLIC_API_URL`).

---

## Gerar o APK (Android)

O projeto usa **CNG** (Continuous Native Generation): a pasta `android/` não é versionada,
é gerada pelo `prebuild`. Para produzir um **APK release standalone** (bundle JS embutido,
não precisa de Metro rodando):

```bash
# 1. Gera a pasta nativa android/ a partir do app.json (sobrescreve a existente)
npx expo prebuild -p android --clean

# 2. Compila o APK release (assinado com a debug keystore do template Expo)
cd android
./gradlew assembleRelease --no-daemon      # Windows PowerShell: .\gradlew.bat assembleRelease --no-daemon
cd ..
```

O APK fica em:

```
android/app/build/outputs/apk/release/app-release.apk
```

> A primeira execução baixa o Gradle distribution + dependências (~10–15 min).
> As seguintes são bem mais rápidas (cache do Gradle).

### Instalar no dispositivo

```bash
# Por cabo (Depuração USB ligada):
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Ou: transfira o .apk para o celular e abra (permita "fontes desconhecidas").
```

### APK de debug (para depurar com Metro)

```bash
cd android && ./gradlew assembleDebug --no-daemon
# saída: android/app/build/outputs/apk/debug/app-debug.apk  (requer Metro rodando)
```

### AAB para a Play Store

O APK acima é assinado com a **debug keystore** — serve para testes, **não** para publicar.
Para a loja, gere uma **keystore de release** própria e configure a assinatura
(`android/app/build.gradle` → `signingConfigs.release`), depois:

```bash
cd android && ./gradlew bundleRelease --no-daemon
# saída: android/app/build/outputs/bundle/release/app-release.aab
```

Alternativa gerenciada (recomendada para distribuição): **EAS Build**
(`eas build -p android --profile preview` gera APK; `--profile production` gera AAB).

---

## Estrutura

```
src/
  app/            # rotas (expo-router) — finas, delegam para features/
  features/       # telas por domínio (auth, home, messages, ...)
  components/ui/  # design system (Button, Card, Text, Logo, ...)
  theme/          # tokens (cores, tipografia, espaçamento)
  services/       # camada de API (client, auth, dashboard, athletes, ...)
  context/        # AuthContext
```

A API real está em `empregol-api` (Express + Prisma + JWT). Base URL via `EXPO_PUBLIC_API_URL`.

## Verificação

```bash
npx tsc --noEmit          # checagem de tipos
npx expo lint             # ESLint
```
