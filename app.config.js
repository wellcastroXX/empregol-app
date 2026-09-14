// Estende o app.json. Os arquivos do Firebase (GoogleService-Info.plist e
// google-services.json) NÃO ficam no git, então no EAS Build eles chegam via
// "file environment variables" — a env var contém o caminho do arquivo já
// injetado no builder. Localmente, cai no fallback ./firebase/... do app.json.
//
// Crie as env vars (uma vez, visibility=secret, environment=production):
//   iOS:     GOOGLE_SERVICES_INFO_PLIST -> ./firebase/GoogleService-Info.plist
//   Android: GOOGLE_SERVICES_JSON       -> ./firebase/google-services.json
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_INFO_PLIST ??
      process.env.GOOGLE_SERVICES_PLIST ??
      config.ios?.googleServicesFile,
  },
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
