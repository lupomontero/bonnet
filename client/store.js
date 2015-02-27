var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var PouchDB = require('pouchdb');
var _ = require('lodash');
var async = require('async');
var uid = require('../lib/uid');
var noop = function () {};


function assertDocType(type) {
  if (!_.isString(type)) {
    throw new Error('Model type must be a string');
  }
}

function parse(doc) {
  var idParts = doc._id.split('/');
  return _.extend({
    id: idParts[1],
    type: idParts[0]
  }, _.omit(doc, [ '_id' ]));
}

function toJSON(doc) {
  return _.extend({ _id: doc.type + '/' + doc.id }, _.omit(doc, [ 'id' ]));
}


module.exports = function (bonnet, settings) {

  var account = bonnet.account;
  var store = new EventEmitter();

  
  function emitSyncEvent(eventName, data) {
    store.emit('sync', eventName, data);
    store.emit('sync:' + eventName, data);
  }


  //
  // Store API
  //


  //
  // Trigger bidirectional replication.
  //
  // TODO: DEBOUNCE SYNC!!!
  //
  store.sync = function (cb) {
    cb = cb || noop;
    if (!store.remoteUrl) { return cb(); }
    store.remote.replicate.sync(store.local, {
      filter: function (doc) {
        return doc._id.indexOf('_design') !== 0;
      }
    })
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
        emitSyncEvent('complete', data);
        cb();
      });
  };


  //
  // Find object by type and id.
  //
  store.find = function (type, id, options) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      store.local.get(type + '/' + id).then(function (doc) {
        var attrs = parse(doc);
        if (!options || !options.attachments || !doc._attachments) {
          return resolve(attrs);
        }
        store.getAttachments(doc).then(function (attachments) {
          attrs._attachments = attachments;
          resolve(attrs);
        });
      }, reject);
    });
  };


  //
  // Find all objects of a given type.
  //
  store.findAll = function (type, options) {
    assertDocType(type);
    return new Promise(function (resolve, reject) {
      store.local.allDocs({
        include_docs: true,
        startkey: type + '/',
        endkey: type + '0'
      }).then(function (data) {
        var docs = data.rows.map(function (row) {
          return parse(row.doc);
        });
        if (!options.attachments) { return resolve(docs); }
        async.each(docs, function (attrs, cb) {
          store.getAttachments(attrs).then(function (attachments) {
            attrs._attachments = attachments;
            cb();
          }, cb);
        }, function (err) {
          if (err) { return reject(err); }
          resolve(docs);
        });
      }, reject);
    });
  };


  //
  // Add object to store.
  //
  store.add = function (type, attrs) {
    assertDocType(type);

    var binaryAttachments = {};
    var inlineAttachments = _.reduce(attrs._attachments, function (memo, v, k) {
      if (v instanceof File) {
        binaryAttachments[k] = v;
      } else {
        memo[k] = v;
      }
      return memo;
    }, {});

    var doc = _.extend({}, _.omit(attrs, [ '_attachments' ]), {
      _id: type + '/' + uid(),
      createdAt: new Date(),
      type: type
    });

    if (_.keys(inlineAttachments).length) {
      doc._attachments = inlineAttachments;
    }

    return new Promise(function (resolve, reject) {
      var db = store.local;

      db.put(doc).then(function (data) {
        doc._rev = data.rev;

        var binaryAttachmentsKeys = _.keys(binaryAttachments);

        if (!binaryAttachmentsKeys.length) {
          return resolve(parse(doc));
        }

        async.eachSeries(binaryAttachmentsKeys, function (key, cb) {
          var docId = doc._id;
          var rev = doc._rev;
          var file = binaryAttachments[key];
          var type = file.type;
          db.putAttachment(docId, key, rev, file, type, function (err, data) {
            if (err) { return cb(err); }
            doc._rev = data.rev;
            cb();
          });
        }, function (err) {
          if (err) { return reject(err); }
          resolve(parse(doc));
        });
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


  store.attach = function (type, id, attachment, contentType) {
    //console.log(type, id, attachment, contentType);
    return;
  };


  store.getAttachments = function (doc) {
    var docId = toJSON(doc)._id;
    var attachments = doc._attachments || {};
    var attachmentKeys = _.keys(attachments);

    return new Promise(function (resolve, reject) {
      if (!attachmentKeys.length) { return resolve([]); }

      async.each(attachmentKeys, function (key, cb) {
        store.local.getAttachment(docId, key, function (err, data) {
          if (err) { return cb(err); }
          attachments[key].data = data;
          cb();
        });
      }, function (err) {
        if (err) { return reject(err); }
        resolve(attachments);
      });
    });
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
        var doc = parse(change.doc);
        var type = doc.type;

        if (!type) { return; }

        function emit(eventName) {
          store.emit(eventName, doc, { local: true });
          store.emit(eventName + ':' + type, doc, { local: true });
        }

        if (change.deleted || doc._deleted) {
          emit('remove');
        } else if (/^1-/.test(doc._rev)) {
          emit('add');
        } else {
          emit('update');
        }

        emit('change');

        store.sync();
      });

      cb();
    }

    if (account.isSignedIn()) {
      store.remoteUrl = settings.remote + '/' + encodeURIComponent('user/' + bonnetId);
      store.remote = new PouchDB(store.remoteUrl);
      store.sync(listenToLocalChanges);
    } else {
      listenToLocalChanges();
    }
  };


  [ 'signin', 'signout' ].forEach(function (eventName) {
    account.on(eventName, store.init.bind(store));
  });

  return store;

};

