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
    var that = this;
    opt = opt || {};
    Backbone.View.prototype.initialize.call(that, opt);
    that.options = opt;
    that.render = _.debounce(that.render, 100);
    that.locals = _.extend(that.locals, opt.locals || {});
    if (that.templateName) {
      setTimeout(function () {
        that.loadTemplate(that.templateName, function (err, tmpl) {
          that.template = tmpl;
        });
      }, 10);
    }
  },

  render: function (ctx) {
    var that = this;

    // If there was any render invokation waiting to run we cancel it.
    if (that._next) { window.clearTimeout(that._next); }
    // If we are not ready for action schedule rerun...
    if (!that.template || that._isRendering) {
      that._next = window.setTimeout(function () { that.render(ctx); }, 25);
      return that;
    }

    // If no context was passed we use `this.model`.
    ctx = ctx || that.model || {};

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
    that._isRendering = true;
    that.$el.addClass('loading');
    that._next = window.setTimeout(function () {
      that.$el.html($.trim(that.template(_.extend({}, that.locals, ctx))));
      that._isRendering = false;
      that.$el.removeClass('loading');
      that.trigger('render');
    }, 25);
    return that;
  },

  partial: function (path, ctx, cb) {
    this.loadTemplate(path, function (err, tmpl) {
      if (err) { return cb(err); }
      cb(null, tmpl(ctx));
    });
  },

  loadTemplate: function (name, cb) {
    var that = this;
    var cache = bonnet.templates || {};
    var prefix = bonnet.options.routePrefix || '';

    if (cache.hasOwnProperty(name)) {
      return cb(null, cache[name]);
    }

    $.get(that.templatePath + '/' + name + '.hbs')
      .fail(function () {
        that.trigger('error', new Error('Error loading template (' + name + ')'));
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
      ev.src.off(ev.name, ev.fn);
      console.log('View unsubscribing from global event ' + ev.name);
    });
  },

  _getGlobalEventsHandlers: _.memoize(function () {
    var view = this;
    var account = bonnet.account;
    var store = bonnet.store;
    var task = bonnet.task;
    
    return _.reduce(view.globalEvents, function (memo, v, k) {
      var parts = k.split(' ');
      var src = parts[0];
      var fn = view[v];
      var ev = { name: parts[1] };
      if (!_.isFunction(fn)) { return; }
      ev.fn = fn.bind(view);
      if (src === 'account') {
        ev.src = account;
        memo.push(ev);
      } else if (src === 'store') {
        ev.src = store;
        memo.push(ev);
      } else if (src === 'task') {
        ev.src = task;
        memo.push(ev);
      }
      return memo;
    }, []);
  })
});

