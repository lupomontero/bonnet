var Couch = require('../couch');


module.exports = Bonnet.View.extend({

  className: 'container',
  templateName: 'signin',

  initialize: function (opt) {
    var view = this;
    Bonnet.View.prototype.initialize.call(view, opt);
    view.render();
  },

  events: {
    'submit #signin-form': 'submit'
  },

  submit: function (e) {
    e.preventDefault();
    var app = this.options.app;
    var credentials = { name: 'admin', password: $('#pass').val() };

    Couch('/_api').post('/_session', credentials, function (err, data) {
      if (err) { return console.error(err); }
      window.location = '/_admin';
    });

    return false;
  }

});

