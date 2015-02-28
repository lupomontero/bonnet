# Bonnet Client

This is the bare-bones front-end library (for a full blown experience check out [BonnetUI](./ui/)). This assumes you are using `browserify` to bundle your browser scripts.

```js
// ie: in your `main.js`
var Bonnet = require('bonnet/client');
var bonnet = Bonnet(options);
```

## Options

* `remote`: URL to backend HTTP API. Default is `/_api`.

## `bonnet.account`

### Methods

```js
bonnet.account.id();
bonnet.account.signUp(email, pass);
bonnet.account.signIn(email, id);
bonnet.account.changePassword(secret, newSecret);
bonnet.account.changeUsername(secret, newEmail);
bonnet.account.signOut();
bonnet.account.resetPassword(email);
bonnet.account.destroy();
bonnet.account.isSignedIn();
```

### Events

* `init`
* `signin`
* `signout`

### Properties

* `session`

## `bonnet.store`

### Methods

```js
bonnet.store.find(type, id, options);
bonnet.store.findAll(type, options);
bonnet.store.add(type, attrs);
bonnet.store.update(type, id, attrs);
bonnet.store.remove(type, id);
bonnet.store.removeAll(type);
bonnet.store.attach(type, id, attachments);
bonnet.store.getAttachments(type, id);
bonnet.store.sync();
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

### Methods

```js
bonnet.task.start(type, attrs);
bonnet.task.abort(type, id);
bonnet.task.restart(type, id, extraAttrs);
bonnet.task.restartAll();
```

### Events

* `start`
* `abort`
* `restart`
