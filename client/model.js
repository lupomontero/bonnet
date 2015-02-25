var assert = require('assert');
var _ = require('lodash');
var Backbone = require('backbone');
var noop = function () {};


module.exports = Backbone.Model.extend({

  toViewContext: function () { return _.extend({}, this.attributes); },

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

