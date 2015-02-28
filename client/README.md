# Bonnet Client

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
store.attach(type, id, attachments);
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
