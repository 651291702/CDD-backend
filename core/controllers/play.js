const Model = require("../models");
const socketioJwt = require("socketio-jwt");
const jwtConfig = require("../../configure/config").jwt;
/**
 * Card Object
 * number 1 - 13
 * type  enum CARD_TYPE
 */
const CARD_TYPE = {
  0: "BLACK SPADE",
  1: "BLACK CLUB",
  2: "RED HEART",
  3: "RED DIAMOND"
};

/**
 * Randow to deliver card
 */
const initCards = () => {
  // firstHand: Find the index of player that have number 3 and type "RED DIAMOND"
  let firstHand = 0;
  let playerCardSet = [];
  let totalCards = [];
  // Random sort Array to 4 piece
  for (let i = 0; i < 52; i++)
    totalCards.push({
      number: parseInt(i / 4) + 1,
      type: CARD_TYPE[i % 4]
    });
  totalCards.sort(() => {
    let seed = Math.random();
    return seed > 0.5 ? 1 : -1;
  });
  for (let i = 0; i < 4; i++) {
    let groupCard = totalCards.splice(0, 13);
    groupCard.sort((left, right) => {
      if (left.number < right.number) return -1;
      if (left.number > right.number) return 1;
      if (left.type < right.type) return -1;
      return 0;
    });
    playerCardSet.push(groupCard);

    for (let card of groupCard)
      if (card.number === 3 && card.type === "RED DIAMOND") firstHand = i;
  }
  return [playerCardSet, firstHand];
};

const cardExitInCardSet = (card, cardSet) => {
  for (let i = 0, length = cardSet.length; i < length; i++) {
    let originCard = cardSet[i];
    if (originCard.number === card.number && originCard.type === card.type)
      return i;
  }
  return -1;
};

const playerExitInPlayerSet = (socket, playerSet) => {
  for (let i = 0, length = playerSet.length; i < length; i++) {
    let originPlayer = playerSet[i];
    if (originPlayer.username === socket.username) return i;
  }
  return -1;
};

const RoundTime = 30;

module.exports = function(io) {
  /**
   * Verify Authorize before connect
   */
  io.use(
    socketioJwt.authorize({
      secret: jwtConfig.secret,
      handshake: true
    })
  );

  io.on("connection", async socket => {
    const username = socket.decoded_token.username;
    socket.username = username;
    let nowRoomNo = null;
    /**
     * Enter a Room
     * Create Room Or Enter a exit room
     */
    (async () => {
      let roomNo;
      let room = {};
      let findRoomFlag = false;
      let reconnectFlag = false;

      // Enter a exit room( Tow situation: Reconnect  or  New Player)
      let rooms = await Model.Room.getRoomNumbers();
      if (rooms && rooms.length > 0)
        for (let currentRoomNo of rooms) {
          if (reconnectFlag) break;
          let currentRoom = await Model.Room.getRoomInfo(currentRoomNo);
          let players = currentRoom.players;
          if (players && players.length > 0) {
            // Judge Whether reconnect the game
            players.forEach(player => {
              if (player.username === username) {
                reconnectFlag = true;
                findRoomFlag = true;
                room = currentRoom;
                roomNo = currentRoom.room_number;
                return;
              }
            });
            // Only when the player count is satisfied Beginning conditions
            // then toggle game status
            if (players.length < 4 && !reconnectFlag) {
              findRoomFlag = true;
              roomNo = currentRoom.room_number;
              room = Object.assign({}, currentRoom);
              room.players.push({ username, status: "Not Prepare" });
            }
          }
        }
      // Create a new Room
      if (!findRoomFlag) {
        roomNo = Math.random()
          .toString(10)
          .substr(2, 5);
        room = {
          room_number: roomNo,
          players: [{ username, status: "Not Prepare" }],
          status: "WAITING",
          current: -1,
          precard: [],
          prePlayer: -1,
          rest_second: RoundTime
        };
      }
      nowRoomNo = roomNo;
      // Update Redis store and broadcast this Room all player include this socket
      await Model.Room.updateRoomInfo(roomNo, room);
      socket.join(roomNo, async () => {
        console.log(nowRoomNo + ": " + username + " enter ");
        if (reconnectFlag) {
          let playerCardSet = await Model.Room.getAllPlayerCard(roomNo);
          broadCastSelfSocket(socket, room, playerCardSet, "RECONNECT");
        } else {
          io.to(roomNo).emit("WAITING", JSON.stringify(room));
        }
      });
    })();

    /**
     * Cancle prepare
     */
    socket.on("Cancle Prepare", async () => {
      let room;
      let roomNo = nowRoomNo;
      if (!socket.prepare) return;
      room = await Model.Room.getRoomInfo(roomNo);
      if (room.status === "PLAYING") return;
      socket.prepare = false;
      io.to(roomNo).prepare = io.to(roomNo).prepare - 1;
      let index = playerExitInPlayerSet(socket, room.players);
      room.players[index].status = "Not Prepare";
      await Model.Room.updateRoomInfo(roomNo, room);
      io.to(roomNo).emit("WAITING", JSON.stringify(room));
    });

    /**
     * make prepare
     */
    socket.on("Prepare", async () => {
      let prepareCount;
      let room;
      let roomNo = nowRoomNo;
      if (socket.prepare) return;
      room = await Model.Room.getRoomInfo(roomNo);
      if (room.status === "PLAYING") return;
      socket.prepare = true;
      prepareCount = (io.to(roomNo).prepare || 0) + 1;
      let index = playerExitInPlayerSet(socket, room.players);
      room.players[index].status = "Prepare";
      io.to(roomNo).prepare = prepareCount;
      console.log(roomNo, "has aleary prepare ", prepareCount, " persons");
      if (prepareCount !== 4) {
        io.to(roomNo).emit("WAITING", JSON.stringify(room));
        await Model.Room.updateRoomInfo(roomNo, room);
        return;
      }
      io.to(roomNo).emit("WAITING", JSON.stringify(room));
      let [playerCardSet, firstHand] = initCards();
      room.status = "PLAYING";
      room.current = firstHand;
      await Model.Room.updateRoomInfo(roomNo, room);
      await Model.Room.updateAllPlayerCard(roomNo, playerCardSet);
      await broadCastCard(room, playerCardSet);
      io.to(roomNo).timer = setInterval(async () => {
        let room = await Model.Room.getRoomInfo(roomNo);
        let { current, room_number, rest_second } = room;
        room.rest_second = rest_second - 1;
        if (room.rest_second === 0) {
          room.rest_second = RoundTime;
          room.current = (current + 1) % 4;
          broadCastCard(room, await Model.Room.getAllPlayerCard(room_number));
        }
        await Model.Room.updateRoomInfo(room_number, room);
      }, 1000);
    });

    /**
     * Play game process
     */

    socket.on("Play Card", async cards => {
      // Reduce card to player
      cards = JSON.parse(cards);
      let room = await Model.Room.getRoomInfo(nowRoomNo);
      let roomNo = nowRoomNo;
      let playerCardSet = await Model.Room.getAllPlayerCard(nowRoomNo);
      let { current } = room;
      room.current = (current + 1) % 4;
      room.rest_second = RoundTime;
      if (room.players[current].username !== username) return;
      if (cards.length > 0) {
        room.precard = cards;
        room.prePlayer = current;
      }
      await Model.Room.updateRoomInfo(roomNo, room);
      if (cards.length > 0) {
        for (let card of cards) {
          let index = cardExitInCardSet(card, playerCardSet[current]);
          if (index >= 0) playerCardSet[current].splice(index, 1);
        }
        Model.Room.updateAllPlayerCard(roomNo, playerCardSet);
      }
      await broadCastCard(room, playerCardSet);

      // Judge Game whether over
      // If over
      // 1. reset all socket prepare status
      // 2. reset room to original condition
      // 3. clear timer
      if (playerCardSet[current].length === 0) {
        room.players.forEach(item => {
          item.status = "Not Prepare";
        });
        room.status = "WAITING";
        room.current = 0;
        room.precard = [];
        room.prePlayer = -1;
        room.rest_second = RoundTime;
        Model.Room.updateRoomInfo(roomNo, room);
        io.to(roomNo).emit(
          "END",
          JSON.stringify(room),
          JSON.stringify(playerCardSet)
        );
        let timer = io.to(roomNo).timer;
        if (timer) clearInterval(timer);
        io.to(roomNo).prepare = 0;
        let clients = await getClientList(roomNo);
        for (let clientId of clients) {
          let client = io.sockets.sockets[clientId];
          client.prepare = false;
        }
      }
    });

    /**
     * clean room in redis and clearInteval timer
     */
    socket.on("disconnect", async () => {
      console.log(username + " is leave the room");
      let room = await Model.Room.getRoomInfo(nowRoomNo);
      let clients = await getClientList(nowRoomNo);
      if (room.status === "WAITING") {
        let index = playerExitInPlayerSet(socket, room.players);
        let userInfo;
        if (index >= 0) userInfo = room.players.splice(index, 1);
        if (userInfo[0].status === "Prepare") io.to(room).prepare--;
        io.to(nowRoomNo).emit("WAITING", JSON.stringify(room));
      }
      await Model.Room.updateRoomInfo(nowRoomNo, room);
      if (clients.length === 0) {
        let timer = io.to(nowRoomNo).timer;
        if (timer) clearInterval(timer);
        io.to(nowRoomNo).prepare = 0;
        await Model.Room.clearAllPlayer(nowRoomNo);
      }
    });
  });
  /**
   * Broadcast all Player about their rest cards with different message
   */
  async function broadCastCard(room, playerCardSet) {
    let { room_number } = room;
    let clients = await getClientList(room_number);
    for (let clientId of clients) {
      let client = io.sockets.sockets[clientId];
      broadCastSelfSocket(client, room, playerCardSet, "PLAYING");
    }
  }
  /**
   * BroadCost self socket
   */
  function broadCastSelfSocket(socket, room, playerCardSet, event) {
    let { username, id } = socket;
    for (let i = 0; i < 4; i++)
      if (room.players[i] && room.players[i].username)
        if (username === room.players[i].username)
          io.to(id).emit(
            event,
            JSON.stringify(room),
            JSON.stringify(playerCardSet[i])
          );
  }

  function getClientList(roomNumber) {
    return new Promise((resolve, reject) => {
      io.in(roomNumber).clients((err, clients) => {
        if (err) reject(err);
        else resolve(clients);
      });
    });
  }
};
