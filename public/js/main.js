// ui elements
const $chatForm = document.querySelector("#chat-form");
const $chatMsgs = document.querySelector(".chat-messages");
const $roomName = document.querySelector("#room-name");
const $usersList = document.querySelector("#users");

// query string lib usage
// @ts-ignore
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// importing socket.io
// @ts-ignore
const socket = io();

// join chatroom event emitter
socket.emit("joinRoom", { username, room });

// get room and users info
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// handling message event from server
socket.on("message", msg => {
  // console.log(msg);
  outputMessage(msg);

  // scroll into view
  $chatMsgs.scrollTop = $chatMsgs.scrollHeight;
});

// message submit from chat form
$chatForm.addEventListener("submit", e => {
  e.preventDefault();

  // get message text
  // @ts-ignore
  const msg = e.target.elements.msg.value;

  // send the message via socket to server
  socket.emit("chatMsg", msg);
  // @ts-ignore
  e.target.elements.msg.value = "";
  // @ts-ignore
  e.target.elements.msg.focus();
});

// output message from server to dom
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
		<p class="meta">${msg.username} <span>${msg.time}</span></p>
		<p class="text">
			${msg.text}
		</p>
	`;
  $chatMsgs.appendChild(div);
}

// output room name from server to dom
function outputRoomName(room) {
  // @ts-ignore
  $roomName.innerText = room;
}

// output users list name from server to dom
function outputUsers(users) {
  $usersList.innerHTML = `
		${users.map(user => `<li>${user.username}</li>`).join("")}
	`;
}
