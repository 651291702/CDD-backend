const Model = require("../models");
const socketioJwt = require("socketio-jwt");
const jwtConfig = require("../../configure/config").jwt;

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
  let playerCardSet = [];
  let totalCards = [];
  let currentCardCount = 52;
  for (let i = 0; i < 52; i++)
    totalCards.push({
      number: parseInt(i / 4) + 1,
      type: CARD_TYPE[i % 4]
    });
  for (let i = 0; i < 4; i++) {
    let playerCard = [];
    for (let j = 0; j < 13; j++, currentCardCount--) {
      let index =
        parseInt(Math.random() * currentCardCount * 2) % currentCardCount;
      playerCard.push(totalCards.splice(index, 1)[0]);
    }
    playerCard.sort((left, right) => {
      if (left.number < right.number) return -1;
      if (left.number > right.number) return 1;
      if (left.type < right.type) return -1;
      return 0;
    });
    playerCardSet.push(playerCard);
  }
  return playerCardSet;
};

const cardExitInCardSet = (card, cardSet) => {
  for (let i = 0, length = cardSet.length; i < length; i++) {
    let originCard = cardSet[i];
    if (originCard.number === card.number && originCard.type === card.type)
      return i;
  }
  return -1;
};

const playerExitInPlayerSet = (player, playerSet) => {
  for (let i = 0, length = playerSet.length; i < length; i++) {
    let originPlayer = playerSet[i];
    if (originPlayer.username === player.username) return i;
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
    /**
     * Enter a Room
     * Create Room Or Enter a exit room
     */
    (async () => {
      let playerRoomNumber;
      let playerRoomInfo = {};
      let findRoomFlag = false;
      let reconnectFlag = false;
      let username = socket.decoded_token.username;
      let roomNumbers = await Model.Room.getRoomNumbers();
      // Enter a exit room( Tow situation: Reconnect  or  New Player)
      if (roomNumbers && roomNumbers.length > 0)
        for (let roomNumber of roomNumbers) {
          if (reconnectFlag) break;
          let singleRoomInfo = await Model.Room.getRoomInfo(roomNumber);
          let players = singleRoomInfo.players;
          if (players && players.length > 0) {
            // Judge Whether reconnect the game
            players.forEach(player => {
              if (player.username === username) {
                reconnectFlag = true;
                findRoomFlag = true;
                playerRoomInfo = singleRoomInfo;
                playerRoomNumber = playerRoomInfo.room_number;
                return;
              }
            });
            // Only when the player count is satisfied Beginning conditions
            // then toggle game status
            if (players.length < 4 && !reconnectFlag) {
              findRoomFlag = true;
              playerRoomNumber = singleRoomInfo.room_number;
              playerRoomInfo = Object.assign({}, singleRoomInfo);
              playerRoomInfo.players.push({ username, status: "Not Prepare" });
            }
          }
        }
      // Create a new Room
      if (!findRoomFlag) {
        playerRoomNumber = Math.random()
          .toString(10)
          .substr(2, 5);
        playerRoomInfo = {
          room_number: playerRoomNumber,
          players: [{ username, status: "Not Prepare" }],
          status: "WAITING",
          current: 0,
          precard: [],
          prePlayer: -1,
          rest_second: RoundTime
        };
      }
      socket.username = username;
      socket.roomNumber = playerRoomNumber;
      let playerCardSet;
      // Update Redis store and broadcast this Room all player include this socket
      await Model.Room.updateRoomInfo(playerRoomNumber, playerRoomInfo);
      socket.join(playerRoomNumber, async () => {
        console.log(socket.roomNumber + ": " +  socket.username + " enter ");
        if (reconnectFlag) {
          playerCardSet = await Model.Room.getAllPlayerCard(playerRoomNumber);
          broadCastSelfSocket(
            socket,
            playerRoomInfo,
            playerCardSet,
            "RECONNECT"
          );
        } else {
          io.to(playerRoomNumber).emit(
            "WAITING",
            JSON.stringify(playerRoomInfo)
          );
        }
      });
    })();

    /**
     * Cancle prepare
     */
    socket.on("Cancle Prepare", async () => {
      let preparePlayers;
      let playerRoomInfo;
      let playerRoomNumber = socket.roomNumber;
      if (!socket.prepare) return;
      playerRoomInfo = await Model.Room.getRoomInfo(playerRoomNumber);
      socket.prepare = false;
      preparePlayers = io.to(playerRoomNumber).prepare - 1;
      io.to(playerRoomNumber).prepare = preparePlayers;
      let index = playerExitInPlayerSet(socket, playerRoomInfo.players);
      playerRoomInfo.players[index].status = "Not Prepare";
      await Model.Room.updateRoomInfo(playerRoomNumber, playerRoomInfo);
      io.to(playerRoomNumber).emit("WAITING", JSON.stringify(playerRoomInfo));
    });

    /**
     * make prepare
     */
    socket.on("Prepare", async () => {
      let preparePlayers;
      let playerRoomInfo;
      let playerRoomNumber = socket.roomNumber;
      if (socket.prepare) return;

      playerRoomInfo = await Model.Room.getRoomInfo(playerRoomNumber);
      socket.prepare = true;
      preparePlayers = (io.to(playerRoomNumber).prepare || 0) + 1;
      let index = playerExitInPlayerSet(socket, playerRoomInfo.players);
      playerRoomInfo.players[index].status = "Prepare";
      io.to(playerRoomNumber).prepare = preparePlayers;
      console.log(playerRoomNumber, "has aleary prepare ", preparePlayers, " persons");
      if (preparePlayers === 4) playerRoomInfo.status = "PLAYING";
      await Model.Room.updateRoomInfo(playerRoomNumber, playerRoomInfo);
      io.to(playerRoomNumber).emit("WAITING", JSON.stringify(playerRoomInfo));
      if (preparePlayers !== 4) return;

      let playerCardSet = initCards();
      await Model.Room.updateAllPlayerCard(playerRoomNumber, playerCardSet);
      await broadCastCard(playerRoomInfo, playerCardSet);
      io.to(playerRoomNumber).timer = setInterval(async () => {
        let roomInfo = await Model.Room.getRoomInfo(playerRoomNumber);
        let { current, room_number, rest_second } = roomInfo;
        roomInfo.rest_second = rest_second - 1;
        if (roomInfo.rest_second === 0) {
          roomInfo.rest_second = RoundTime;
          roomInfo.current = (current + 1) % 4;
          broadCastCard(
            roomInfo,
            await Model.Room.getAllPlayerCard(room_number)
          );
        }
        await Model.Room.updateRoomInfo(room_number, roomInfo);
      }, 1000);
    });

    /**
     * Play game process
     */

    socket.on("Play Card", async cards => {
      // Reduce card to player
      cards = JSON.parse(cards);
      let roomInfo = await Model.Room.getRoomInfo(socket.roomNumber);
      let playerCardSet = await Model.Room.getAllPlayerCard(socket.roomNumber);
      let { current, room_number } = roomInfo;
      roomInfo.current = (current + 1) % 4;
      roomInfo.rest_second = RoundTime;
      if (roomInfo.players[current].username !== socket.username) return;
      if (cards.length > 0) {
        roomInfo.precard = cards;
        roomInfo.prePlayer = current;
      }
      await Model.Room.updateRoomInfo(room_number, roomInfo);
      if (cards.length > 0) {
        for (let card of cards) {
          let index = cardExitInCardSet(card, playerCardSet[current]);
          if (index >= 0) playerCardSet[current].splice(index, 1);
        }
        Model.Room.updateAllPlayerCard(room_number, playerCardSet);
      }
      await broadCastCard(roomInfo, playerCardSet);

      // Judge Game whether over
      // If over
      // 1. reset all socket prepare status
      // 2. reset roomInfo to original condition
      // 3. clear timer
      if (playerCardSet[current].length === 0) {
        roomInfo.players.forEach(item => {
          item.status = "Not Prepare";
        });
        roomInfo.status = "WAITING";
        (roomInfo.current = 0),
          (roomInfo.precard = []),
          (roomInfo.prePlayer = -1),
          (roomInfo.rest_second = RoundTime);
        Model.Room.updateRoomInfo(room_number, roomInfo);
        io.to(room_number).emit(
          "END",
          JSON.stringify(roomInfo),
          JSON.stringify(playerCardSet)
        );
        let timer = io.to(room_number).timer;
        if (timer) clearInterval(timer);
        io.to(room_number).prepare = 0;
        let clients = await getClientList(room_number);
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
      console.log(socket.username + " is leave the room");
      let playerRoomInfo = await Model.Room.getRoomInfo(socket.roomNumber);
      let clients = await getClientList(playerRoomInfo.room_number);
      if (playerRoomInfo.status === "WAITING") {
        let index = playerExitInPlayerSet(socket, playerRoomInfo.players);
        if (index >= 0) playerRoomInfo.players.splice(index, 1);
      }
      await Model.Room.updateRoomInfo(socket.roomNumber, playerRoomInfo);
      if (clients.length === 0) {
        let timer = io.to(playerRoomInfo.room_number).timer;
        if (timer) clearInterval(timer);
        await Model.Room.clearAllPlayer(playerRoomInfo.room_number);
      }
    });
  });
  /**
   * Broadcast all Player about their rest cards with different message
   */
  async function broadCastCard(playerRoomInfo, playerCardSet) {
    let { room_number } = playerRoomInfo;
    let clients = await getClientList(room_number);
    for (let clientId of clients) {
      let client = io.sockets.sockets[clientId];
      broadCastSelfSocket(client, playerRoomInfo, playerCardSet, "PLAYING");
    }
  }
  /**
   * BroadCost self socket
   */
  function broadCastSelfSocket(socket, playerRoomInfo, playerCardSet, event) {
    let { username, id } = socket;
    for (let i = 0; i < 4; i++)
      if(playerRoomInfo.players[i] && playerRoomInfo.players[i].username)
      if (username === playerRoomInfo.players[i].username)
        io.to(id).emit(
          event,
          JSON.stringify(playerRoomInfo),
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
