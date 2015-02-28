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
  var debug = bonnet.debug = require('./debug')(settings);
  var account = bonnet.account = require('./account')(bonnet);
  var store = bonnet.store = require('./store')(bonnet);
  var task = bonnet.task = require('./task')(bonnet);

  bonnet.start = function (cb) {
    cb = cb || noop;
    debug('Starting bonnet client...');
    async.applyEachSeries([
      async.apply(account.init),
      async.apply(store.init),
    ], function (err) {
      debug(err || 'Bonnet client successfully started');
      cb(err);
    });
  };

  return bonnet;

};

