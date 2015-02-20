var Backbone = require('backbone');
var Model = require('./model');
var noop = function () {};

module.exports = Backbone.Collection.extend({

  model: Model,

  comparator: function (m) { return -1 * m.get('createdAt'); },

  toViewContext: function () {
    return {
      models: this.map(function (model) {
        if (model.toViewContext) {
          return model.toViewContext();
        }
        return model;
      })
    };
  },

  sync: function (method, collection, options) {
    var success = options.success || noop;
    var error = options.error || noop;
    var type = (new collection.model()).get('type');

    if (method === 'read') {
      bonnet.store.findAll(type).then(function (data) {
        success(data);
      }, function (err) {
        error(null, null, err);
      });
    }
  }

});

