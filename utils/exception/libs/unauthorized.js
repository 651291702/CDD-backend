'use strict';

const BaseError = require('./base-error');

/**
 * 当前请求需要用户验证。
 * @class
 */
class Unauthorized extends BaseError {
  constructor(message, error) {
    super(401, 'Unauthorized', message, error);
  }
}

module.exports = Unauthorized;
