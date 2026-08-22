# LOST SIGNAL

Mobile-first Three.js survival prototype set in Shelter 47.

## Architecture

- Vite bundles Three.js and the loader stack.
- `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` is configured before any compressed wildlife model is loaded.
- Required runtime models live under `public/assets/` and are requested from the same origin as the game.
- GitHub Actions runs the Blender generators in `blender/` and commits the GLBs they produce.
- The bunker loads as the priority scene; the surface world, wildlife, infected, CCTV and weapon all use repository assets.

### Coordinates

The Blender generators author with **Y as the up axis** and export with
`export_yup=False`, so the GLBs arrive in exactly the orientation the Three.js
runtime expects. Each file carries an `LS_ORIENT_YUP` marker node; assets
without one predate this convention and the loader rotates them into place.

### Collision

Nothing is blocked by hand-typed rectangles. `place()` registers the world-space
bounds of each placed Blender object with a `ColliderSet`, and the player is a
capsule that slides along those boxes, falls under gravity and checks headroom
before standing up out of a crouch. Props above head height (ceiling pipes, wall
cameras) never block, because the test is a vertical span rather than a footprint.

## Controls

### Mobile
- Left joystick: move
- Swipe right half: look
- USE: interact
- FIRE: fire rifle when equipped

### Desktop
- WASD: move
- Shift: sprint (drains stamina; the frame desaturates as it empties)
- Ctrl or C: crouch
- Mouse: look
- E: interact
- Space: fire, and jump on the surface
- R: reload
- N: toggle infrared while a CCTV feed is open

## The shelter

Three connected spaces: the blast chamber, the surface compound above it and
Silo 47-A below. Life support drains against an in-game day — refuel the
generator, change the filters, and find food and water before they run out. An
open blast door draws the infected to the entrance and eventually inside, which
is what the CCTV console is for. The hatch in the floor needs unsealing, and
launch control needs two keys.

Press **H** in game for the field manual.

## Visual QA

Rendering bugs have to be looked at, so `qa/` drives the real game in headless
Chromium and saves what it draws. See `qa/README.md`.

## Asset licensing

See `ASSET_LICENSES.md` and `public/assets/licenses/` after the asset-import workflow completes.
