var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');

module.exports = function (bonnet) {

  var ee = new EventEmitter();

  return {
  
    on: ee.on.bind(this),
    find: function () {},
    findAll: function () {},
    add: function () {},
    update: function () {},
    remove: function () {},
    removeAll: function () {}

  };

};

