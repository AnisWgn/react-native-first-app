const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Corrige la résolution de firebase/firestore avec Metro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
