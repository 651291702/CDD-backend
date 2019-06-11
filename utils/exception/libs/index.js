'use strict';

module.exports = {
  BadRequest: require('./bad-request'),
  Unauthorized: require('./unauthorized'),
  Forbidden: require('./forbidden'),
  NotFound: require('./not-found'),
  Conflict: require('./conflict'),
  TooManyRequest: require('./too-many-request'),
  InternalServerError: require('./internal-server-error'),
  ThirdPartyError: require('./third-party-error'),
};
