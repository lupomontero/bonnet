var assert = require('assert');
var _ = require('lodash');
var Backbone = require('backbone');
var moment = require('moment');
var noop = function () {};


function isISODateString(str) {
  var r = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
  return typeof str === 'string' && r.test(str);
}


module.exports = Backbone.Model.extend({

  toViewContext: function () { return _.extend({}, this.attributes); },

  parse: function (data) {
    return _.reduce(data, function (memo, v, k) {
      memo[k] = isISODateString(v) ? moment(v).toDate() : v;
      return memo;
    }, {});
  },

  toJSON: function () {
    return this.attributes;
  },

  sync: function (method, model, options) {
    var success = options.success || noop;
    var error = options.error || noop;
    var type = model.get('type');

    switch (method) {
      case 'create':
        bonnet.store.add(type, model.toJSON()).then(function (data) {
          success(data);
        }, function (err) {
          error(null, null, err);
        });
        break;
      case 'read':
        break;
      case 'update':
        break;
      case 'delete':
        bonnet.store.remove(type, model.id).then(function () {
          success();
        }, function (err) {
          error(null, null, err);
        });
        break;
      default:
        throw new Error('Unsupported model sync method');
    }
  }

});

