const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");
const requestErrorMiddleWare = require("../middleware/requestError");
const userAccount = require("./user");

router.use(authorization.verify());

// 登陆注册功能
router.post("/user/login", userAccount.login);
router.post("/user/register", userAccount.register);

router.use(requestErrorMiddleWare);

module.exports = router;
