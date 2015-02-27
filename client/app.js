var _ = require('lodash');
var Backbone = require('backbone');
var AppView = require('./app-view');


module.exports = Backbone.Router.extend({

  initialize: function (opt) {
    var app = this;
    this.options = opt;
    Backbone.Router.prototype.initialize.call(app, opt);
    app.view = new AppView({ model: app });
    if (!app.routes) { app.routes = {}; }
  },

  route: function (route, name, cb) {
    var prefix = this.options.routePrefix || '';
    if (arguments.length === 2) {
      cb = name;
      name = route;
    }
    this.routes[route] = cb;
    return Backbone.Router.prototype.route.call(this, prefix + route, name, cb);
  },

  navigate: function (fragment, options) {
    var prefix = this.options.routePrefix || '';
    return Backbone.Router.prototype.navigate.call(this, prefix + fragment, options);
  },

  start: function () {
    Backbone.history.start({ pushState: true });
  },

  addRegion: function (name, opt) {
    this.view.addRegion(name, opt);
  },

  setMainView: function (view) {
    var prev = (this.view.regions.main || {}).view;
    if (prev && prev.unsubscribeFromGlobalEvents) {
      prev.unsubscribeFromGlobalEvents();
    }
    this.view.setRegionView('main', view);
    view.subscribeToGlobalEvents();
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
  },

  requireSignIn: function (fn) {
    var app = this;
    return function () {
      if (!app.account.isSignedIn()) {
        return app.navigate('signin', { trigger: true });
      }
      fn.apply(this, Array.prototype.slice.call(arguments, 0));
    };
  },

  requireSignOut: function (fn) {
    var app = this;
    return function () {
      if (app.account.isSignedIn()) {
        return app.navigate('dashboard', { trigger: true });
      }
      fn.apply(this, Array.prototype.slice.call(arguments, 0));
    };
  }

});

