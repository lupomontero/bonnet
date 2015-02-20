var cp = require('child_process');
var path = require('path');
var async = require('async');


function startPouchDBServer(config, cb) {
  var bin = path.join(__dirname, '../node_modules/pouchdb-server/bin/pouchdb-server');
  var dataDir = path.join(config.dir, 'data');
  var port = config.port + 1;
  var args = [ '--port', port, '--dir', dataDir ];
  var options = { /*stdio: 'inherit'*/ };
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


module.exports = function (config, cb) {

  var tasks = [];

  if (!config.couchdb.url) {
    tasks.push(startPouchDBServer);
  }

  async.applyEachSeries(tasks, config, cb);

};

