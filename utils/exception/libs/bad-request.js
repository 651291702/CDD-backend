'use strict';

const BaseError = require('./base-error');

/**
 * 语法错误或参数错误，服务器无法理解该请求
 * @class
 */
class BadRequest extends BaseError {
  constructor(message, error) {
    super(400, 'Bad Request', message, error);
  }
}

module.exports = BadRequest;
