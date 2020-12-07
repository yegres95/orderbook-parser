const wsSend = require("./services/clientConnection").send;
const { LOAD_ORDERBOOK } = require('./services/constants')

// Each how many microseconds it will calculate and display the speed
const FREQUENCY = 10000;

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
  }

  send(pair, params) {
    this.updates.push(Date.now());
    this.store.ingest(pair, params);
    wsSend({pair, data: this.store.getOrderbook(pair)}, LOAD_ORDERBOOK);
  }

}



module.exports = Sink
