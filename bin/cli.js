#!/usr/bin/env node

var minimist = require('minimist');
var async = require('async');
var pkg = require('../package.json');
var argv = minimist(process.argv.slice(2));
var cmd = argv._.shift();


// Show version if asked to do so.
if (argv.v || argv.version) {
  console.log(pkg.version);
  process.exit(0);
}


// Show help if applicable.
if (argv.h || argv.help || !cmd || cmd === 'help') {
  console.log([
    '',
    'Usage:',
    '',
    pkg.name + ' <cmd> [ <param1> <param2> ... ]',
    '',
    'Commands:',
    '',
    'start            Start hoodie app.',
    '',
    'Options:',
    '',
    '--port           Port to start server on.',
    '-h, --help       Show this help.',
    '-v, --version    Show ' + pkg.name + ' version.',
    ''
  ].join('\n'));
  process.exit(0);
}


if (cmd === 'start') {

  var config = require('../lib/config')(argv);
  var couch = require('../lib/couch');
  var server = require('../lib/server');

  async.applyEachSeries([
    couch
  ], config, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Bonnet back-end has started ;-)');
  });

} else {

  console.log('ha');

}

