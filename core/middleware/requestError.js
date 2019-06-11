module.exports = function(err, req, res, next) {
  if (err.error) console.log(err.error);
  res
    .status(err.statusCode)
    .json({
      type: err.name,
      msg: (err.isServer && "服务器开小差了") || err.message
    })
    .end();
};
