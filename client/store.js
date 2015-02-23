var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var PouchDB = require('pouchdb');
var _ = require('lodash');
var uid = require('../lib/uid');


function assertDocType(type) {
  assert.equal(typeof type, 'string', 'Model type must be a string');
}

function parse(doc) {
  return _.extend({ id: doc._id.split('/')[1] }, _.omit(doc, [ '_id' ]));
}

function toJSON(doc) {
  return _.extend({ _id: doc.type + '/' + doc.id }, _.omit(doc, [ 'id' ]));
}


module.exports = function (bonnet, settings) {

  var account = bonnet.account;
  var store = new EventEmitter();
  var local = store.local = new PouchDB('__bonnet');

  function emitSyncEvent(eventName, data) {
    store.emit('sync', eventName, data);
    store.emit('sync:' + eventName, data);
  }

  function sync() {
    if (!store.remoteUrl) { return; }
    emitSyncEvent('start');
    local.replicate.sync(store.remoteUrl)
      .on('change', emitSyncEvent.bind(null, 'change'))
      .on('complete', emitSyncEvent.bind(null, 'complete'))
      .on('error', emitSyncEvent.bind(null, 'error'));
  }

  function initRemote() {
    var bonnetId = account.session.userCtx.roles.reduce(function (memo, item) {
      var matches = /^bonnet:write:user\/([a-z0-9]+)$/.exec(item);
      if (matches && matches[1]) { return matches[1]; }
      return memo;
    }, null);

    store.remoteUrl = settings.remote + '/' + encodeURIComponent('user/' + bonnetId);
    store.remote = new PouchDB(store.remoteUrl);
    sync();
  }

  account.on('init', function () {
    if (account.isSignedIn()) {
      initRemote();
    }
  });

  account.on('signin', function () {
    initRemote();
  });

  account.on('signout', function () {
  
  });

  store.find = function (type, id) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      local.get(type + '/' + id).then(function (doc) {
        resolve(parse(doc));
      }, reject);
    });
  };

  store.findAll = function (type) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      local.allDocs({
        include_docs: true,
        startkey: type + '/',
        endkey: type + '0'
      }).then(function (data) {
        resolve(data.rows.map(function (row) {
          return parse(row.doc);
        }));
      }, reject);
    });
  };

  store.add = function (type, attrs) {
    assertDocType(type);
    var doc = _.extend({}, attrs, {
      _id: type + '/' + uid(),
      createdAt: new Date(),
      type: type
    });
    return new Promise(function (resolve, reject) {
      local.put(doc).then(function (data) {
        doc._rev = data.rev;
        resolve(parse(doc));
      }, reject);
    });
  };

  store.update = function (type, id, attrs) {
    assertDocType(type);
    // ...
  };

  store.remove = function (type, id) {
    return store.find(type, id).then(function (doc) {
      return local.remove(toJSON(doc));
    });
  };

  store.removeAll = function (type) {
  };

  store.init = function (cb) {
    //var userCtx = account.session.userCtx;
    //console.log(userCtx);
    //console.log('initialise store...');

    var localChanges = local.changes({ 
      since: 'now', 
      live: true,
      include_docs: true
    });

    localChanges.on('change', function (change) {
      sync();
      if (change.deleted) {
        store.emit('remove', change.doc);
      }
      store.emit('change', change);
    });

    cb();
  };

  return store;

};

