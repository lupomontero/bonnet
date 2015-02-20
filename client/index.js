var _ = require('lodash');
var async = require('async');
var Backbone = require('backbone');
var Handlebars = require('handlebars');
var App = require('./app');
var noop = function () {};


// Backbone needs reference to glbal jQuery
Backbone.$ = window.jQuery;


var defaults = { 
  remote: window.location.origin + '/_api' 
};


//
// `Bonnet` Front end API
//
var Bonnet = window.Bonnet = function (options) {

  var settings = _.extend({}, defaults, options);
  var bonnet = window.bonnet = new App(settings);

  bonnet.account = require('./account')(bonnet, settings);
  bonnet.store = require('./store')(bonnet, settings);
  bonnet.task = require('./task')(bonnet, settings);

  bonnet.start = function (cb) {
    async.applyEachSeries([
      async.apply(bonnet.account.init),
      async.apply(bonnet.store.init),
    ], function (err) {
      if (err) { return console.error(err); }
      Backbone.history.start({ pushState: true });
    });
  };

  return bonnet;

};


Bonnet.View = require('./view');
Bonnet.Model = require('./model');
Bonnet.Collection = require('./collection');


Bonnet.$ = window.jQuery;
Bonnet._ = _;
Bonnet.Backbone = Backbone;
Bonnet.Handlebars = Handlebars;

