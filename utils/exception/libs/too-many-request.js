'use strict';

const BaseError = require('./base-error');

/**
 * 用户在给定的时间内发送了太多请求（“限制请求速率”）。
 * @class
 */
class ToManyRequest extends BaseError {
  constructor(message, error) {
    super(429, 'Too Many Request', message, error);
  }
}
module.exports = ToManyRequest;
