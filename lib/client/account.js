var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');

module.exports = function (bonnet) {

  return {
  
    signUp: function (email, pass) {
      return new Promise(function (resolve, resject) {
      
      });
    },

    signIn: function () {},

    changePassword: function () {},

    changeUsername: function () {},

    signOut: function () {},

    resetPassword: function () {}

  };

};

