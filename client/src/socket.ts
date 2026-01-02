// feud-party/client/src/socket.ts
import { io } from "socket.io-client";

function getSocketUrl(): string | undefined {
  const host = window.location.hostname;
  const isViteDev = window.location.port === "5173";

  if (isViteDev) return `http://${host}:3000`;
  return undefined; // production = same origin
}

export const socket = io(getSocketUrl(), {
  transports: ["websocket", "polling"],
  autoConnect: true
});

// Always request a fresh snapshot after connect/reconnect
socket.on("connect", () => {
  socket.emit("state:request");
});

// Optional diagnostics
socket.on("connect_error", (err) => {
  console.error("[socket] connect_error:", err);
});

socket.on("disconnect", (reason) => {
  console.warn("[socket] disconnected:", reason);
});
