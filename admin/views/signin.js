module.exports = Bonnet.View.extend({

  className: 'container',
  templateName: 'signin',

  initialize: function (opt) {
    var view = this;
    Bonnet.View.prototype.initialize.call(view, opt);
    view.render();
  }

});

