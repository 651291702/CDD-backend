const { client, cacheWrapper } = require("../../handlers/cachePromise");

//   roomInfo = {
//     room_number: Number,
//     players: Array,
//     status: String, "waiting", "ing"
//     current_player: 0
//   };

const updateRoomInfo = async (roomNumber, roomInfo) => {
  await cacheWrapper(
    client.hmset,
    "room",
    roomNumber,
    JSON.stringify(roomInfo),
    "EX",
    20 * 60
  );
};

const getRoomNumbers = async () => {
  return await cacheWrapper(client.hkeys, "room");
};

const getRoomInfo = async roomNumber => {
  return JSON.parse(await cacheWrapper(client.hget, "room", roomNumber));
};

const clearAllPlayer = async roomNumber => {
  let count1 = await cacheWrapper(client.hdel, "room", roomNumber);
  let count2 = await cacheWrapper(client.del, roomNumber);
  return (count1 && count2 && true) || false;
};

const updateAllPlayerCard = async (roomNumber, cards) => {
  await cacheWrapper(
    client.set,
    roomNumber,
    JSON.stringify(cards),
    "EX",
    20 * 60
  );
};

const getAllPlayerCard = async roomNumber => {
  return JSON.parse(await cacheWrapper(client.get, roomNumber));
};

module.exports = {
  updateRoomInfo,
  clearAllPlayer,
  getRoomInfo,
  getRoomNumbers,
  updateAllPlayerCard,
  getAllPlayerCard
};
