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

## Rodar no iOS (macOS)

Mesma lógica do Android: **CNG** — a pasta `ios/` não é versionada, é gerada pelo
`prebuild`. Requer **macOS** com **Xcode** + **CocoaPods** instalados e **Node ≥ 20.19.4**
(use `nvm use 22.5.1`).

```bash
nvm use 22.5.1            # Node >= 20.19.4 (o build iOS falha em versões antigas)
npx expo run:ios         # gera ios/, compila e abre no Simulador
npx expo run:ios --device   # em iPhone físico conectado
```

Depois de instalado, para só reconectar ao Metro sem recompilar:

```bash
npx expo start --dev-client   # então toque no ícone do app no simulador (ou tecle "i")
```

### Erro `SwiftGeneratePch ... modulemap not found` (EXConstants / ExpoAsset)

É cache/ordem de build do CocoaPods + DerivedData sujo — **não é erro do código**.
Limpe tudo, reinstale os Pods e recompile:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/Empregol-*
rm -rf ios/build
cd ios && rm -rf Pods Podfile.lock && pod install --repo-update && cd ..
npx expo run:ios
```

Se persistir, regenere a pasta nativa do zero (ela é descartável):

```bash
rm -rf ios && npx expo prebuild -p ios --clean && npx expo run:ios
```

> **Auto-launch falhou com `openurl ... code 115`?** O build passou — o Expo só não
> conseguiu abrir o app via deep link (ele escolhe o scheme do Google Sign-In por engano).
> Basta **tocar no ícone do app** no simulador; ele conecta ao Metro normalmente.
> Para evitar: `npx expo run:ios --scheme empregolapp`.

### IPA para a App Store

Distribuição é via **EAS Build** (gera na nuvem, não precisa da pasta local):

```bash
eas build -p ios --profile preview       # build interno / TestFlight
eas build -p ios --profile production     # loja
```

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
