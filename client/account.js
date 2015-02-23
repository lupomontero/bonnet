var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var couch = require('../lib/couch')('/_api');
var uid = require('../lib/uid');
var noop = function () {};


function userDocUrl(email) {
  return '/_users/' + encodeURIComponent('org.couchdb.user:' + email);
}


function getBonnetId() {
  return bonnet.account.session.userCtx.roles.reduce(function (memo, item) {
    var matches = /^bonnet:write:user\/([a-z0-9]+)$/.exec(item);
    if (matches && matches[1]) { return matches[1]; }
    return memo;
  }, null);
}


module.exports = function (bonnet, settings) {

  var account = new EventEmitter();
  var hasInit = false;

  account.signUp = function (email, pass) {
    var bonnetId = uid();
    var userDoc = {
      name: email,
      password: pass,
      roles: [],
      type: 'user',
      bonnetId: bonnetId,
      database: 'user/' + bonnetId
    };

    return couch.put(userDocUrl(email), userDoc);
  };

  account.signIn = function (email, pass) {
    return couch.post('/_session', {
      name: email,
      password: pass
    }).then(function () {
      return account.init();
    });
  };

  account.signOut = function () {
    return couch.del('/_session');
  };

  account.changePassword = function () {};

  account.changeUsername = function () {};

  account.resetPassword = function () {};

  account.destroy = function () {
    //bonnet.store.local.destroy();
    var userCtx = (bonnet.account.session || {}).userCtx || {};
    var url = userDocUrl(userCtx.name);
    console.log(url);
    couch.get(url, function (err, data) {
      console.log(err, data);
    });
    // Destroy local db
    // Delete user from remote db
    // Server should remove user db
  };

  account.isSignedIn = function () {
    var userCtx = (account.session || {}).userCtx || {};
    return (typeof userCtx.name === 'string' && userCtx.name.length > 0);
  };

  account.init = function (cb) {
    cb = cb || noop;

    var wasSignedIn = account.isSignedIn();

    return couch.get('/_session').then(function (data) {
      account.session = data;
      var isSignedIn = account.isSignedIn();
      if (!hasInit) {
        hasInit = true;
        account.emit('init');
      } else if (!wasSignedIn && isSignedIn) {
        account.emit('signin');
      } else if (wasSignedIn && !isSignedIn) {
        account.emit('signout');
      }
      cb();
    }, function (err) {
      console.error(err);
      cb(err);
    });
  };

  return account;

};

