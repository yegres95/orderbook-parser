const store = require("./store/index");

// Each how many microseconds it will calculate and display the speed
const FREQUENCY = 10000;

const updates = [];

module.exports = {
  send(params) {
    const timeStamp = Date.now()
    updates.push(timeStamp);
    store.orderbook.ingest(params, timeStamp);
  }
};

setInterval(() => {
  const updatesPerMinute =
    (updates.filter(u => u > Date.now() - FREQUENCY).length * 60000) /
    FREQUENCY;

  console.log(`[sink] Speed: ${updatesPerMinute} orderbooks per minute`);
}, FREQUENCY);
