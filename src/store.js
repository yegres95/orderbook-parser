// Simple memory store for orderbook

//later have an external STATICS file
const [PRICE, VOLUME, TIMESTAMP] = [0, 1, 2];
const [BIDS, ASKS] = ['bids', 'asks'];

const orderbook = {};
let orderBookDepth = 0;

let lastPull = undefined; //store last pull timeStamp for error handling

module.exports = {
    ingest(data, timeStamp) {
        lastPull = timeStamp;
        if (Object.keys(orderbook).length == 0) {
            console.log(`[store] Full orderbook reset`);
            orderbook.bids = data.bids;
            orderbook.asks = data.asks;
            orderBookDepth = orderbook.asks.length;
        } else {
            //console.log(`[store] Orderbook update`);
            update(data);
        }
        validateOrderBook()
    }
}

function update(data) {
    const bid = data.bids;
    const ask = data.asks;
    //console.log(`${orderbook.asks[0][PRICE]} --- ${orderbook.bids[0][PRICE]}`)
    if (bid !== undefined) updateOrderBook(bid, BIDS);
    if (ask !== undefined) updateOrderBook(ask, ASKS);
}

function updateOrderBook(data, type) {
    const list = orderbook[type];
    const prices = getPrices(data);
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const matchedIndex = prices.indexOf(item[PRICE]);
        if (matchedIndex !== -1) {
            list[i] = data[matchedIndex];
            prices.splice(matchedIndex, 1); //Remove the matched number for later filtering
            data.splice(matchedIndex, 1);
        }
    }
    if (prices.length != 0) { // If all the price updates did not fit into the old snapshot of the order book
        updateOutOfBookPrice(data, prices, list, type)
    }
}

function updateOutOfBookPrice(data, prices, list, type) {
    for (let i = 0; i < prices.length; i++) {
        const price = prices[i];
        /* If ask, check if price is smaller than the first array entry else if bid, check if bigger */
        let front = (type === ASKS) ? (price < list[0][PRICE]) : (price > list[0][PRICE]);
        /* If ask, check if price is bigger than last array entry else if bid, check if smaller */
        let back = (type === ASKS) ? (price > list[orderBookDepth-1][PRICE]) : (price < list[orderBookDepth-1][PRICE]); 
        /* The bid and ask arrays are mirrored, hence the need for above */
        if (front) {
            list.unshift(data[i]);
            list.pop();
        } else if (back) {
            list.push(data[i]);
            list.shift();
        }
    }
}

function getPrices(list) {
    const prices = [];
    for (let i = 0; i < list.length; i++) {
        prices.push(list[i][PRICE]);
    }
    return prices;
}

function validateOrderBook() {
    // Validate asks and bid lengths
    if (orderbook.asks.length !== orderbook.bids.length) {
        console.error("[store] Order book not even\n", orderbook);
        process.exit(1); //Can later set up static error codes and catch it with a process on exit for proper print
    }
}