module.exports = {
  db: {
    host: "localhost",
    user: "",
    password: "",
    database: ""
  },
  redis: {
    host: "localhost",
    port: 6379,
    enable: false
  },
  jwt: {
    secret: "",
    algorithm: "HS256",
    expiresIn: "1h"
  },
  server: {
    httpPort: 8888,
    httpsPort: 8889,
    prefix: "/"
  }
};
