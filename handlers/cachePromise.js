const redis = require("redis");
const config = require("../configure/config");
const { InternalServerError } = require("../utils/exception");
const redisConfig = {
  ...config.redis
};
const client = redis.createClient(redisConfig);

const cacheWrapper = (fn, ...params) =>
  new Promise((resolve, reject) => {
    fn.call(client, ...params, (err, reply) => {
      if (err)
        reject(new InternalServerError("Redis statement execute failed", err));
      resolve(reply);
    });
  });

module.exports = {
  client,
  cacheWrapper
};
