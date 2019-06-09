const mysql = require("mysql");
const config = require("../config/config");
const DBError = require("./error");
let dbConfig = {
  ...config.db,
  connectionLimit: 10
};

function Wrapper() {
  console.log(dbConfig);
  const pool = mysql.createPool(dbConfig);
  pool.query("SELECT 1 + 1 AS solution", function(error, results, fields) {
    // if (error) throw error;

    if (error) throw new DBError(error);
    // console.log("The solution is: ", results[0].solution);
  });
}

Wrapper();
