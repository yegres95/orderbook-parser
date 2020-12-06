// Simple memory store for orderbook

//later have an external STATICS file
const [PRICE, VOLUME, TIMESTAMP] = [0, 1, 2];
const [BIDS, ASKS] = ['bids', 'asks'];

class OrderbookStore {

    constructor() {
        this.orderbook = {};
        this.orderBookDepth = 0;
        this.lastPull = undefined; //store last pull timeStamp for error handling
    }

    ingest(data, timeStamp) {
        this.lastPull = timeStamp;
        if (Object.keys(this.orderbook).length == 0) {
            console.log(`[store] Full orderbook reset`);
            this.orderbook.bids = data.bids;
            this.orderbook.asks = data.asks;
            this.orderBookDepth = this.orderbook.asks.length;
        } else {
            //console.log(`[store] Orderbook update`);
            this.update(data);
        }
        this.validateOrderBook()
    }
    
    update(data) {
        const bid = data.bids;
        const ask = data.asks;
        //console.log(`${orderbook.asks[0][PRICE]} --- ${orderbook.bids[0][PRICE]}`)
        if (bid !== undefined) this.updateOrderBook(bid, BIDS);
        if (ask !== undefined) this.updateOrderBook(ask, ASKS);
    }
    
    updateOrderBook(data, type) {
        const list = this.orderbook[type];
        const prices = this.getPrices(data);
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
            this.updateOutOfBookPrice(data, prices, list, type)
        }
    }
    
    updateOutOfBookPrice(data, prices, list, type) {
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            /* If ask, check if price is smaller than the first array entry else if bid, check if bigger */
            let front = (type === ASKS) ? (price < list[0][PRICE]) : (price > list[0][PRICE]);
            /* If ask, check if price is bigger than last array entry else if bid, check if smaller */
            let back = (type === ASKS) ? (price > list[this.orderBookDepth-1][PRICE]) : (price < list[this.orderBookDepth-1][PRICE]); 
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
    
    getPrices(list) {
        const prices = [];
        for (let i = 0; i < list.length; i++) {
            prices.push(list[i][PRICE]);
        }
        return prices;
    }
    
    validateOrderBook() {
        // Validate asks and bid lengths
        if (this.orderbook.asks.length !== this.orderbook.bids.length) {
            console.error("[store] Order book not even\n", this.orderbook);
            process.exit(1); //Can later set up static error codes and catch it with a process on exit for proper print
        }
    }


    getOrderbook() {
        return this.orderbook;
    }

}

module.exports = OrderbookStore

