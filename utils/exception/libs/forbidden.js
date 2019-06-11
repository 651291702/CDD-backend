'use strict';

const BaseError = require('./base-error');

/**
 * 服务器已经理解请求，但是拒绝执行它。这个请求也不应该被重复提交。
 * @class
 */
class Forbidden extends BaseError {
  constructor(message, error) {
    super(403, 'Forbidden', message, error);
  }
}

module.exports = Forbidden;
