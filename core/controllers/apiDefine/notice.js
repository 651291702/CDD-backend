/**
 * @apiDefine badReqeust
 * @apiError badReqeust 缺少参数、参数无效、不匹配等
 * @apiErrorExample {json} badReqeust
 * HTTP/1.1 400 badReqeust
 * {
 *    "type": "badReqeust",
 *    "msg": "错误消息",
 * }
 */

/**
 * @apiDefine unauthorized
 * @apiError unauthorized 登录
 * @apiErrorExample {json} unauthorized
 * HTTP/1.1 401 unauthorized
 * {
 *    "type": "unauthorized",
 *    "msg": "错误消息"
 * }
 */

/**
 * @apiDefine forbidden
 * @apiError forbidden 需要相应的权限
 * @apiErrorExample {json} forbidden
 * HTTP/1.1 403 forbidden
 * {
 *    "type": "forbidden",
 *    "msg": "需要权限"
 * }
 */

/**
 * @apiDefine objectNotFound
 * @apiError objectNotFound 对象不存在
 * @apiErrorExample {json} objectNotFound
 * HTTP/1.1 404 objectNotFound
 * {
 *    "type": "objectNotFound",
 *    "msg": "需要权限"
 * }
 */

/**
 * @apiDefine conflict
 * @apiError conflict 存在冲突
 * @apiErrorExample {json} conflict
 * HTTP/1.1 409 conflict
 * {
 *    "type": "conflict",
 *    "msg": "需要权限"
 * }
 */

/**
 * @apiDefine internal
 * @apiError internal 内部服务出错
 * @apiErrorExample {json} internal
 * HTTP/1.1 500 internal
 * {
 *    "type": "internal",
 *    "msg": "服务器开小差了"
 * }
 */

/**
 * @apiDefine serviceUnavailable
 * @apiError serviceUnavailable 外部服务出错
 * @apiErrorExample {json} serviceUnavailable
 * HTTP/1.1 503 serviceUnavailable
 * {
 *    "type": "serviceUnavailable",
 *    "msg": ""
 * }
 */

/**
 *
 * @api {*} * 通用错误格式
 * @apiName Error
 * @apiGroup 0
 *
 * @apiUse badReqeust
 * @apiUse unauthorized
 * @apiUse forbidden
 * @apiUse objectNotFound
 * @apiUse conflict
 * @apiUse internal
 * @apiUse serviceUnavailable
 *
 *
 */
