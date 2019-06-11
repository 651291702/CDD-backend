'use strict';

const BaseError = require('./base-error');

/**
 * 由于和被请求的资源的当前状态之间存在冲突，请求无法完成
 * @class
 */
class Conflict extends BaseError {
  constructor(message, error) {
    super(403, 'Conflict', message, error);
  }
}

module.exports = Conflict;
