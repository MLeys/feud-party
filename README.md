````md
# Feud Party (LAN) — Family Feud-Style Game

A local-network (LAN) Family Feud-style party game with:
- **TV Board** display (`/board`) — view-only for players
- **Host Console** (`/host`) — PIN-gated controls + answer key
- **2 teams**, classic round flow: **Face-off → Play → 3 strikes → Steal → Score**

This repo is an npm-workspaces monorepo:
- `client/` — React + Vite (TypeScript)
- `server/` — Node + Express + Socket.IO (TypeScript)
- `shared/` — game engine types + reducer (TypeScript)

> Important: `server` and `client` depend on the shared package via `file:../shared` (not `workspace:*`) due to an npm/workspace protocol issue in this environment. This is expected and working.

---

## Quick Links (Routes)

When running in **dev**:
- TV Board: `http://<LAPTOP_IP>:5173/board`
- Host Console: `http://<LAPTOP_IP>:5173/host`
- Server: `http://<LAPTOP_IP>:3000` (Socket.IO + production static serving)

When running in **production** (after build):
- TV Board: `http://<LAPTOP_IP>:3000/board`
- Host Console: `http://<LAPTOP_IP>:3000/host`

---

## Requirements

- macOS (instructions assume macOS)
- Node.js + npm installed
- All devices (TV + phones) on the **same Wi-Fi** network

---

## Install

From repo root:

```bash
npm install
````

Build the shared package (required at least once):

```bash
npm run build -w shared
```

---

## Run (Development)

You will use **two terminals**.

### Terminal 1 — Start server

From repo root:

```bash
npm run dev:server
```

Expected output includes:

* `Server running on http://localhost:3000`
* `Host PIN (also shown on /board): ####`

Leave this running.

### Terminal 2 — Start client

From repo root:

```bash
npm run dev:client
```

Expected output includes Vite address:

* `http://localhost:5173`

Leave this running.

---

## Find Your Laptop IP Address (for LAN)

On macOS:

1. **System Settings → Network → Wi-Fi**
2. Click **Details**
3. Copy the **IP Address** (example: `192.168.1.25`)

Use that IP on the TV and phones.

---

## Open the Game (LAN)

### 1) TV / Big Screen: open the Board

On your TV browser (or laptop connected to TV), open:

```
http://<LAPTOP_IP>:5173/board
```

You should see:

* The game board UI
* A **Host PIN** displayed (4 digits)

### 2) Host (Phone): open the Host Console

On the host phone browser (same Wi-Fi), open:

```
http://<LAPTOP_IP>:5173/host
```

Enter the PIN shown on the TV board.

After successful PIN entry, host controls unlock.

---

## Run the Game (How to Play)

### A) Start a game (Host)

On the Host Console:

1. Optionally edit **Team A** and **Team B** names
2. Click:

   * **Start (3 rounds)** (quick game)
   * **Start (5 rounds)** (classic game)

The TV board updates to Round 1.

---

### B) Round flow (Classic Family Feud)

#### 1) Face-Off

Host selects who wins control:

* Click **Face-off Winner: A** or **Face-off Winner: B**

This sets:

* `controlTeam` and `activeTeam` and moves to **PLAY**

#### 2) Play (Control team guesses)

As the team calls guesses out loud:

* If correct: host clicks **Reveal #1**, **Reveal #2**, etc.

  * The board reveals the tile
  * Points automatically add to the **round bank**
* If wrong: host clicks **Add Strike**

  * After 3 strikes, the game automatically transitions to **STEAL**

#### 3) Steal (Other team gets one guess)

The opposing team gets one chance:

* If they guess an unrevealed answer: click **Steal: Success**
* If they fail: click **Steal: Fail**

Result:

* If success: stealing team wins **all banked round points**
* If fail: control team wins **all banked round points**
* Score totals update on the board

#### 4) Next round

Host clicks **Next Round** to move to the next round prompt.

---

### C) End of Game

The game ends automatically after the selected round count.
Host can also click **End Game** at any time.

---

## Audio Controls (Host)

From the Host Console:

* **Mute Board / Unmute Board**
* **Volume slider (0–100%)**

The board reflects the audio state.

> Note: sound effects are scaffolded. If you later add audio files or WebAudio tones, the board’s “sound hook” is where event-based playback belongs.

---

## Production Mode (Single URL on Port 3000)

This mode is best for “party night” because the server hosts the built client.

### 1) Build everything

From repo root:

```bash
npm run build
```

### 2) Start server

From repo root:

```bash
npm run start
```

Now use:

* Board: `http://<LAPTOP_IP>:3000/board`
* Host: `http://<LAPTOP_IP>:3000/host`

---

## Editing / Adding Questions (Survey Pack)

Questions live in:

```
server/src/pack.ts
```

Each round has:

* `prompt`
* `answers[]` (typically 4–8)
* each answer has `text`, `points`, optional `aliases[]`

Example:

```ts
{
  id: "r99",
  prompt: "Name something people bring to the beach",
  answers: [
    { id: "r99a1", text: "Towel", points: 35, aliases: ["beach towel", "towels"] },
    { id: "r99a2", text: "Sunscreen", points: 25, aliases: ["sunblock", "spf"] }
  ]
}
```

After editing the pack:

1. Restart server (dev) or rebuild server (prod).
2. Refresh `/board` and `/host`.

---

## Troubleshooting

### 1) TV/phone can’t open the site

Checklist:

* TV and phones are on the **same Wi-Fi**
* Use laptop IP (example `192.168.x.x`), not `localhost`
* Some guest networks block device-to-device traffic (“client isolation”). Use a private/home Wi-Fi.

### 2) Host controls don’t affect the board

* Confirm server terminal is running (`npm run dev:server`)
* Confirm client terminal is running (`npm run dev:client`)
* Refresh `/board` and `/host`
* Re-enter PIN on `/host` if needed

### 3) TypeScript error: “Cannot find module '@feud/shared'”

Cause: shared package exports are in `shared/dist`, which must exist.

Fix:

```bash
npm run build -w shared
```

If VS Code still shows stale errors:

* Command Palette → **TypeScript: Restart TS Server**
* Or reload the window

### 4) React `useEffect` cleanup TypeScript error

If you see an error like:

> Argument of type '() => () => Socket...' is not assignable to EffectCallback

Fix your cleanup to return `void` (brace form):

```ts
return () => {
  socket.off("state:sync", onSync);
};
```

### 5) “workspace:*” install error

If you previously saw:

> Unsupported URL Type "workspace:": workspace:*

This repo currently uses `file:../shared` for stability.

---

## House Rules / Common Host Tips

* In Face-Off: you can decide winner manually until phone buzzers are implemented.
* Use **Reveal** buttons to control pacing and build suspense.
* You can “Force Start Steal” if you want to jump into steal early for a fun twist.

---

## Next Planned Upgrades (Optional)

* Proper sound effects (mp3/wav or WebAudio)
* Phone “buzzer” for face-off
* Team answer submission + auto-match via `aliases`
* Spectator mode and additional display widgets
* Round multipliers (double/triple)

```


If you want, I can also add a short “Party Night Checklist” section (TV setup, network setup, testing flow) and a “Known Issues” section once you confirm the current run works end-to-end.
```
