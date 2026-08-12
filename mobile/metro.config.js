const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure packaged A1 MP3s under assets/audio are treated as assets.
if (!config.resolver.assetExts.includes('mp3')) {
  config.resolver.assetExts.push('mp3');
}

config.watchFolders = [...(config.watchFolders ?? []), path.join(__dirname, 'assets')];

module.exports = config;
