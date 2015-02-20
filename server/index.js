var path = require('path');
var Hapi = require('hapi');

module.exports = function (config, cb) {

  var server = new Hapi.Server();

  server.connection({ port: config.port });

  server.route({
    method: [ 'OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'DELETE' ],
    path: '/_api/{p*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: function (req, cb) {
          cb(null, config.couchdb.url + req.url.path.substr('/_api'.length), req.headers);
        },
        //onResponse: function (err, resp, req, reply) {}
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/_files/bonnet.js',
    handler: {
      file: path.join(__dirname, '../client/bundle.js')
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'www'
      }
    }
  });

  server.start(function () {
    console.log('Backend started on port ' + config.port);
    cb();
  });

};

