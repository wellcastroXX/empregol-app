// Config dinâmica sobre o app.json.
//
// A pasta firebase/ está no .gitignore, então os arquivos de config do Firebase
// NÃO sobem para o EAS Build. Nos builds em nuvem eles chegam como variáveis de
// ambiente do tipo "file" (o EAS materializa o arquivo e expõe o caminho dele).
// Localmente, o fallback continua sendo o caminho relativo do app.json.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
  ios: {
    ...config.ios,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_PLIST ?? config.ios?.googleServicesFile,
  },
});
