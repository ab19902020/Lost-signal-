# Visual QA harness

Lost Signal is a rendering project, so most of its bugs are things you have to
look at: an asset exported on its side, a light two orders of magnitude too
bright, a texture stretched across thirteen metres. These scripts drive the real
game in headless Chromium and save what it actually draws.

## Running

```
npm run dev                       # in one shell
npm run qa                        # every check, pass/fail (what CI runs)
npm run qa:game                   # screenshot the game as the player sees it
npm run qa:physics                # raw collision / crouch / texture readings
```

`npm run qa` fails the build on the regressions this project has actually
shipped: a player walking through a wall, a crouch that never stands back up,
a texture falling back to a 1x1 placeholder, a rifle that fires blanks, a
creature that snaps to a right angle instead of collapsing, and a blast door
left open with no consequence.

Both take the dev-server URL as their first argument, so they work against a
`vite preview` build too. Set `CHROMIUM_PATH` if Playwright's bundled browser is
not the one you want to use.

`qa/orient.html` renders any set of GLBs side by side against a ground grid,
which is how an asset shipped with the wrong up-axis becomes obvious:

```
http://127.0.0.1:5173/Lost-signal-/qa/orient.html?files=deer_v3.glb,bed.glb&view=front
```

`mode=fix` applies the legacy up-axis correction, `view` is `iso`, `front`,
`back` or `top`, and `size` sets the tile size in pixels.

## Driving the game from a test

`src/main.js` exposes `globalThis.__ls` on dev builds only (`import.meta.env.DEV`),
with `moveTo`, `look`, `world`, `openCam`, `freecam`, `boxes` and `simulate`.

`simulate(frames, dt)` advances the world by a fixed timestep. Headless Chromium
does not run `requestAnimationFrame` on an idle page, so a test that waits on
wall-clock time will watch a frozen game; step the simulation instead. For the
same reason, `page.waitForFunction` needs an explicit `polling` interval — its
default polls on animation frames.
