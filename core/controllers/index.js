const express = require("express");
const router = express.Router();

router.use(function(err, req, res, next) {
  res
    .status(err.status)
    .json({ status: err.status, errmsg: err.message })
    .end();
});
