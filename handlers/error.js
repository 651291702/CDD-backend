class DBError extends Error {
  // constructor(status, type, msg) {
  // super(msg);
  // this.status = status;
  // }
  constructor(error) {
    super(error);
    // this.message = error.message;
    // this.stack = error.stack;
    // this.name = error.name;
  }
}

module.exports = DBError;
