// client/src/socket.ts
import { io } from "socket.io-client";

function getDevServerUrl(): string {
  // Preferred: explicit server URL (works across devices consistently)
  // Example: VITE_SERVER_URL="http://192.168.1.50:3000"
  const fromEnv = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  // Fallback: same host as client (fine for single-machine dev, risky on LAN)
  const host = window.location.hostname;
  return `http://${host}:3000`;
}

function getSocketUrl(): string | undefined {
  const isViteDev = window.location.port === "5173";
  if (isViteDev) return getDevServerUrl();
  return undefined; // production: same origin
}

export const socket = io(getSocketUrl(), {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

// Always request a fresh snapshot after connect/reconnect.
socket.on("connect", () => {
  socket.emit("state:request");
});
