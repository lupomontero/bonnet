'use strict';


exports.register = function (server, options, next) {

  // Redirect 404s for HTML docs to index.
  server.ext('onPostHandler', (req, reply) => {

    const resp = req.response;

    if (!resp.isBoom) {
      return reply.continue();
    }

    const is404 = (resp.output.statusCode === 404);
    const isHTML = /text\/html/.test(req.headers.accept);

    // We only care about 404 for html requests...
    if (!is404 || !isHTML) {
      return reply.continue();
    }

    let path = req.url.path.replace(/^\//, '');
    let prefix = '/';
    if (/^_admin/.test(path)) {
      prefix = '/_admin/';
      path = path.replace(/^_admin\//, '');
    }

    reply.redirect(prefix + '#' + path);
  });

  next();

};


exports.register.attributes = {
  name: 'www',
  version: '1.0.0'
};