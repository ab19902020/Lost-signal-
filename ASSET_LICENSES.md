# Asset licences

Only assets with explicit redistribution terms are copied into this repository.

- **deer.glb / rabbit.glb** — source: `kunalkushwaha/vsim`; repository licence: MIT.
- **Zombie Apocalypse Kit models** — Quaternius; CC0 1.0.
- **Concrete / diamond-plate PBR textures** — ambientCG; CC0, mirrored by `rishipr/der-koloss-ce`.

## Supplied model packs

`public/assets/supplied/` also holds GLBs converted from model packs supplied by
the project owner. The FBX/OBJ sources are not committed; `tools/convert-supplied-packs.sh`
reproduces the GLBs from a local copy of them.

- **Main rugged character** — `main_character.glb`; supplied by the project
  owner. This replaces the earlier military protagonist. The runtime copy
  preserves its humanoid rig, all nine authored animations and PBR material,
  with geometry and textures optimised for real-time mobile rendering.
- **Town characters, Ford Escort, aircraft and road-end buildings** —
  `enemy_old_man_*.glb`, `ford_escort_rs_turbo.glb`, `raf_aircraft.glb` and
  `town_building_*.glb`; supplied by the project owner. The Ford runtime copy
  separates wheel and steering pivots from the fused scan and reduces its
  geometry/textures for mobile rendering while retaining the supplied PBR art.

- **Quaternius packs** — `adventurer.glb`, the twenty-five armoury weapons,
  `solar_array.glb` (Solar Panel Structure) and `dead_tree_0*.glb` (Dead Trees);
  CC0 1.0.
- **Post Apocalypse Pack** — `prop_*.glb` surface dressing and
  `german_shepherd.glb`; supplied by the project owner under the pack's own
  terms. Only the environment props and the working dog are used: the pack's
  human and zombie characters are deliberately left out.
- **FPS pack** — `akm.glb`, `mossberg_590a1.glb`, `glock_19.glb`,
  `combat_knife.glb` and `prop_truck.glb`; supplied by the project owner under
  the pack's own terms.
- **Survival Pack** — `survival_*.glb`, the infirmary's stores; supplied by the
  project owner under the pack's own terms.
- **Soldier** — `soldier.glb` by JToastie; supplied by the project owner under
  its own terms.

The game source in this repository does not grant any additional rights over third-party assets; each asset retains its own licence.
