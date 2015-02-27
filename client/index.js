//
// External Dependencies
//
var _ = require('lodash');
var async = require('async');
var noop = function () {};

//
// Other deps:
// * jQuery
// * events
// * Promise
// * PouchDB
//


//
// Default settings.
//
var defaults = { 
  remote: window.location.origin + '/_api'
};


//
// `Bonnet` Front end API
//
module.exports = function Bonnet(options) {

  var settings = _.extend({}, defaults, options);
  var bonnet = { settings: settings };
  var account = bonnet.account = require('./account')(settings);
  var store = bonnet.store = require('./store')(settings, account);
  var task = bonnet.task = require('./task')(settings, account, store);

  bonnet.start = function (cb) {
    cb = cb || noop;
    async.applyEachSeries([
      async.apply(account.init),
      async.apply(store.init),
    ], cb);
  };

  return bonnet;

};

