var path = require('path');
var _ = require('lodash');
var env = process.env;


module.exports = function (argv) {

  return _.extend({}, {
    port: 3001,
    cwd: process.cwd(),
    data: path.join(process.cwd(), 'data'),
    couchdb: {
      url: env.BONNET_COUCH_URL,
      user: env.BONNET_COUCH_USER,
      pass: env.BONNET_COUCH_PASS
    }
  }, _.omit(argv, [ '_' ]))

};

