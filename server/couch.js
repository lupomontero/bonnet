var _ = require('lodash');
var request = require('request');
var noop = function () {};


function createApi(opt) {

  var baseurl = opt.url;

  function req(/* method, path, params, data, cb */) {
    var args = _.toArray(arguments);
    var method = args.shift();
    var path = args.shift();
    var cb = (typeof args[args.length - 1] === 'function') ? args.pop() : noop;

    // Add leading slash if needed.
    if (path.charAt(0) !== '/') { path = '/' + path; }

    var reqOpt = {
      method: method,
      url: opt.url + path,
      json: true
    };

    if (opt.user && opt.pass) {
      reqOpt.auth = _.pick(opt, [ 'user', 'pass' ]);
    }

    if ([ 'PUT', 'POST' ].indexOf(method) >= 0) {
      reqOpt.body = args.pop();
    }

    if (args.length) {
      reqOpt.qs = _.reduce(args.shift(), function (memo, v, k) {
        memo[k] = JSON.stringify(v);
        return memo;
      }, {});
    }

    return request(reqOpt, function (err, resp) {
      if (err) { return cb(err); }
      if (resp.statusCode > 201) {
        err = new Error(resp.body.error);
        err.statusCode = resp.statusCode;
        err.reason = resp.body.reason;
        return cb(err);
      } 
      cb(null, resp.body);
    });
  }

  return {
    get: req.bind(null, 'GET'),
    post: req.bind(null, 'POST'),
    put: req.bind(null, 'PUT'),
    del: req.bind(null, 'DELETE')
  };

}


module.exports = function (opt) {

  var api = createApi(opt);

  api.db = function (dbName) {
    var db = createApi(_.extend({}, opt, {
      url: opt.url + '/' + encodeURIComponent(dbName)
    }));

    db.view = function () {};

    return db;
  };

  api.isAdminParty = function (cb) {
    api.get('/_users/_all_docs', function (err, data) {
      if (err && err.statusCode === 401) {
        cb(null, false);
      } else if (err) {
        cb(err);
      } else {
        cb(null, true);
      }
    });
  };

  return api;

};

