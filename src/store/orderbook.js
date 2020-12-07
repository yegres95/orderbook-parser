// Simple memory store for orderbook

const { PRICE, BIDS, ASKS, TIMESTAMP } = require('../constants')

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
        //this.validateOrderBook(pair)
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
        data = this.filterDoubles(data); //Needs to be filtered as sometimes multiple updates come for 1 price
        const prices = this.getPrices(data);
        for (let i = 0; i < list.length; i++) {
            const matchedIndex = prices.indexOf(list[i][PRICE]);
            if (matchedIndex !== -1) {
                list[i] = data[matchedIndex];
                prices.splice(matchedIndex, 1); //Remove the matched number for later filtering
                data.splice(matchedIndex, 1);
            }
            
            if (parseFloat(list[i][1]) === 0) {
                list.splice(i, 1);
                i--;
            }
        }

        if (prices.length != 0) { // If all the price updates did not fit into the old snapshot of the order book
            this.updateOutOfBookPrice(pair, data, prices, list, type)
        }
    }

    updateOutOfBookPrice(pair, data, prices, list, type) {
        for (let i = 0; i < prices.length; i++) {
            list.push(data[i]);
        }
        if (type === ASKS) { //Goes UP
            list.sort(function(a, b) {
                return parseFloat(a) - parseFloat(b);
            })
        } else { //Goes DOWN
            list.sort(function(a, b) {
                return parseFloat(b) - parseFloat(a);
            })
        }
        list.splice(this.orderBookDepths[pair], list.length)
    }

    filterDoubles(data) {
        let hash = {}
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (hash[item[PRICE]]) { //If exists in hash
                if (hash[item[PRICE]][TIMESTAMP] < item[TIMESTAMP]) { //If out of date information
                    hash[item[PRICE]] = item
                }
            } else {
                hash[item[PRICE]] = item;
            }
        }
        let finalArray = [];
        let keys = Object.keys(hash);
        for (let i = 0; i < keys.length; i++) {
            finalArray.push(hash[keys[i]]);
        }
        return finalArray;
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

