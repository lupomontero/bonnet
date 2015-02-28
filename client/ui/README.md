# Bonnet UI

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
