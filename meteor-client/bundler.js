var ChildProcess = require('child_process');
var Fs = require('fs');
var Path = require('path');
var Rimraf = require('rimraf');
var ClientPacks = require('./client-packages.json');

var exec = ChildProcess.execFileSync.bind(ChildProcess);
var meteor = exec.bind(null, 'meteor');

// In this dir all temporary calculations are going to take place
var tempDir = '/tmp/meteor-bundler';
// The dir of our Meteor server whose packages are going to be bundled
var apiDir = Path.resolve(__dirname, '../api');
// The output file which will contain the final bundle
var meteorClientPath = Path.resolve(__dirname, 'meteor.bundle.js');
// Raw packages dir
var packsDir = Path.resolve(tempDir, 'bundle/programs/web.browser/packages');

// Make sure temp dir doesn't exist to prevent any potential conflicts
Rimraf.sync(tempDir);

// Create a dummy project in temp dir
meteor(['create', tempDir], {
  stdio: 'inherit'
});

// Move all packages from API to temp project
var apiPacksPath = Path.resolve(apiDir, '.meteor/packages');
var packsFileContent = Fs.readFileSync(apiPacksPath).toString();
Fs.unlinkSync(Path.resolve(tempDir, '.meteor/packages'));
Fs.writeFileSync(Path.resolve(tempDir, '.meteor/packages'), packsFileContent);

// Install npm modules
exec('npm', ['install'], {
  cwd: tempDir,
  stdio: 'inherit'
});

// Start building the packages
meteor(['build', '--debug', '.'], {
  cwd: tempDir,
  stdio: 'inherit'
});

// Unpack the built project
exec('tar', ['-zxf', Path.resolve(tempDir, 'meteor-bundler.tar.gz')], {
  cwd: tempDir
});

// A necessary code snippet so the meteor-client can work properly
var runtimeConfigPath = Path.resolve(__dirname, 'runtime-config.js');
var runtimeConfig = Fs.readFileSync(runtimeConfigPath).toString();

// Make sure the bundled file is empty before proceeding
Rimraf.sync(meteorClientPath);
Fs.writeFileSync(meteorClientPath, runtimeConfig);

// Eliminate duplicate packages name and reserve their order
var packs = Object.keys(ClientPacks).reduce(function (packs, packsBatch) {
  ClientPacks[packsBatch].forEach(function (pack) {
    packs[pack] = true;
  });

  return packs;
}, {});

// Append all specified packages
Object.keys(packs).forEach(function (pack) {
  var packPath = Path.resolve(packsDir, pack) + '.js';
  var packContent = Fs.readFileSync(packPath);
  Fs.appendFileSync(meteorClientPath, packContent);
});

// Set global imports
var globalImportsPath = Path.resolve(__dirname, 'global-imports.js');
var globalImports = Fs.readFileSync(globalImportsPath).toString();
Fs.appendFileSync(meteorClientPath, globalImports);

// Make final cleanup
Rimraf.sync(tempDir);