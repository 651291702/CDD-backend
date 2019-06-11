const dbQueryPromise = require("../../handlers/dbPromise");

const create = async (username, password) => {
  let [data] = await dbQueryPromise("INSERT INTO user SET ?", {
    username,
    password
  });

  return data;
};

const getInfo = async username => {
  let [data] = await dbQueryPromise(
    "SELECT username, password FROM user WHERE username=?",
    username
  );
  return data;
};

module.exports = {
  create,
  getInfo
};
