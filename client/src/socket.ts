import { io } from "socket.io-client";

// Same-origin in dev (Vite proxy not needed because we use sockets to the same host).
// In dev: client runs on :5173, server on :3000. We will point directly to the server.
const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : "/";

export const socket = io(SERVER_URL, {
  transports: ["websocket"]
});
