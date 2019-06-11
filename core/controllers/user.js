const expressAsyncHandle = require("../../handlers/expressAsync");
const { BadRequest, Conflict } = require("../../modules/exception");
const authorization = require("../middleware/authorization");
const Models = require("../models");
const bcrypt = require("bcryptjs");

const checkParam = (req, res, next) => {
  let { username, password } = req.body;
  if (
    !username ||
    !password ||
    password.length < 5 ||
    password.length > 20 ||
    !password.match(/\S+/)
  )
    throw new BadRequest("账号或密码格式错误");
  next();
};

const login = [
  checkParam,
  expressAsyncHandle(async (req, res, next) => {
    let { username, password } = req.body;
    let results = await Models.User.getInfo(username);
    if (
      !results ||
      results.length === 0 ||
      !bcrypt.compareSync(password, results[0].password)
    )
      throw new Conflict("账号或密码有误");
    authorization.create({ username: results[0].username }, res);
    res.status(200).end();
  })
];

const register = [
  checkParam,
  expressAsyncHandle(async (req, res, next) => {
    let { username, password } = req.body;
    let rawUsers = await Models.User.getInfo(username);
    if (rawUsers && rawUsers.length > 0 && rawUsers[0].username === username)
      throw new Conflict("账号已存在");
    let passHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await Models.User.create(username, passHash);
    res.status(200).end();
  })
];

module.exports = {
  login,
  register
};
