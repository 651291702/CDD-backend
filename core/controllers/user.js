const expressAsyncHandle = require("../../handlers/expressAsync");
const { BadRequest, Conflict } = require("../../utils/exception");
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

/**
 *
 * @api {POST} /user/login login
 * @apiName login
 * @apiGroup User
 * @apiParam  {String} username
 * @apiParam  {String} password the length should between 5 to 20
 * @apiUse User
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *    {
 *      ...User
 *    }
 */

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
    res.status(200).json({
      username
    });
  })
];

/**
 *
 * @api {POST} /user/register Register
 * @apiName register
 * @apiGroup User
 * @apiParam  {String} username
 * @apiParam  {String} password the length should between 5 to 20
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *
 */

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
