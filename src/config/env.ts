/**
 * App configuration. Expo inlines `EXPO_PUBLIC_*` vars at build time.
 * The API base URL comes from `.env` (EXPO_PUBLIC_API_URL).
 */
export const env = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.empregolstartup.com.br').replace(
    /\/+$/,
    ''
  ),
} as const;

/** Firebase web config (client identifiers — safe on the client). */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
} as const;
