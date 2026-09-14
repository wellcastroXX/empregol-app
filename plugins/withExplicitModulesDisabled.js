/**
 * Config plugin (CNG) — desliga o "Explicitly Built Modules" do Xcode 16+/26.
 *
 * Esse recurso (ligado por padrão) tenta resolver os `.modulemap` dos módulos
 * Expo (EXConstants, Expo, ExpoAsset, ...) antes do Pod que os gera ter buildado,
 * quebrando o Archive (Release) com "module map file ... not found". Como a pasta
 * ios/ é regenerada a cada prebuild, fixamos o ajuste aqui para sobreviver ao CNG.
 *
 * Precisa atuar em dois projetos:
 *  1. O target do app (Empregol.xcodeproj) — via withXcodeProject.
 *  2. Todos os Pods (Pods.xcodeproj, só existe após `pod install`) — injetando
 *     no post_install do Podfile.
 */
const {
  withXcodeProject,
  withDangerousMod,
  withPodfileProperties,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Chaves candidatas. Nomes variam entre versões do Xcode; settings desconhecidas
// são simplesmente ignoradas, então setar todas é seguro.
const KEYS = [
  // Desliga o passo SwiftGeneratePch (pré-compilação do bridging header). Ele roda
  // cedo demais no Archive e falha ao achar os .modulemap dos pods (EXConstants,
  // Expo, ...) que ainda não buildaram. Sem PCH, o bridging header é compilado
  // junto com o Swift, quando os pods já existem → o erro não ocorre.
  "SWIFT_PRECOMPILE_BRIDGING_HEADER",
  // Belt-and-suspenders: desliga os "Explicitly Built Modules" do Xcode 16+.
  "SWIFT_ENABLE_EXPLICIT_MODULES",
  "CLANG_ENABLE_EXPLICIT_MODULES",
  "_EXPERIMENTAL_SWIFT_EXPLICIT_MODULES",
];

/** Aplica no target do app (Empregol.xcodeproj). */
function withAppTarget(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const buildConfigs = project.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(buildConfigs)) {
      const entry = buildConfigs[key];
      const settings = entry && entry.buildSettings;
      if (!settings) continue; // pula as chaves de comentário ("_comment")
      for (const k of KEYS) settings[k] = "NO";
    }
    return cfg;
  });
}

/** Injeta no post_install do Podfile, atingindo todos os Pods. */
function withPodsPostInstall(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfile = path.join(
        cfg.modRequest.platformProjectRoot,
        "Podfile",
      );
      let contents = fs.readFileSync(podfile, "utf8");
      const marker = "# explicit-modules-off (withExplicitModulesDisabled)";
      if (!contents.includes(marker)) {
        const assigns = KEYS.map(
          (k) => `        c.build_settings['${k}'] = 'NO'`,
        ).join("\n");
        const block =
          `    ${marker}\n` +
          `    installer.pods_project.targets.each do |t|\n` +
          `      t.build_configurations.each do |c|\n` +
          `${assigns}\n` +
          `      end\n` +
          `    end\n`;
        // Insere logo após a abertura do post_install existente.
        contents = contents.replace(
          /(post_install do \|installer\|\n)/,
          `$1${block}`,
        );
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
}

/**
 * Desliga os módulos Expo pré-compilados (build a partir do fonte).
 *
 * Os XCFrameworks pré-compilados referenciam `.modulemap` em
 * `BuildProductsPath/Release-iphoneos/<Mod>/<Mod>.modulemap`, que só existem
 * depois daquele target buildar. No Archive, o SwiftGeneratePch do app roda
 * antes → "module map file ... not found". Buildando do fonte, cada modulemap
 * é gerado na ordem certa e o Archive passa.
 */
function withPrecompiledModulesOff(config) {
  return withPodfileProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults || {};
    cfg.modResults["EXPO_USE_PRECOMPILED_MODULES"] = "false";
    return cfg;
  });
}

/**
 * Desliga o build paralelo do scheme (força ordem de dependência).
 *
 * Com paralelismo, no Archive os pods (Expo, EXConstants, ...) compilam junto
 * com o app e nem sempre o `.swiftmodule`/modulemap está pronto quando o app
 * compila → "No such module 'Expo'" / "module map file not found". Sequencial,
 * os pods sempre buildam antes do app.
 */
function withSerialBuild(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const scheme = path.join(
        cfg.modRequest.platformProjectRoot,
        `${cfg.modRequest.projectName || "Empregol"}.xcodeproj`,
        "xcshareddata",
        "xcschemes",
        `${cfg.modRequest.projectName || "Empregol"}.xcscheme`,
      );
      if (fs.existsSync(scheme)) {
        let contents = fs.readFileSync(scheme, "utf8");
        contents = contents.replace(
          /parallelizeBuildables = "YES"/,
          'parallelizeBuildables = "NO"',
        );
        fs.writeFileSync(scheme, contents);
      }
      return cfg;
    },
  ]);
}

module.exports = function withExplicitModulesDisabled(config) {
  config = withPrecompiledModulesOff(config);
  config = withAppTarget(config);
  config = withPodsPostInstall(config);
  config = withSerialBuild(config);
  return config;
};
