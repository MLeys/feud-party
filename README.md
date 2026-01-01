Below is your **updated README**, rewritten to **preserve your structure and tone** while accurately reflecting the **current system** (phone buzzers, host override/apply, UX changes, server-authoritative flow).

You can replace your existing README with this verbatim.

---

````md
# Feud Party (LAN) — Family Feud-Style Game

A modern, local-network (LAN) **Family Feud–style party game** designed for a real living-room setup:

- **TV Board** (`/board`) — large, show-style display (view-only)
- **Host Console** (`/host`) — PIN-gated control panel (laptop recommended)
- **Player Buzzers** (`/buzz`) — phones buzz in for face-offs and steals
- **2 teams**, classic flow: **Face-off → Play → 3 Strikes → Steal → Score**

All devices run in a browser and must be on the **same Wi-Fi network**.

---

## Architecture Overview

This repo is an **npm workspaces monorepo**:

- `client/` — React + Vite (TypeScript)
  - Board UI
  - Host Console UI
  - Phone Buzzer UI
- `server/` — Node + Express + Socket.IO (TypeScript)
  - Authoritative game state
  - Host authentication (PIN)
  - Buzzer lockout logic
- `shared/` — Game engine (TypeScript)
  - Shared types
  - Reducer (single source of truth)

> **Important:**  
> `client` and `server` depend on `shared` via `file:../shared` (not `workspace:*`) due to npm workspace protocol issues in this environment.  
> This is expected and **working correctly**.

---

## Routes / Quick Links

### Development (Vite + dev server)
- TV Board: `http://<LAPTOP_IP>:5173/board`
- Host Console: `http://<LAPTOP_IP>:5173/host`
- Player Buzzers: `http://<LAPTOP_IP>:5173/buzz`
- Server (Socket.IO): `http://<LAPTOP_IP>:3000`

### Production (single server on port 3000)
- TV Board: `http://<LAPTOP_IP>:3000/board`
- Host Console: `http://<LAPTOP_IP>:3000/host`
- Player Buzzers: `http://<LAPTOP_IP>:3000/buzz`

---

## Requirements

- macOS (instructions assume macOS)
- Node.js + npm
- All devices (TV, laptop, phones) on the **same Wi-Fi network**
- TV browser with decent JS support (Chromecast, Fire TV, Roku browser, or HDMI laptop)

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

```bash
npm run dev:server
```

Expected output includes:

* `Server running on http://localhost:3000`
* `Host PIN (also shown on /board): ####`

Leave this running.

---

### Terminal 2 — Start client

```bash
npm run dev:client
```

Expected output includes a Vite URL such as:

* `http://localhost:5173`
* `http://192.168.1.25:5173` ← **use this one for LAN**

---

## Find Your Laptop IP Address (LAN)

On macOS:

1. **System Settings → Network → Wi-Fi**
2. Click **Details**
3. Copy the **IP Address** (example: `192.168.1.25`)

Use this IP on the TV and all phones.

---

## Open the Game (LAN)

### 1) TV / Big Screen — Board

On the TV browser (or laptop connected to TV):

```
http://<LAPTOP_IP>:5173/board
```

You should see:

* The game board UI
* A **4-digit Host PIN** (top-right)

---

### 2) Host — Host Console

On the host’s **laptop (recommended)** or phone:

```
http://<LAPTOP_IP>:5173/host
```

Enter the PIN shown on the board.
Once authenticated, all host controls unlock.

---

### 3) Players — Phone Buzzers

On **each player’s phone**:

```
http://<LAPTOP_IP>:5173/buzz
```

Each player:

* Chooses **Team A** or **Team B**
* Uses the **BUZZ** button when the host opens it

---

## How to Play (Host-Driven Flow)

### A) Start the Game (Setup)

On the Host Console:

1. Edit **Team A** and **Team B** names (optional)
2. Choose:

   * **Start (3 rounds)** — quick game
   * **Start (5 rounds)** — classic game

Board transitions to **Face-Off**.

---

### B) Face-Off (with Phone Buzzers)

**Recommended flow (best practice):**

1. Host clicks **Open Buzz (Face-off)**
2. Phones buzz in
3. **First buzz wins** (server-locked, fair)
4. Board shows winning team
5. Host clicks **Apply Winner to Game**

Result:

* `controlTeam` and `activeTeam` set
* Phase moves to **PLAY**

> Manual face-off buttons still exist as a fallback.

---

### C) Play Phase

As teams call out guesses verbally:

* **Correct guess**

  * Host clicks the matching **Reveal** button
  * Answer flips on the board
  * Points add to the **round bank**
* **Wrong guess**

  * Host clicks **Add Strike**
  * After max strikes → **STEAL**

#### Optional Mid-Round Buzz

At any point in PLAY, host may:

* Click **Open Buzz (Play)**
* First buzz locks
* Click **Apply Winner** to change `activeTeam`

---

### D) Steal Phase

The opposing team gets **one guess**.

* If correct:

  * Host taps the unrevealed answer
  * Stealing team wins **all round points**
* If incorrect:

  * Host clicks **Steal Failed**
  * Control team wins **all round points**

Scores update immediately.

---

### E) Next Round / End Game

* **Next Round** → advances to the next prompt
* Game ends automatically after selected round count
* Host may click **End Game** at any time to reset

---

## Phone Buzzer Rules (Important)

* Buzzing is **server-authoritative**
* Only the **first buzz** counts
* Host controls:

  * **Open Buzz**
  * **Reset Buzz**
  * **Override Winner (A/B)**
  * **Apply Winner to Game**
* Works for:

  * Face-Off
  * Mid-round Play

---

## Audio Controls (Host)

From the Host Console:

* **Mute / Unmute Board**
* **Volume slider (0–100%)**

> Audio hooks are already in place for future sound effects.

---

## Production Mode (Single Server on Port 3000)

Best for actual party night.

### Build everything

```bash
npm run build
```

### Start server

```bash
npm run start
```

Now use:

* Board: `http://<LAPTOP_IP>:3000/board`
* Host: `http://<LAPTOP_IP>:3000/host`
* Buzzers: `http://<LAPTOP_IP>:3000/buzz`

---

## Editing / Adding Questions (Survey Pack)

Questions live in:

```
server/src/pack.ts
```

Each round includes:

* `prompt`
* `answers[]` (4–8 typical)
* Optional `aliases[]` for future typed guesses

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

After editing:

1. Restart server (dev) **or**
2. Rebuild (`npm run build`) for production

---

## Troubleshooting

### Devices can’t connect

* Confirm all devices are on the **same Wi-Fi**
* Use laptop IP, not `localhost`
* Avoid guest networks with device isolation

### Board doesn’t update

* Ensure both server and client are running
* Refresh `/board` and `/host`
* Re-enter host PIN if needed

### TypeScript error: `Cannot find module '@feud/shared'`

```bash
npm run build -w shared
```

Then restart dev servers or reload VS Code TS server.

### React `useEffect` cleanup error

Cleanup must return `void`:

```ts
return () => {
  socket.off("state:sync", onSync);
};
```

---

## House Rules / Host Tips

* Let buzzers decide face-offs for fairness
* Use reveal timing to build suspense
* Override buzzes when needed — host is always in control
* Laptop host UI is recommended over mobile

---

## Planned Enhancements

* Sound effects (buzz, ding, strike)
* Typed guesses + alias matching
* Fast Money round
* Keyboard hotkeys for host
* Spectator widgets

---

## Optional: Party Night Checklist

* ✅ Test `/board`, `/host`, `/buzz` once before guests arrive
* ✅ Put laptop on charger
* ✅ Disable screen sleep on TV/laptop
* ✅ Keep host on laptop for fastest control

---

Feud Party is designed to feel like a **real game show**:
one screen, one host, everyone else plays on their phones.

Have fun.

```
```
