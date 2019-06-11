const jwtConfig = require("../../config/config").jwt;
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { Unauthorized } = require("../../modules/exception");

const create = (data, res) => {
  let token = jwt.sign(data, jwtConfig.secret, {
    algorithm: jwtConfig.algorithm || "RS256",
    expiresIn: jwtConfig.expiresIn || "1h"
  });
  res.set("authorization", `Bearer ${token}`);
};

const verify = () => {
  return [
    expressJwt({
      secret: jwtConfig.secret,
      requestProperty: "user"
    }).unless({
      path: ["/user/login", "/user/register"]
    }),
    (err, req, res, next) => {
      next(new Unauthorized(err.message, err));
    }
  ];
};

module.exports = {
  create,
  verify
};
