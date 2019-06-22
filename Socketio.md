# SOCKET.IO API Documentation

### Server

**Listen event**

| Event            | Paramater |
| ---------------- | --------- |
| "Cancle Prepare" |           |
| "Prepare"        |           |
| "Play Card"      | [...Card] |

Card Object

| Key    | Type   | Description                                                                |
| ------ | ------ | -------------------------------------------------------------------------- |
| number | Number | format: 1 -  12                                                            |
| type   | String | emun: "BLACK SPADE" \|\| "BLACK CLUB" \|\| "RED HEART"  \|\| "RED DIAMOND" |

**Emit event**

| Event       | Paramater                      |
| ----------- | ------------------------------ |
| "WAITING"   | PlayerRoomInfo                 |
| "PLAYING"   | PlayerRoomInfo, PlayerCards    |
| "RECONNECT" | PlayerRoomInfo, PlayerCards    |
| "END"       | PlayerRoomInfo,  PlayerCardSet |

PlayerRoomInfo Object

| Key         | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| room_number | String | the length is 5                |
| players     | Array  | format: [...Player]            |
| status      | String | emun: "WAITING" \|\| "PLAYING" |
| current     | Number | emun: 0 - 3                    |
| precard     | Array  | format: [...Card]              |
| prePlayer   | Number | emun: 0 - 3                    |
| rest_second | Number | emun: 0 - 30                   |

Player Object

| Key      | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| username | String |                                    |
| status   | String | emun: "Not Prepare" \|\| "Prepare" |

PlayerCards Array

| Description | Sample                              |
| ----------- | ----------------------------------- |
| [...Card]   | [{number: 1, type: "BLACK SPADE" }] |

PlayerCardSet Array

| Description                           | Sample                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [...PlayerCards]  Total 4 PlayerCards | [[{number: 1, type: "BLACK SPADE" }],[{number: 1, type: "BLACK SPADE" }],[{number: 1, type: "BLACK SPADE" }],[{number: 1, type: "BLACK SPADE" }]] |



### Client

> **N·B：** 连接websocket时，需要加上`/cdd/room`, 并且带上登录等到的token（需要去掉Bearer)
>
> 具体用法见`core\controllers\public\index.html`

