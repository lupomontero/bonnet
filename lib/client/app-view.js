var _ = require('lodash');
var Backbone = require('backbone');


module.exports = Backbone.View.extend({

  el: 'body',

  regions: {},

  events: {
    'click a': 'overrideLink'
  },

  initialize: function (opt) {
    opt = opt || {};
    Backbone.View.prototype.initialize.call(this, opt);
    this.options = opt;
    this.addRegion('main', { view: null, prepend: true });
    this.addRegion('notifications', { view: null });
    $('html').removeClass('no-js');
  },

  addRegion: function (name, opt) {
    var region = _.extend({ id: name }, opt || {});

    // If no DOM element has been specified to contain this region's view we
    // create a new node.
    if (!region.$el) {
      var tagName = opt.tagName || 'div';
      region.$el = $('<' + tagName + ' id="' + region.id + '">');
      if (opt.className) {
        region.$el.addClass(opt.className);
      }
    }

    region.$el.attr('data-app-region', name);

    if (name === 'main') {
      // If main region we inject the DOM element at the beginning of the
      // AppView's $el, that is the body tag.
      this.$el.prepend(region.$el);
    } else {
      // All other regions are added relative to the main view, either after
      // (default) or before (if prepend option is set).
      var method = (region.prepend) ? 'before' : 'after';
      this.regions.main.$el[method](region.$el);
    }

    // Store reference to `region`.
    this.regions[name] = region;

    // If a view is already defined for this region we use the
    // `this.setRegionView()` method to initialise the view properly inside
    // the region's container.
    if (region.view && region.view.$el) {
      this.setRegionView(name, region.view);
    }
  },

  setRegionView: function (name, view) {
    var that = this;
    var region = that.regions[name];
    var container = region.$el[0];
    if (!region) { throw new Error('Unknown region: ' + name); }
    if (!view) { throw new Error('No view passed to AppView.setRegionView()'); }
    if (view.$el && !$.contains(container, view.$el)) {
      region.$el.html(view.$el);
    }
    region.view = view;
    that.trigger('region:view', region);
  },

});

