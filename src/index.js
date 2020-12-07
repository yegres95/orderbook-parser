var http = require('http');

const store = require("./store/index");
const Kraken = require("./services/krakenMarket");
const Client = require("./services/clientConnection").Client;
const Sink = require("./sink");

const orderbookStore = new store.orderbook();
const sink = new Sink(orderbookStore)
const exchange = Kraken(["ETH/XBT", "XBT/USD"], sink);
const connections = Client(orderbookStore);
