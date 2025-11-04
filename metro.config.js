const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Block expo-router
config.resolver.blockList = [
  /\bapp\/_layout\.[jt]sx?$/,
  /\bapp\/\+html\.[jt]sx?$/,
];

module.exports = withNativeWind(config, { input: './global.css' });