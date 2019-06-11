'use strict';

const BaseError = require('./base-error');

/**
 * 未找到对象
 * @class
 */
class NotFound extends BaseError {
  constructor(message, error) {
    super(400, 'Not Found', message, error);
  }
}

module.exports = NotFound;
