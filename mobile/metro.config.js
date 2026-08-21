const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure packaged A1 MP3s under assets/audio are treated as assets.
if (!config.resolver.assetExts.includes('mp3')) {
  config.resolver.assetExts.push('mp3');
}

config.watchFolders = [...(config.watchFolders ?? []), path.join(__dirname, 'assets')];

// expo-speech-recognition's package index re-exports useSpeechRecognitionEvent; some
// installs/Metro resolves fail on that file. Point the package root at the native module.
const speechModulePath = path.resolve(
  __dirname,
  'node_modules/expo-speech-recognition/build/ExpoSpeechRecognitionModule.js',
);
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-speech-recognition') {
    return { type: 'sourceFile', filePath: speechModulePath };
  }
  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
