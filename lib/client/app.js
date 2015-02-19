var _ = require('lodash');
var Backbone = require('backbone');
var AppView = require('./app-view');

module.exports = Backbone.Router.extend({

  initialize: function (opt) {
    var app = this;
    Backbone.Router.prototype.initialize.call(app, opt);

    app.view = new AppView({ model: app });
  },

  addRegion: function (name, opt) {
    this.view.addRegion(name, opt);
  },

  setMainView: function (view) {
    var prev = (this.view.regions.main || {}).view;
    if (prev && prev.unsubscribeFromOutsideEvents) {
      prev.unsubscribeFromOutsideEvents();
    }
    this.view.setRegionView('main', view);
    view.subscribeToOutsideEvents();
  },

  showView: function (View, opt) {
    var view = new View(_.extend({ app: this }, opt));
    this.setMainView(view);
    return view;
  },

  showTemplate: function (name) {
    var app = this;
    var View = tetrapod.View.extend({ templateName: name });
    var view = new View({ app: app });
    app.setMainView(view);
    view.render();
  }

});

