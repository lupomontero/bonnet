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

  function emitEvent(type, eventName, data) {
    store.emit(type, eventName, data);
    store.emit(type + ':' + eventName, data);
  }

  function push() {
    if (!store.remoteUrl) { return; }
    emitEvent('push', 'start');
    local.replicate.to(store.remoteUrl)
      .on('change', emitEvent.bind(null, 'push', 'change'))
      .on('complete', emitEvent.bind(null, 'push', 'complete'))
      .on('error', emitEvent.bind(null, 'push', 'error'));
  }

  function sync() {
    if (!store.remoteUrl) { return; }
    emitEvent('sync', 'start');
    local.replicate.sync(store.remoteUrl)
      .on('change', emitEvent.bind(null, 'sync', 'change'))
      .on('complete', emitEvent.bind(null, 'sync', 'complete'))
      .on('error', emitEvent.bind(null, 'sync', 'error'));
  }

  function initRemote() {
    if (account.isSignedIn()) {
      initRemote();
    }
    var bonnetId = account.bonnetId();
    store.remoteUrl = settings.remote + '/' + encodeURIComponent('user/' + bonnetId);
    store.remote = new PouchDB(store.remoteUrl);
    sync();
  }

  account.on({
    init: initRemote,
    signin: initRemote,
    signout: initRemote
  });


  //
  // Public API
  //


  //
  // Find object by id.
  //
  store.find = function (type, id) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      local.get(type + '/' + id).then(function (doc) {
        resolve(parse(doc));
      }, reject);
    });
  };


  //
  // Find all objects of a given type.
  //
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


  //
  // Add object to store.
  //
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


  //
  // Update object in store.
  //
  store.update = function (type, id, attrs) {
    assertDocType(type);
    // ...
  };


  //
  // Remove object from store.
  //
  store.remove = function (type, id) {
    return store.find(type, id).then(function (doc) {
      return local.remove(toJSON(doc));
    });
  };

  //
  // Remove all objects of given type from store.
  //
  store.removeAll = function (type) {
    // ...
  };


  //
  // Initialise store.
  //
  store.init = function (cb) {
    var localChanges = local.changes({ 
      since: 'now', 
      live: true,
      include_docs: true
    });

    localChanges.on('change', function (change) {
      push();
      if (change.deleted) {
        store.emit('remove', change.doc);
      }
      store.emit('change', change);
    });

    cb();
  };


  return store;

};

