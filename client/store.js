var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var PouchDB = require('pouchdb');
var _ = require('lodash');


var uid = (function () {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
  return function (length) {
    var id = '';
    var radix = chars.length;

    // default uuid length to 7
    if (length === undefined) {
      length = 7;
    }

    for (var i = 0; i < length; i++) {
      var rand = Math.random() * radix;
      var char = chars[Math.floor(rand)];
      id += String(char).charAt(0);
    }

    return id;
  };
}());


function assertDocType(type) {
  assert.equal(typeof type, 'string', 'Model type must be a string');
}

function parse(doc) {
  return _.extend({ id: doc._id.split('/')[1] }, _.omit(doc, [ '_id' ]));
}


module.exports = function (bonnet, settings) {

  var account = bonnet.account;
  var store = new EventEmitter();
  var local = store.local = new PouchDB('__bonnet');
  var remote = store.remote = new PouchDB(settings.remote);

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
      local.allDocs({ include_docs: true }).then(function (data) {
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
      return local.remove(doc);
    });
  };

  store.removeAll = function (type) {
  };

  store.init = function (cb) {
    var userCtx = account.session.userCtx;
    console.log(userCtx);
    console.log('initialise store...');

    var localChanges = local.changes({ 
      since: 'now', 
      live: true,
      include_docs: true
    });

    localChanges.on('change', function (change) {
      console.log('change', change);
      if (change.deleted) {
        store.emit('remove', change.doc);
      }
      store.emit('change', change);
    });

    cb();
  };

  return store;

};

