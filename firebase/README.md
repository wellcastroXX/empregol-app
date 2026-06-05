# Arquivos de configuração do Firebase

Este é um app **Expo (CNG)** — **não existem** pastas `ios/` e `android/` no repositório;
elas são geradas no build (`npx expo prebuild` ou EAS Build). Por isso os arquivos do
Firebase **não vão dentro de pastas nativas** — eles ficam aqui e são referenciados no `app.json`.

## Onde colocar (baixe do Console do Firebase)

Coloque exatamente com estes nomes nesta pasta:

- **Android** → `firebase/google-services.json`
  (Firebase Console → Project settings → seu app **Android** → "google-services.json")
- **iOS** → `firebase/GoogleService-Info.plist`
  (Firebase Console → Project settings → seu app **Apple** → "GoogleService-Info.plist")

O `app.json` já aponta para esses caminhos:

```jsonc
"ios":     { "googleServicesFile": "./firebase/GoogleService-Info.plist", "bundleIdentifier": "com.empregol.app", "usesAppleSignIn": true },
"android": { "googleServicesFile": "./firebase/google-services.json",     "package": "com.empregol.app" }
```

> ⚠️ O **bundleIdentifier (iOS)** e o **package (Android)** precisam ser **idênticos** aos
> que você registrou no Firebase. Ajuste `com.empregol.app` se você registrou outro.

## Importante (leia antes)

1. **Não roda no Expo Go.** Firebase Auth / Google Sign-In são módulos nativos — exigem um
   **dev build** (`npx expo run:android` / `run:ios` ou EAS). O fluxo atual (e-mail/senha)
   continua no Expo Go; o social não.
2. **Backend ainda não tem login social.** A API (`empregol-api`) só tem login por e-mail/senha
   que devolve o JWT. Para "entrar com Google/Apple" funcionar de verdade, a API precisa de um
   endpoint que receba o **ID token do Firebase**, valide, crie/vincule o usuário e devolva o
   **JWT do app**. Sem isso, o login social autentica no Firebase mas não no nosso backend.

Os `.json`/`.plist` reais são ignorados pelo Git (ver `.gitignore`).
