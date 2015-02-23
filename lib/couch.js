var _ = require('lodash');
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
      type: method,
      url: opt.url + path,
      dataType: 'json',
      error: function (xhr) { 
        var err = new Error(xhr.responseJSON.error);
        err.statusCode = xhr.status;
        err.reason = xhr.responseJSON.reason;
        cb(err); 
      },
      success: function (data) {
        cb(null, data);
      }
    };

    if (opt.user && opt.pass) {
      reqOpt.username = opt.user;
      reqOpt.password = opt.pass;
    }

    if ([ 'PUT', 'POST' ].indexOf(method) >= 0) {
      var data = args.pop();
      if (data) {
        reqOpt.data = JSON.stringify(data);
        reqOpt.contentType = 'application/json';
      }
    }

    if (args.length) {
      reqOpt.url += _.reduce(args.shift(), function (memo, v, k) {
        return memo += encodeURIComponent(k) + '=' + encodeURIComponent(JSON.stringify(v));
      }, '?');
    }

    return $.ajax(reqOpt, cb);
  }

  return {
    get: req.bind(null, 'GET'),
    post: req.bind(null, 'POST'),
    put: req.bind(null, 'PUT'),
    del: req.bind(null, 'DELETE'),
  };

}


module.exports = function (opt) {

  if (typeof opt === 'string') {
    opt = { url: opt }
  }

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

