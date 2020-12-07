const WebSocket = require("ws");

const { LOAD_ORDERBOOK } = require('../constants')

let wss;
const clients = []

function Client(orderbookStore) {
  wss = new WebSocket.Server({
    port: 8080
  });

  wss.on('connection', function connection(ws) {
    clients.push(ws)
    const id = clients.length-1
    ws.on('message', msgReceived)
    ws.on('open', wsOpened);
    ws.on('close', () => {wsClosed(id)});
  });

  
}

function wsClosed(id) {
  clients.splice(id, 1)
  console.log(`[socket] - closed ID: ${id} - connections left: ${clients.length}`)
}

function msgReceived(data) {
  console.log(`[socket] - ${data}`);
}

function wsOpened(data) {
  console.log(data);
  wss.send('CONNECTED');
}

function send(data, channel) {
  for (let i = 0; i < clients.length; i++) { //send data to all connected clients
    const ws = clients[i];
    ws.send(JSON.stringify( { payload: data, channel } ));
  }
}

module.exports = {
  Client,
  send
}