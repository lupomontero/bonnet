var _ = require('lodash');
var Backbone = require('backbone');
var Handlebars = require('handlebars');
var moment = require('moment');


Handlebars.registerHelper('log', function (value) {
  console.log(value);
});

Handlebars.registerHelper('formatDate', function (date, format) {
  if (arguments.length === 2) {
    format = 'lll';
  }
  return new Handlebars.SafeString(moment(date).format(format));
});

Handlebars.registerHelper('fromNow', function (date) {
  return new Handlebars.SafeString(moment(date).fromNow());
});


module.exports = Backbone.View.extend({

  templatePath: 'templates',
  templateName: null,
  template: null,
  locals: {},
  _isRendering: false,
  _next: null,

  initialize: function (opt) {
    var view = this;
    opt = opt || {};
    Backbone.View.prototype.initialize.call(view, opt);
    view.app = opt.app;
    view.render = _.debounce(view.render, 100);
    view.locals = _.extend(view.locals, opt.locals || {});
    if (view.templateName) {
      setTimeout(function () {
        view.loadTemplate(view.templateName, function (err, tmpl) {
          view.template = tmpl;
        });
      }, 10);
    }
  },

  render: function (ctx) {
    var view = this;

    // If there was any render invokation waiting to run we cancel it.
    if (view._next) { window.clearTimeout(view._next); }
    // If we are not ready for action schedule rerun...
    if (!view.template || view._isRendering) {
      view._next = window.setTimeout(function () { view.render(ctx); }, 25);
      return view;
    }

    // If no context was passed we use `this.model`.
    ctx = ctx || view.model || {};

    if (_.isFunction(ctx.toViewContext)) {
      ctx = ctx.toViewContext();
    } else if (ctx.attributes) {
      ctx = ctx.attributes;
    } else if (_.isArray(ctx)) {
      ctx = {
        models: _.map(ctx, function (i) {
          return (i.toViewContext) ? i.toViewContext() : i;
        })
      };
    }

    // Render actual handlebars template.
    view._isRendering = true;
    view.$el.addClass('loading');
    view._next = window.setTimeout(function () {
      view.$el.html($.trim(view.template(_.extend({}, view.locals, ctx))));
      view._isRendering = false;
      view.$el.removeClass('loading');
      view.trigger('render');
    }, 25);
    return view;
  },

  partial: function (path, ctx, cb) {
    this.loadTemplate(path, function (err, tmpl) {
      if (err) { return cb(err); }
      cb(null, tmpl(ctx));
    });
  },

  loadTemplate: function (name, cb) {
    var view = this;
    var cache = view.app.templates || {};
    var prefix = view.app.routePrefix || '';

    if (cache.hasOwnProperty(name)) {
      return cb(null, cache[name]);
    }

    $.get(view.templatePath + '/' + name + '.hbs')
      .fail(function () {
        view.trigger('error', new Error('Error loading template (' + name + ')'));
      })
      .done(function (data) {
        cache[name] = Handlebars.compile($.trim(data));
        cb(null, cache[name]);
      });
  },

  back: function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.history.back();
  },

  subscribeToGlobalEvents: function () {
    var view = this;
    // Pass cid to `view._getGlobalEventsHandlers()` as this is memoized and
    // should be recomputed for each view!
    _.each(view._getGlobalEventsHandlers(view.cid), function (ev) {
      ev.src.on(ev.name, ev.fn);
      console.log('View subscribing to global event ' + ev.name);
    });
  },

  unsubscribeFromGlobalEvents: function () {
    _.each(this._getGlobalEventsHandlers(this.cid), function (ev) {
      ev.src.removeListener(ev.name, ev.fn);
      console.log('View unsubscribing from global event ' + ev.name);
    });
  },

  _getGlobalEventsHandlers: _.memoize(function () {
    var view = this;
    
    return _.reduce(view.globalEvents, function (memo, v, k) {
      var parts = k.split(' ');
      var src = parts[0];
      var fn = view[v];
      var ev = { name: parts[1] };
      if (!_.isFunction(fn)) { return; }
      ev.fn = fn.bind(view);
      if (src === 'account') {
        ev.src = view.app.account;
        memo.push(ev);
      } else if (src === 'store') {
        ev.src = view.app.store;
        memo.push(ev);
      } else if (src === 'task') {
        ev.src = view.app.task;
        memo.push(ev);
      }
      return memo;
    }, []);
  })
});

