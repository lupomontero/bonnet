/*
var Backbone = require('backbone');
// Have to tell Backbone where to find jQuery
Backbone.$ = window.jQuery;

var Couch = require('../lib/couch');
var App = require('../client/app');
var opt = { routePrefix: '_admin/' };
var app = new App(opt);
var session;


function requireAdmin(fn) {
  return function () {
    if (session.userCtx.roles.indexOf('_admin') === -1) {
      return app.navigate('signin', { trigger: true });
    }
    fn.apply(this, Array.prototype.slice.call(arguments, 0));
  };
}


app.route('', requireAdmin(function () {
  this.showView(require('./views/index'));
}));


app.route('signin', function () {
  this.showView(require('./views/signin'));
});


Couch('/_api').get('/_session', function (err, data) {
  session = data || { userCtx: { name: null, roles: [] } };
  app.start();
});
*/
