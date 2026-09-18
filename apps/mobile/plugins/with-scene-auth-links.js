const { withAppDelegate } = require("expo/config-plugins");

// Existing iOS 27 builds use a custom SceneDelegate. Preserve OAuth launch URLs
// there; standard AppDelegate templates already forward their launchOptions.
function patchSceneAuthLinks(contents) {
  if (!contents.includes("class SceneDelegate:") || contents.includes("// Wordseed OAuth scene links")) return contents;
  const start = contents.indexOf("class SceneDelegate:");
  const before = contents.slice(0, start);
  let scene = contents.slice(start);
  scene = scene.replace("    factory.startReactNative(", `    // Wordseed OAuth scene links
    var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[.url] = url
    }

    factory.startReactNative(`);
  scene = scene.replace("launchOptions: nil)", "launchOptions: launchOptions)");
  scene = scene.replace("  var window: UIWindow?", `  var window: UIWindow?

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    for context in URLContexts {
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: [:])
    }
  }`);
  return before + scene;
}

module.exports = (config) => withAppDelegate(config, (config) => {
  config.modResults.contents = patchSceneAuthLinks(config.modResults.contents);
  return config;
});
module.exports.patchSceneAuthLinks = patchSceneAuthLinks;
