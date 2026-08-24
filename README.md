# LOST SIGNAL

Mobile-first Three.js survival prototype set in Shelter 47.

## Architecture

- Vite bundles Three.js and the loader stack.
- `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` is configured before any compressed wildlife model is loaded.
- Required runtime models live under `public/assets/` and are requested from the same origin as the game.
- GitHub Actions runs the Blender generators in `blender/` and commits the GLBs they produce.
- The bunker loads as the priority scene; the surface, silo, CCTV, animated people, armoury and weapon all use repository assets.

### Coordinates

The Blender generators author with **Y as the up axis** and export with
`export_yup=False`, so the GLBs arrive in exactly the orientation the Three.js
runtime expects. Each file carries an `LS_ORIENT_YUP` marker node; assets
without one predate this convention and the loader rotates them into place. The
supplied Quaternius character and gun models are native Y-up glTF files and are
explicitly excluded from that legacy correction.

### Collision

Visible props register physical bounds with a `ColliderSet`, while the circular
silo uses exact rings, door arcs and oriented furniture boxes. The player is a
capsule that slides along those shapes, falls under gravity, jumps onto low
furniture and checks headroom before standing up. Characters also have solid
body collision instead of behaving like scenery the player can walk through.

## Controls

### Mobile
- Left joystick: move
- Swipe right half: look
- USE: interact
- JUMP: jump and climb onto low solid objects
- AIM: aim down the service-rifle sights
- FIRE / RELOAD: operate the rifle when equipped

### Desktop
- WASD: move
- Shift: sprint (drains stamina; the frame desaturates as it empties)
- Ctrl or C: crouch
- Mouse: look
- E: interact
- Space: jump
- Left mouse or F: fire
- Right mouse or Q: aim down sights
- R: reload
- N: toggle infrared while a CCTV feed is open

## The world

Three connected spaces: the blast chamber, the ruined surface compound above it,
and Silo 47 below — a habitation silo of seven residential levels and a secure
unit on top, built around an open light well, home to three hundred people.
Shelter 47 now has a full walk-in armoury with a working pocket door, an animated
quartermaster, 25 wall-mounted weapons and an issued 30-round service rifle.
Nobody below knows why the world above ended.

Life support in the shelter drains against an in-game day: refuel the generator,
change the filters, find food and water before they run out. The surface is dead
and empty. The hatch in the floor needs unsealing before the silo will let you
down, and the fifth CCTV feed watches the secure unit's entrance on the guarded
top landing.

Press **H** in game for the field manual.

## Visual QA

Rendering bugs have to be looked at, so `qa/` drives the real game in headless
Chromium and saves what it draws. See `qa/README.md`.

## Asset licensing

See `ASSET_LICENSES.md` and `public/assets/licenses/` after the asset-import workflow completes.
