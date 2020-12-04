const WebSocket = require("ws");

let wss;

function Client(server) {
  wss = new WebSocket.Server({
    port: 8080,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      // Below options specified as default values.
      concurrencyLimit: 10,
      threshold: 1024
    }
  });

  wss.on('message', msgReceived)
  wss.on('open', wsOpened);
}

function msgReceived(data) {
  console.log(data);
}

function wsOpened(data) {
  wss.send('TEST');
}

module.exports = Client