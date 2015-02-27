// Use jQuery from global scope.
var $ = window.jQuery || window.$;
var moment = window.moment = require('moment');
var Handlebars = window.Handlebars = require('handlebars');
var Backbone = window.Backbone = require('backbone');
// Backbone needs reference to glbal jQuery
Backbone.$ = $;

exports.App = require('./app');
exports.View = require('./view');
exports.Model = require('./model');
exports.Collection = require('./collection');

