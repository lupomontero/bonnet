var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var PouchDB = require('pouchdb');
var _ = require('lodash');
var uid = require('../lib/uid');
var noop = function () {};


function assertDocType(type) {
  assert.equal(typeof type, 'string', 'Model type must be a string');
}

function parse(doc) {
  return _.extend({ id: doc._id.split('/')[1] }, _.omit(doc, [ '_id' ]));
}

function toJSON(doc) {
  return _.extend({ _id: doc.type + '/' + doc.id }, _.omit(doc, [ 'id' ]));
}


function replicationFilter(doc) {
  return doc._id.indexOf('_design') !== 0;
}


module.exports = function (bonnet, settings) {

  var account = bonnet.account;
  var store = new EventEmitter();

  function emitSyncEvent(eventName, data) {
    store.emit('sync', eventName, data);
    store.emit('sync:' + eventName, data);
  }

  function sync(cb) {
    cb = cb || noop;
    if (!store.remoteUrl) { return cb(); }
    store.remote.replicate.sync(store.local, { filter: replicationFilter })
      .on('error', emitSyncEvent.bind(null, 'error'))
      .on('denied', function (err) {
        console.error('sync denied', err);
      })
      .on('paused', emitSyncEvent.bind(null, 'paused'))
      .on('active', emitSyncEvent.bind(null, 'active'))
      .on('change', emitSyncEvent.bind(null, 'change'))
      .on('complete', function (data) {
        store.lastSync = data.push.end_time;
        if (data.pull.end_time > store.lastSync) {
          store.lastSync = data.pull.end_time;
        }
        emitSyncEvent('complete', data)      
        cb();
      });
  }


  //
  // Store API
  //


  //
  // Find object by id.
  //
  store.find = function (type, id) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      store.local.get(type + '/' + id).then(function (doc) {
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
      store.local.allDocs({
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
      store.local.put(doc).then(function (data) {
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
      return store.local.put({ _deleted: true }, toJSON(doc)._id, doc._rev);
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
    cb = cb || noop;

    var bonnetId = account.bonnetId() || '__bonnet_anon';

    store.local = new PouchDB(bonnetId, { auto_compaction: true });

    function listenToLocalChanges() {
      var localChanges = store.local.changes({ 
        since: 'now', 
        live: true,
        include_docs: true
      });

      localChanges.on('change', function (change) {
        if (change.deleted) {
          store.emit('remove', 'local', change.doc);
          store.emit('remove:local', change.doc);
        }

        store.emit('change', 'local', change);
        store.emit('change:local', change);
        sync();
      });

      cb();
    }

    if (account.isSignedIn()) {
      store.remoteUrl = settings.remote + '/' + encodeURIComponent('user/' + bonnetId);
      store.remote = new PouchDB(store.remoteUrl);
      sync(listenToLocalChanges);
    } else {
      listenToLocalChanges();
    }
  };


  [ 'signin', 'signout' ].forEach(function (eventName) {
    account.on(eventName, store.init.bind(store));
  });

  return store;

};

