// // src/services/socket.js
// // Single shared Socket.io instance — import this everywhere, not io()
// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001", {
//   autoConnect: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 2000,
// });

// export default socket;



// import { io } from "socket.io-client";

// const token = localStorage.getItem("cs_token");

// const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001", {
//   autoConnect: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 2000,
//   auth: { token },
// });

// // Allow re-authenticating after login
// export function reconnectWithToken(newToken) {
//   socket.auth = { token: newToken };
//   socket.disconnect().connect();
// }

// export default socket;


import { io } from "socket.io-client";

const token = localStorage.getItem("cs_token");

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001", {
  autoConnect: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  auth: { token },
  withCredentials: true,
});

export function reconnectWithToken(newToken) {
  socket.auth = { token: newToken };
  socket.disconnect().connect();
}

export default socket;

