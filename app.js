#!/bin/node

const express = require("express");
const { server } = require("./configure/config");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");

// HTTP Request Handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(server.prefix, require("./core/controllers"));

let httpServer = http.createServer(app).listen(server.httpPort, function() {
  console.log(
    `http is listening in http://localhost:${httpServer.address().port}${
      server.prefix
    },
    `
  );
});

// WebSocket Communication
let io = require("socket.io")(httpServer, {
  path: `${server.prefix}/room`
});
require("./core/controllers/play")(io);
