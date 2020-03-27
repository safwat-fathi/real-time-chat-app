/* requires
------------ */
// path - built in package in node
const path = require("path");
// express js
const express = require("express");
// http - built in package in node
const http = require("http");
// socket.io
const socketio = require("socket.io");
// helper function
const formatMsg = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");

// initialzing server with express
const app = express();
// using http to enable socket.io
const server = http.createServer(app);
// socket.io
const io = socketio(server);

const admin = "ChatCord admin";

// run when client (web browser) connects
io.on("connection", socket => {
  /* a brief about socket.io:
	- socket.emit -> sends the message to only the connected client.
	- io.emit -> sends the message to all connected clients.
	- socket.broadcast.emit -> sends the message to all connected clients but not the one emitted it.
	*/

  // user joins room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // fires an event as welcome message after connection
    socket.emit("message", formatMsg(admin, "Welcome to ChatCord app."));

    // broadcast an event when user connects to a room
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMsg(admin, `${user.username} has joined the chat.`)
      );

    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // listen to chat message
  socket.on("chatMsg", msg => {
    // get the current user
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMsg(user.username, msg));
  });

  // broadcast an event when user disconnects
  socket.on("disconnect", () => {
    // get user who left
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMsg(admin, `${user.username} has left the chat.`)
      );

      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`server up and running on port: ${PORT}`);
});
