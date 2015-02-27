
//
// External Dependencies
//
var _ = require('lodash');
var async = require('async');
var noop = function () {};
//
// Other deps:
// * jQuery
// * events.EventEmitter
// * Promise
// * PouchDB
//


//
// Default settings.
//
var defaults = { 
  remote: window.location.origin + '/_api',
  routePrefix: ''
};


//
// `Bonnet` Front end API
//
module.exports = function Bonnet(options) {
  var settings = _.extend({}, defaults, options);
  var account = require('./account')(settings);
  var store = require('./store')(settings, account);

  return {
    settings: settings,
    account: account,
    store: store,
    task: require('./task')(settings, account, store),
    start: function (cb) {
      cb = cb || noop;
      async.applyEachSeries([
        async.apply(account.init),
        async.apply(store.init),
      ], cb);
    }
  };
};

