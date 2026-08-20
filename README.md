# LOST SIGNAL

Mobile-first Three.js survival prototype set in Shelter 47.

## Architecture

- Vite bundles Three.js and the loader stack.
- `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` is configured before any compressed wildlife model is loaded.
- Required runtime models live under `public/assets/` and are requested from the same origin as the game.
- GitHub Actions imports licensed source assets into this repository and builds the game.
- The bunker loads as the priority scene; the surface world, wildlife, infected, CCTV and weapon all use repository assets.

## Controls

### Mobile
- Left joystick: move
- Swipe right half: look
- USE: interact
- FIRE: fire rifle when equipped

### Desktop
- WASD: move
- Mouse: look
- E: interact
- Space: fire
- R: reload

## Asset licensing

See `ASSET_LICENSES.md` and `public/assets/licenses/` after the asset-import workflow completes.
