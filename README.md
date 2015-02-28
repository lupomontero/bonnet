# Bonnet

* [Bonnet](./client/): The front-end client.
* [BonnetUI](./client/ui/): Front-end UI framework.
* [Server](./server/): The `node.js` back-end server.
* [Admin](./admin/): The admin interface.

## Getting started

```sh
mkdir myapp
cd myapp
npm init
npm install --save bonnet
```

File structure...

```
.
├── package.json
└── www
    ├── index.html
    └── main.js
```

In your `package.json`


```json
{
  "scripts": {
    "start": "./node_modules/bonnet/bin/cli.js start"
  }
}
```
