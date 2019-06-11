module.exports = {
  db: {
    host: "localhost",
    user: "root",
    password: "",
    database: "cdd"
  },
  redis: {
    host: "localhost",
    port: 7890,
    db: 0,
    enable: false
  },
  jwt: {
    secret: "4zJBzGDbhFOu6iSdALLl",
    algorithm: "HS256",
    expiresIn: "1h"
  },
  server: {
    httpPort: 8888,
    httpsPort: 8889,
    prefix: "/"
  }
};
