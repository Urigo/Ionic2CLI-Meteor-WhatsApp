var ChildProcess = require('child_process');
var Fs = require('fs');
var Path = require('path');
var Tmp = require('tmp');
var ClientPacks = require('./client-packages.json');

var exec = ChildProcess.execFileSync.bind(ChildProcess);
var meteor = exec.bind(null, 'meteor');

// Will clean all temp files automatically
Tmp.setGracefulCleanup();

// In this dir all temporary calculations are going to take place
var tmpDir = Tmp.dirSync({ unsafeCleanup: true });
// The dir of our Meteor server whose packages are going to be bundled
var apiDir = Path.resolve(__dirname, '../api');
// The output file which will contain the final bundle
var meteorClientPath = Path.resolve(__dirname, 'meteor.bundle.js');
// Raw packages dir
var packsDir = Path.resolve(tmpDir.name, 'bundle/programs/web.browser/packages');

// Create a dummy project in temp dir
meteor(['create', tmpDir.name], {
  stdio: 'inherit'
});

// Move all packages from API to temp project
var apiPacksPath = Path.resolve(apiDir, '.meteor/packages');
var tmpPacksPath = Path.resolve(tmpDir.name, '.meteor/packages');
var packsFileContent = Fs.readFileSync(apiPacksPath).toString();
Fs.writeFileSync(tmpPacksPath, packsFileContent);

// Install npm modules
exec('npm', ['install'], {
  cwd: tmpDir.name,
  stdio: 'inherit'
});

// Start building the packages
meteor(['build', '--debug', '.'], {
  cwd: tmpDir.name,
  stdio: 'inherit'
});

// Unpack the built project
var tarPath = Path.resolve(tmpDir.name, Path.basename(tmpDir.name)) + '.tar.gz';

exec('tar', ['-zxf', tarPath], {
  cwd: tmpDir.name
});

// A necessary code snippet so the meteor-client can work properly
var runtimeConfigPath = Path.resolve(__dirname, 'runtime-config.js');
var runtimeConfig = Fs.readFileSync(runtimeConfigPath).toString();

// Start composing the bundle, override if already exists
Fs.writeFileSync(meteorClientPath, runtimeConfig);

// Eliminate duplicate packages name and preserve their order
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

// Export Meteor packages globally
var globalImportsPath = Path.resolve(__dirname, 'global-imports.js');
var globalImports = Fs.readFileSync(globalImportsPath).toString();
Fs.appendFileSync(meteorClientPath, globalImports);