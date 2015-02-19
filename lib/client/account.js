var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');


module.exports = function (bonnet, settings) {

  var account = new EventEmitter();

  account.signUp = function (email, pass) {
    return new Promise(function (resolve, resject) {
    
    });
  };

  account.signIn = function () {};

  account.changePassword = function () {};

  account.changeUsername = function () {};

  account.signOut = function () {};

  account.resetPassword = function () {};

  account.init = function (cb) {
    var state = localStorage.getItem('_bonnet_state');
    if (state) {
      try { state = JSON.parse(state); } catch (err) {}
    }
    if (!state) {
      state = {};
    }

    $.ajax({
      type: 'GET',
      url: '/_api/_session',
      dataType: 'json'
    }).then(function (data) {
      account.session = data;
      cb();
    }, function (err) {
      console.error(err);
    });
  };

  return account;

};

