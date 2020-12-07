// Simple memory store for orderbook

//later have an external STATICS file
const [PRICE, VOLUME, TIMESTAMP] = [0, 1, 2];
const [BIDS, ASKS] = ['bids', 'asks'];

class OrderbookStore {

    constructor() {
        this.orderbooks = {};
        this.orderBookDepths = {};
    }

    ingest(pair, data) {
        if (!this.orderbooks[pair]) {
            console.log(`[store] Full orderbook reset - ${pair}`);
            this.orderbooks[pair] = {}
            this.orderbooks[pair].bids = data.bids;
            this.orderbooks[pair].asks = data.asks;
            this.orderBookDepths[pair] = this.orderbooks[pair].asks.length;
        } else {
            //console.log(`[store] Orderbook update`);
            this.update(pair, data);
        }
        this.validateOrderBook(pair)
    }
    
    update(pair, data) {
        const bid = data.bids;
        const ask = data.asks;
        //console.log(`${orderbook.asks[0][PRICE]} --- ${orderbook.bids[0][PRICE]}`)
        if (bid !== undefined) this.updateOrderBook(pair, bid, BIDS);
        if (ask !== undefined) this.updateOrderBook(pair, ask, ASKS);
    }
    
    updateOrderBook(pair, data, type) {
        const list = this.orderbooks[pair][type];
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
            this.updateOutOfBookPrice(pair, data, prices, list, type)
        }
    }
    
    updateOutOfBookPrice(pair, data, prices, list, type) {
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            /* If ask, check if price is smaller than the first array entry else if bid, check if bigger */
            let front = (type === ASKS) ? (price < list[0][PRICE]) : (price > list[0][PRICE]);
            /* If ask, check if price is bigger than last array entry else if bid, check if smaller */
            let back = (type === ASKS) ? (price > list[this.orderBookDepths[pair]-1][PRICE]) : (price < list[this.orderBookDepths[pair]-1][PRICE]); 
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
    
    validateOrderBook(pair) {
        // Validate asks and bid lengths
        if (this.orderbooks[pair].asks.length !== this.orderbooks[pair].bids.length) {
            console.error("[store] Order book not even\n", this.orderbooks[pair]);
            process.exit(1); //Can later set up static error codes and catch it with a process on exit for proper print
        }
    }


    getOrderbook(pair) {
        return this.orderbooks[pair];
    }

}

module.exports = OrderbookStore

