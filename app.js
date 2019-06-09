#!/bin/node

const express = require("express");
const { server } = require("./config/config");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(server.prefix, require("./core/controllers/index"));

// const option = {
//   key: fs.readFileSync("./certificate/2_jzb.deeract.com.key"),
//   cert: fs.readFileSync("./certificate/1_jzb.deeract.com_bundle.crt")
// };

let httpServer = http.createServer(app).listen(server.httpPort, function() {
  console.log(
    "http is listening in http://localhost:%d",
    httpServer.address().port
  );
});

// let httpsServer = https.createServer(option, app).listen(server.httpsPort, function() {
//   console.log(
//     "https is listening in https://localhost:%d",
//     httpsServer.address().port
//   );
// });
