const wsSend = require("./services/clientConnection").send;
const { LOAD_ORDERBOOK } = require('./constants')
const config = require('../config.json');

// Each how many milliseconds it will calculate and display the speed
const FREQUENCY = 10000;

class Sink {

  constructor(store) {
    this.store = store;
    this.updates = {};
    this.pairsSending = {};
    this.updatesPerMinute = {};

    setInterval(() => { //Update the updates per minute stat every FREQUENCY
      let pairs = Object.keys(this.pairsSending);
      for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];
        const updatesPerMinute =
          (this.updates[pair].filter(u => u > Date.now() - FREQUENCY).length * 60000) /
          FREQUENCY;
    
        this.updatesPerMinute[pair] = updatesPerMinute;
        console.log(`[sink] Speed: ${updatesPerMinute} orderbooks per minute -> ${pair}`);
      }
    }, FREQUENCY);

    setInterval(() => { //Sned updates to ws every UPDATE_FREQUENCY
      Object.keys(this.pairsSending).forEach(pair => {
        wsSend({pair, updatesPerMinute: this.updatesPerMinute[pair], data: this.store.getOrderbook(pair)}, LOAD_ORDERBOOK);
      })
    }, config.update_frequency);
  }

  send(pair, params) {
    if (this.updates[pair] === undefined) {
      this.updates[pair] = []
    } 
    this.updates[pair].push(Date.now());
    this.store.ingest(pair, params);
    this.pairsSending[pair] = true
  }

}

module.exports = Sink
