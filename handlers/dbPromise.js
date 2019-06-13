const mysql = require("mysql");
const { InternalServerError } = require("../utils/exception");
const config = require("../configure/config");
let dbConfig = {
  ...config.db,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

module.exports = (sqlString, ...values) => {
  return new Promise((resolve, reject) => {
    pool.query(sqlString, ...values, (error, results, fields) => {
      if (error)
        reject(new InternalServerError("DB statement execute failed", error));
      resolve([results, fields] || []);
    });
  });
};
