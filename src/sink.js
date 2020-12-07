const wsSend = require("./services/clientConnection").send;
const { LOAD_ORDERBOOK } = require('./services/constants')

// Each how many milliseconds it will calculate and display the speed
const FREQUENCY = 10000;
const UPDATE_FREQUENCY = 1000; // How often the user gets sent the updated orderbooks

const pairsSending = {};

class Sink {

  constructor(store) {
    this.store = store;
    this.updates = [];

    setInterval(() => {
      const updatesPerMinute =
        (this.updates.filter(u => u > Date.now() - FREQUENCY).length * 60000) /
        FREQUENCY;
  
      console.log(`[sink] Speed: ${updatesPerMinute} orderbooks per minute`);
    }, FREQUENCY);

    setInterval(() => {
      Object.keys(pairsSending).forEach(pair => {
        wsSend({pair, data: this.store.getOrderbook(pair)}, LOAD_ORDERBOOK);
      })
    }, UPDATE_FREQUENCY);
  }

  send(pair, params) {
    this.updates.push(Date.now());
    this.store.ingest(pair, params);
    pairsSending[pair] = true
  }

}

module.exports = Sink
