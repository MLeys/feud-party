// feud-party/server/src/index.ts
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import { createInitialState, reducer } from "@feud/shared";
import type { GameEvent, GameState } from "@feud/shared";
import { PACK_01 } from "./pack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generatePin(len = 4): string {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] }
});

const hostPin = generatePin(4);
let state: GameState = createInitialState({ hostPin, rounds: PACK_01, packId: "PACK_01" });

type SocketData = { isHost?: boolean };

function broadcastState() {
  io.emit("state:sync", state);
}

io.on("connection", (socket) => {
  // NOTE: client pages may not have listeners attached yet.
  // We still emit immediately (fine), but we ALSO support "state:request".
  socket.emit("state:sync", state);

  socket.on("state:request", () => {
    socket.emit("state:sync", state);
  });

  socket.on("host:auth", (payload: { pin: string }, cb?: (res: { ok: boolean }) => void) => {
    const ok = Boolean(payload && payload.pin === hostPin);
    (socket.data as SocketData).isHost = ok;
    if (cb) cb({ ok });
  });

  // ===== Phone buzzer (no host auth required) =====
  socket.on("buzz:press", (payload: { team: "A" | "B" }) => {
    const team = payload && payload.team ? payload.team : null;
    if (team !== "A" && team !== "B") return;

    if (!state.buzz.open || state.buzz.winnerTeam) return;

    state = reducer(state, { type: "BUZZ_LOCK", team, socketId: socket.id });
    broadcastState();
  });

  socket.on("game:event", (event: GameEvent, cb?: (res: { ok: boolean; error?: string }) => void) => {
    const isHost = Boolean((socket.data as SocketData).isHost);
    if (!isHost) {
      if (cb) cb({ ok: false, error: "Not authorized" });
      return;
    }

    try {
      state = reducer(state, event);
      broadcastState();
      if (cb) cb({ ok: true });
    } catch {
      if (cb) cb({ ok: false, error: "Reducer error" });
    }
  });
});

// Serve built client (production)
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Host PIN (also shown on /board): ${hostPin}`);
});
