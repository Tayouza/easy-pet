const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");
const config = getDefaultConfig(__dirname);
// Apps use separate installs rather than npm workspaces. Expose only the pure brand tokens.
config.watchFolders = [path.resolve(__dirname, "../../packages/brand")];
module.exports = config;
