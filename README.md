# Bonnet

## `Bonnet.View`

```js
var Notes = require('../collections/notes');

module.exports = Bonnet.View.extend({
  className: 'container',
  templateName: 'index',
  initialize: function () {
    var view = this;
    var notes = view.model = new Notes();
    notes.on('sync', function () {
      view.render();
    });
    notes.fetch();
  }
});
```

## `Bonnet.Model`

```js
module.exports = Bonnet.Model.extend({
  defaults: function () {
    return {
      type: 'note',
      createdAt: new Date()
    };
  }
});
```

## `Bonnet.Collection`

```js
var Note = require('../models/note');

module.exports = Bonnet.Collection.extend({
  model: Note
});
```

## `bonnet.account`

### Methods

```js
account.signUp(email, pass);
account.signIn(email, id);
account.changePassword(secret, newSecret);
account.changeUsername(secret, newEmail);
account.signOut();
account.resetPassword(email);
account.destroy();
account.isSignedIn();
```

### Events

* `init`
* `signin`
* `signout`

## `bonnet.store`

### Methods

```js
store.find(type, id, options);
store.findAll(type, options);
store.add(type, attrs);
store.update(type, id, attrs);
store.remove(type, id);
store.removeAll(type);
store.attach(type, id, attachment);
store.getAttachments(type, id);
store.sync();
```

### Events

* `add`
* `update`
* `remove`
* `change`???
* `sync`
* `sync:error`
* `sync:paused`
* `sync:active`
* `sync:change`
* `sync:complete`

## `bonnet.task`

```js
task.start(type, attrs);
task.abort(type, id);
task.restart(type, id, extraAttrs);
task.restartAll();
```
