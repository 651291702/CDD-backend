'use strict';

const BaseError = require('./base-error');

/**
 * 表示服务器尚未处于可以接受请求的状态，在这里用来表第三方 api 调用错误
 * @class
 */
class ThirdPartyError extends BaseError {
  constructor(message, error) {
    super(503, 'Third Party API Error', message, error);
  }
}
module.exports = ThirdPartyError;
