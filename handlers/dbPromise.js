const mysql = require("mysql");
const config = require("../configure/config");
const { InternalServerError } = require("../modules/exception");
let dbConfig = {
  ...config.db,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

const queryPromiseWrapper = (sqlString, ...values) => {
  return new Promise((resolve, reject) => {
    pool.query(sqlString, ...values, (error, results, fields) => {
      if (error) reject(error);
      resolve([results, fields]);
    });
  });
};

module.exports = async (sqlString, ...values) => {
  let [results, fields] = await queryPromiseWrapper(sqlString, ...values).catch(
    function(err) {
      throw new InternalServerError("DB statement execute failed", err);
    }
  );
  return [results, fields] || [];
};
