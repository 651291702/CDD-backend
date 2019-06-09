module.exports = {
  db: {
    host: "localhost",
    user: "",
    password: "",
    database: "cdd"
  },
  redis: {
    host: "localhost",
    port: 7890,
    db: 0,
    enable: false
  },
  env: {
    JWTKEY: ""
  },
  server: {
    httpPort: 8888,
    httpsPort: 8889,
    prefix: "/"
  }
};
