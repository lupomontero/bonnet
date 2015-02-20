var _ = require('lodash');
var env = process.env;

module.exports = function (argv) {

  return _.extend({}, _.omit(argv, [ '_' ]), {
    port: 3001,
    dir: process.cwd(),
    couchdb: {
      url: env.BONNET_COUCH_URL,
      user: env.BONNET_COUCH_USER,
      pass: env.BONNET_COUCH_PASS
    }
  });

};

