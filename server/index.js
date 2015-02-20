var async = require('async');
var config = require('./config');
var couch = require('./couch');
var www = require('./www');


module.exports = function (argv) {

  async.applyEachSeries([
    couch,
    www
  ], config(argv), function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Bonnet back-end has started ;-)');
  });

};

