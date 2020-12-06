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

  send(params) {
    const timeStamp = Date.now()
    this.updates.push(timeStamp);
    this.store.ingest(params, timeStamp);
    wsSend(this.store.getOrderbook(), LOAD_ORDERBOOK);
  }

}



module.exports = Sink
