module.exports = Bonnet.View.extend({

  className: 'container',
  templateName: 'index',

  initialize: function (opt) {
    Bonnet.View.prototype.initialize.call(this, opt);
    this.render();
  }

});

