var http = require('http');

const orderBooks = ["ETH/XBT", "XBT/USD"];

const store = require("./store/index");
const Kraken = require("./services/krakenMarket");
const Client = require("./services/clientConnection").Client;
const Sink = require("./sink");

const orderbookStore = new store.orderbook();
const sink = new Sink(orderbookStore)
const exchange = Kraken(orderBooks, sink);
const connections = Client(orderbookStore);
