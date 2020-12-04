var http = require('http');

const Kraken = require("./services/krakenMarket");
const Client = require("./services/clientConnection");

const exchange = Kraken({ symbol: "ETH/XBT" });
const connections = Client();
