'use strict';

const BaseError = require('./base-error');

/**
 * 所请求的服务器遇到意外的情况并阻止其执行请求。
 * @class
 */
class InternalServerError extends BaseError {
  constructor(message, error) {
    super(500, 'Internal Server Error', message, error);
  }
}
module.exports = InternalServerError;
