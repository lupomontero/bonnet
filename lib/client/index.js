//
// `Bonnet` Front end API
//
window.Bonnet = function (options) {

  var bonnet = {};

  bonnet.account = require('./account')(bonnet);
  bonnet.store = require('./store')(bonnet);
  bonnet.task = require('./task')(bonnet);

  return bonnet;

};

