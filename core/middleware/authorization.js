const jwtConfig = require("../../configure/config").jwt;
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { Unauthorized } = require("../../utils/exception");

const create = (data, res) => {
  let token = jwt.sign(data, jwtConfig.secret, {
    algorithm: jwtConfig.algorithm || "RS256",
    expiresIn: jwtConfig.expiresIn || "1h"
  });
  res.set("Authorization", `Bearer ${token}`);
};

const verify = () => {
  return [
    expressJwt({
      secret: jwtConfig.secret,
      requestProperty: "user"
    }).unless({
      path: ["/cdd/user/login", "/cdd/user/register", "/cdd/room"]
    }),
    (req, res, next) => {
      res.set("Authorization", req.headers.authorization || "");
      next();
    },
    (err, req, res, next) => {
      next(new Unauthorized(err.message, err));
    }
  ];
};

function test() {
  for (let i = 0; i < 4; i++) {
    let token = jwt.sign({ username: "cjj" + i }, jwtConfig.secret, {
      algorithm: jwtConfig.algorithm || "RS256",
      expiresIn: jwtConfig.expiresIn || "1h"
    });
    console.log("http://api.gajon.xyz:8888/cdd?" + token);
  }
}
test();

module.exports = {
  create,
  verify
};
