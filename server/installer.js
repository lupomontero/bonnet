var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var readline = require('readline');
var _ = require('lodash');
var async = require('async');
var Couch = require('./couch');


function ensureDataDir(config, cb) {
  fs.exists(config.data, function (exists) {
    if (exists) { return cb(); }
    fs.mkdir(config.data, cb);
  });
}


function startPouchDBServer(config, cb) {
  var bin = path.join(__dirname, '../node_modules/pouchdb-server/bin/pouchdb-server');
  var port = config.port + 1;
  var args = [
    '--port', port,
    '--dir', config.data,
    '--config', path.join(config.data, 'config.json')
  ];
  var options = { cwd: config.data/*, stdio: 'inherit'*/ };
  var child = cp.spawn(bin, args, options);

  function checkIfStarted(chunk) {
    if (/pouchdb-server has started/.test(chunk.toString('utf8'))) {
      console.log('PouchDB Server started on port ' + port);
      child.stdout.removeListener('data', checkIfStarted);
      config.couchdb.url = 'http://127.0.0.1:' + port;
      cb();
    }
  }

  child.stdout.on('data', checkIfStarted);

  child.stderr.on('data', function (chunk) {
    console.error(chunk.toString('utf8'));
  });

  child.on('error', function (err) {
    console.error(err);
  });
}


function ensureAdminCredentials(config, cb) {
  var credentialsPath = path.join(config.data, 'bonnet.json');

  function prompt() {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('New password for "admin" user:', function (answer) {
      var credentials = { user: 'admin', pass: answer };
      var json = JSON.stringify(credentials, null, 2);
      rl.close();
      fs.writeFile(credentialsPath, json, function (err) {
        if (err) { return cb(err); }
        setConfig(credentials);
      });
    });
  }

  function setConfig(credentials) {
    _.extend(config.couchdb, _.pick(credentials, [ 'user', 'pass' ]));
    cb();
  }

  try {
    setConfig(require(credentialsPath));
  } catch (err) {
    return prompt();
  }
}


function ensureAdminUser(config, cb) {
  var couch = Couch({ url: config.couchdb.url });

  function createAdminUser(config, cb) {
    var url = '/_config/admins/' + encodeURIComponent(config.couchdb.user);
    couch.put(url, config.couchdb.pass, cb);
  }

  couch.isAdminParty(function (err, isAdminParty) {
    if (err) {
      cb(err);
    } else if (isAdminParty && !config.couchdb.run) {
      cb(new Error('Remote CouchDB is admin party!'));
    } else if (isAdminParty) {
      createAdminUser(config, cb);
    } else {
      cb()
    }
  });
}


function checkAdminCredentials(config, cb) {
  var couch = Couch({ url: config.couchdb.url });
  couch.post('/_session', {
    name: config.couchdb.user,
    password: config.couchdb.pass
  }, function (err, data) {
    var roles = (data || {}).roles || [];
    if (roles.indexOf('_admin') === -1) {
      return cb(new Error('Could not authenticate bonnet user on ' + config.couchdb.url));
    }
    cb();
  });
}


module.exports = function (config, cb) {

  var tasks = [];

  if (!config.couchdb.url) {
    config.couchdb.run = true;
    tasks.push(ensureDataDir);
    tasks.push(startPouchDBServer);
    tasks.push(ensureAdminCredentials);
  }

  tasks.push(ensureAdminUser);
  tasks.push(checkAdminCredentials);

  async.applyEachSeries(tasks, config, cb);

};

