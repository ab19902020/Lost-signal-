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
npm run qa:weapons                # the collection: fire, reload, recoil, gore
npm run qa:driving                # the car, the perimeter gate and the pad
npm run qa:tdz                    # dead-zone reads, as part of every build
npm run qa:boot                   # does the production build actually start
npm run qa:look                   # the surface across the day, with its numbers
npm run qa:sights                 # every weapon's aim pose, down its own sights
```

`qa:look` shoots the compound at dawn, noon, gold hour, dusk, night and under
cloud, and prints what the sky and the grade were set to for each frame. The
numbers are the useful half — a picture cannot tell you that the grade was
still damping toward its target and never arrived, and that is exactly the
fault they caught. It needs a build with the debug handle left in:

```
NODE_ENV=development npx vite build --mode development --outDir dist-look
npx vite preview --port 4175 --outDir dist-look
```

`qa:boot` is the only harness that walks in through the front door: a
production bundle, served by `vite preview`, with the welcome menu clicked the
way a player clicks it. Everything else boots a dev build through `__lsBoot()`,
which skips the menu — so a crash on the player's own path went out once
without a single check noticing. Build first, then `npm run preview` in one
shell and `npm run qa:boot` in another.

`qa:driving` fakes a controller by replacing `navigator.getGamepads` inside the
page — Chromium has no gamepad emulation and CDP does not expose one, and the
game reads nothing else, so a plain object with the standard mapping is a
DualSense as far as Shelter 47 is concerned.

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

Under software rendering (`--use-angle=swiftshader`, which is all a headless
container has) the boot alone — assets, three worlds, every shader — takes many
minutes before the first assertion runs. That is the harness working, not
hanging; give it a real timeout and leave it alone. Editing anything under
`src/` while a harness is running makes Vite reload the page underneath it and
the run dies with "Execution context was destroyed".

`simulate(frames, dt)` advances the world by a fixed timestep. Headless Chromium
does not run `requestAnimationFrame` on an idle page, so a test that waits on
wall-clock time will watch a frozen game; step the simulation instead. For the
same reason, `page.waitForFunction` needs an explicit `polling` interval — its
default polls on animation frames.
