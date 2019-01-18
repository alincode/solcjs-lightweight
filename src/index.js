
const solcVersion = require('solc-version');
const solcjsCore = require('solcjs-core');
let solcjs = solcjsCore.solc;

module.exports = solcjs;

solcjs.versions = solcVersion.versions;
solcjs.version2url = solcVersion.version2url;

solcjs.versionsSkipVersion5 = solcVersion.versionsSkipVersion5;