var ChildProcess = require('child_process');
var Fs = require('fs');
var Path = require('path');
var Tmp = require('tmp');
var Config = require('./bundler.config.json');

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

// Extract tar so we can access the built project
exec('tar', ['-zxf', tarPath], {
  cwd: tmpDir.name
});

// A necessary code snippet so the meteor-client can work properly
var runtimeConfig = '__meteor_runtime_config__ = ' +
  JSON.stringify(Config['run-time'], null, 2) + ';\n\n';

// Start composing the bundle, override if already exists
Fs.writeFileSync(meteorClientPath, runtimeConfig);

// Eliminate duplicate packages name and preserve their order
var packs = Object.keys(Config['import']).reduce(function (packs, packsBatch) {
  Config['import'][packsBatch].forEach(function (pack) {
    packs[pack] = true;
  });

  return packs;
}, {});

// Append all specified packages
Object.keys(packs).forEach(function (pack) {
  var packPath = Path.resolve(packsDir, pack) + '.js';
  var packContent = Fs.readFileSync(packPath) + '\n\n';
  Fs.appendFileSync(meteorClientPath, packContent);
});

// Get all packages names we'd like to export
var packagesNames = Object.keys(Config['export']);
// Go through all packages names and compose an exportation line
// e.g. Accounts = Package["accounts-base"]["Accounts"];
var bundleExports = packagesNames.reduce(function (lines, packageName) {
  var packageExports = Config['export'][packageName];

  packageExports.forEach(function (objectName) {
    lines.push(objectName + ' = Package["' + packageName + '"]["' + objectName + '"]');
  });

  return lines;
}, [])
  // Add an empty string so the next rule would apply on the last line as well
  .concat('')
  // Add a semi-colon and a line skip after each composed line
  .join(';\n');

// Append export into bundle
Fs.appendFileSync(meteorClientPath, bundleExports);