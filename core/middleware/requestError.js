module.exports = function(err, req, res, next) {
  console.log(err);
  if (err.error) console.log(err.error);
  res
    .status(err.statusCode)
    .json({
      type: err.name,
      msg: (!err.isServer && err.message) || ""
    })
    .end();
};
