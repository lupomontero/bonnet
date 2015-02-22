var Backbone = require('backbone');
Backbone.$ = window.jQuery;


var App = require('../client/app');
var opt = { routePrefix: '_admin/' };
var app = new App(opt);


app.route('', function () {
  console.log('');
});


app.route('signin', function () {
  this.showView(require('./views/signin'));
});


app.start();

