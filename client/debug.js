var moment = require('moment');

module.exports = function (options) {

  if (!options || !options.debug) {
    return function () {};
  }

  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(moment().format('hh:mm:ss SSS') + ' ==> ');
    return console.log.apply(console, args);
  };

};

