var path = require('path');
var Hapi = require('hapi');

module.exports = function (config) {

  var server = new Hapi.Server();

  server.connection({ port: config.port });

  server.route({
    method: 'GET',
    path: '/_api',
    handler: function (req, reply) {
      reply({ ok: true });
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
    console.log('Server started on port ' + config.port);
  });

};

