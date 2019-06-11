'use strict';

/**
 * @inner
 */
class AbstractError extends Error {
  constructor(statusCode, name, message, error) {
    super(message);
    /**
     * 是否为已知错误
     * @type {Boolean}
     */
    this.isknown = true;

    /**
     * 错误名字
     * @type {String}
     */
    this.name = name;

    /**
     * 错误状态码
     * @type {String}
     */
    this.statusCode = statusCode;

    /**
     * 错误是否为系统错误
     */
    this.isServer = this.statusCode > 500;

    /**
     * 错误信息
     * @type {String || JSON || Error}
     */
    this.error = error;
  }

  /**
     * 是否为服务端错误
     */
  to_json_string() {
    return JSON.stringify(this);
  }
}

module.exports = AbstractError;
