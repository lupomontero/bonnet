var Hapi = require('hapi');
var path = require('path');


module.exports = function (config, cb) {

  var server = new Hapi.Server({
    connections: {
      routes: {
        payload: {
          maxBytes: 1048576 * 5 // 5Mb
        }
      }
    }
  });

  server.connection({ port: config.port });

  server.route({
    method: [ 'OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'DELETE' ],
    path: '/_api/{p*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: function (req, cb) {
          cb(null, config.couchdb.url + req.url.path.substr(5), req.headers);
        }
      }
    }
  });

  server.route({
    method: [ 'OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'DELETE' ],
    path: '/_admin/{p*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../admin')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/_files/bonnet.js',
    handler: {
      file: path.join(__dirname, '../dist/bonnet.min.js')
    }
  });

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: {
      directory: {
        path: 'www'
      }
    }
  });

  // Redirect 404s for HTML docs to index.
  server.ext('onPostHandler', function (req, reply) {
    var resp = req.response;

    if (!resp.isBoom) { return reply.continue(); }

    var is404 = (resp.output.statusCode === 404);
    var isHTML = /text\/html/.test(req.headers.accept);

    // We only care about 404 for html requests...
    if (!is404 || !isHTML) { return reply.continue(); }

    var path = req.url.path.replace(/^\//, '');
    var prefix = '/';
    if (/^_admin/.test(path)) {
      prefix = '/_admin/';
      path = path.replace(/^_admin\//, '');
    }

    reply.redirect(prefix + '#' + path);
  });

  server.start(function () {
    console.log('Backend started on port ' + config.port);
    //console.log(server.settings.connections.routes.payload);
    cb();
  });

};

