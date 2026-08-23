import * as THREE from 'three';
import { dressPerson } from './creatures.js';

// Silo 47 — a habitation silo, not a weapons one.
//
// Seven residential levels and a secure unit on top, stacked around an open
// light well with a spiral stair running down it. Three hundred people live
// here. Nobody in the silo knows why the world above ended.
//
// Every level is one unbroken circular walkway, six and a half metres wide,
// with nothing standing on it — you can walk the whole ring without stepping
// round anything — and its outer wall is nothing but front doors.
//
// The Blender kit is one level ring, one stair flight and one shell, joined
// into single meshes and instanced up the shaft — eight galleries built from
// two hundred separate objects each would be thousands of draw calls. What is
// authored here is collision and light: a joined ring's bounding box would fill
// the whole level including the open well, so decks are per-bay boxes with a
// real hole in the middle, and the stair gets one box per tread.

export const SILO = {
  shellRadius: 30.8,    // the concrete shell, behind the back wall of the homes
  wellRadius: 13.0,     // the open shaft the walkways look down into
  deckOuter: 19.6,      // 6.6 m of clear walkway, all the way round
  levelHeight: 4.0,
  levels: 7,
  segments: 18,         // homes per level: 126 in all
  stairRadius: 5.4,
  stairColumn: 1.2,     // a slim service core, not a drum filling the well
  stairSteps: 36,
  stairTurn: Math.PI * 2,   // a full turn per level, so the landings stack
  apartmentBack: 29.6,  // rear wall of every home: ten metres deep
  doorHalf: 0.62,
};

const box = (minX, minY, minZ, maxX, maxY, maxZ) =>
  new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));

// Conservative axis-aligned bounds for a slab standing at `distance` from the
// axis, rotated to face the centre.
function ringBox(angle, distance, halfWidth, halfDepth, minY, maxY) {
  const cx = Math.cos(angle) * distance;
  const cz = Math.sin(angle) * distance;
  const ex = Math.abs(Math.cos(angle)) * halfDepth + Math.abs(Math.sin(angle)) * halfWidth;
  const ez = Math.abs(Math.sin(angle)) * halfDepth + Math.abs(Math.cos(angle)) * halfWidth;
  return box(cx - ex, minY, cz - ez, cx + ex, maxY, cz + ez);
}

export function buildSilo({ scene, colliders, place, addInteraction, assets }) {
  if (!assets.habShell || !assets.habLevel || !assets.habStair) return null;

  const {
    shellRadius, wellRadius, deckOuter, levelHeight, levels, segments,
    stairRadius, stairColumn, stairSteps, stairTurn, apartmentBack, doorHalf,
  } = SILO;
  // A tread is deep in the radial direction and narrow along the helix. The
  // collision used to pass those the other way round, which made every tread a
  // five-metre slab lying across the shaft: the stair looked like a stair and
  // could not be climbed like one.
  const treadDepth = (stairRadius - stairColumn) / 2;      // radial half-extent
  const stairMid = stairColumn + treadDepth;
  const goingHalf = (stairTurn / stairSteps) * stairRadius / 2 * 1.06;
  const landingHalf = 1.8;
  // Matches the Blender stair: treads beside a landing at either end of a
  // flight have no outer balustrade, so both arrival and departure stay open.
  const landingSteps = Math.max(2,
    Math.round((landingHalf / stairRadius) / (stairTurn / stairSteps)) + 1);

  const shaftHeight = levels * levelHeight;
  // Each ring piece is a flat slab at its own radius, so each needs its own
  // arc width. One width for all of them leaves gaps at the outside.
  const arcHalf = (radius) => (Math.PI * radius / segments) * 1.06;
  const deckMid = (deckOuter + wellRadius) / 2;
  const deckHalf = (deckOuter - wellRadius) / 2;

  scene.background = new THREE.Color(0x0b0906);
  scene.fog = new THREE.FogExp2(0x171208, 0.0115);

  place(assets.habShell, scene, [0, 0, 0], [0, 0, 0], 1, { world: 'silo', collide: false });

  // Outer shell: an enclosure of flat panels rather than a rectangle.
  for (let i = 0; i < segments * 2; i++) {
    const angle = (i * Math.PI * 2) / (segments * 2);
    colliders.addBox(ringBox(angle, shellRadius + 0.6, arcHalf(shellRadius + 0.6) / 2 + 0.4, 0.8, -1, shaftHeight + levelHeight * 2), {});
  }

  const levelY = (index) => index * levelHeight;
  const gallery = [];

  // Bay 0 is where the stair's landing arrives, on every level, because the
  // flight turns a full circle per storey. The railing opens there and only
  // its short returns are solid — an unbroken ring runs across the mouth of
  // the landing and the floor is then unreachable from the stairwell. Every
  // level goes through here, the secure unit at the top included, because it
  // used to have its own copy of this without the opening.
  function galleryRail(i, angle, y) {
    if (i !== 0) {
      colliders.addBox(ringBox(angle, wellRadius, arcHalf(wellRadius), 0.1, y + 0.02, y + 1.15), {});
      return;
    }
    const rail = arcHalf(wellRadius);
    for (const side of [-1, 1]) {
      const centre = side * (landingHalf + (rail - landingHalf) / 2);
      colliders.addBox(ringBox(angle + centre / wellRadius, wellRadius,
        (rail - landingHalf) / 2, 0.1, y + 0.02, y + 1.15), {});
    }
  }

  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    place(assets.habLevel, scene, [0, y, 0], [0, 0, 0], 1, { world: 'silo', collide: false });

    for (let i = 0; i < segments; i++) {
      const angle = (i * Math.PI * 2) / segments;
      // Deck: walkable, with the light well left open through the middle.
      colliders.addBox(ringBox(angle, deckMid, arcHalf(deckOuter), deckHalf, y - 0.3, y + 0.02),
        { climbable: true });
      // The gallery railing over the well. The frontage is NOT sealed here:
      // the homes loop below authors it panel by panel around a real doorway,
      // and a solid ring across it walled every one of them shut.
      galleryRail(i, angle, y);
    }
    gallery.push({ level, y });
  }

  // The spiral stair, one flight per level, each rotated on from the last.
  for (let level = 0; level < levels; level++) {
    const base = levelY(level);
    const spin = level * stairTurn;
    place(assets.habStair, scene, [0, base, 0], [0, -spin, 0], 1, { world: 'silo', collide: false });

    const rise = levelHeight / stairSteps;
    for (let i = 0; i < stairSteps; i++) {
      const angle = spin + (i * stairTurn) / stairSteps;
      const top = base + i * rise + 0.09;
      colliders.addBox(ringBox(angle, stairMid, goingHalf, treadDepth, top - 0.55, top),
        { climbable: true });
      // The balustrade: without it you walk off the outer edge of the stair.
      // Open beside both landings. The first treads discharge onto the lower
      // floor; the last treads are where somebody on the upper floor enters
      // the descending flight. Opening only the foot made every level look
      // connected while a solid balustrade blocked the way down.
      if (i >= landingSteps && i < stairSteps - landingSteps) {
        colliders.addBox(ringBox(angle, stairRadius + 0.16, goingHalf, 0.18,
          top, top + 1.05), {});
      }
    }
    // The core the helix wraps is solid; the shaft around it stays open.
    colliders.addBox(box(-(stairColumn - 0.15), base, -(stairColumn - 0.15),
      stairColumn - 0.15, base + levelHeight, stairColumn - 0.15), {});
  }

  // --- Homes ---------------------------------------------------------------
  // Every door in the silo opens onto a home. The interiors are joined single
  // meshes, so two hundred and fifty of them cost draw calls rather than scene
  // graphs, and frustum culling means only the ones you are looking at are
  // drawn at all.
  // Every light in the silo goes on this list; only the nearest handful are
  // ever visible, so the shader's light count never changes.
  const allLights = [];
  const apartmentMid = (deckOuter + apartmentBack) / 2;
  const apartmentDepth = (apartmentBack - deckOuter) / 2;
  const doorwayAngle = (level, bay) => {
    // Which homes stand open. Deterministic, so a door you left open is open
    // when you come back, and roughly a third of the silo is welcoming.
    return ((level * 7 + bay * 5) % 3) === 0;
  };

  const homes = [];
  // Homes on the residential levels only; the top ring is the secure unit.
  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    for (let bay = 0; bay < segments; bay++) {
      const angle = (bay * Math.PI * 2) / segments;
      const open = doorwayAngle(level, bay);

      // The interior is only built where the door stands open. Behind a shut
      // door you can never see it, and a hundred and twenty-six furnished
      // rooms nobody can look into is a hundred and twenty-six draw calls
      // spent on nothing.
      if (assets.habApartment && open) {
        homes.push(place(assets.habApartment, scene,
          [Math.cos(angle) * apartmentMid, y, Math.sin(angle) * apartmentMid],
          [0, -angle + Math.PI / 2, 0], 1, { world: 'silo', collide: false }));
      }

      // A home that stands open has its lamp on, and the light falls out
      // across the gallery. That spill is what makes the wall read as
      // dwellings rather than as a painted facade.
      if (open) {
        // Two: the front room and the sleeping end. One lamp at the door left
        // eight metres of the home in the dark.
        // Up at the ceiling and much dimmer than they were. These were set
        // when a home was one open room and you were never near one; in a
        // four-metre bedroom an inverse-square light at head height is a
        // white-out.
        for (const [depth, base] of [[2.2, 15], [5.0, 17], [8.4, 14]]) {
          const lamp = new THREE.PointLight(0xffc078, base, 9, 2);
          lamp.position.set(Math.cos(angle) * (deckOuter + depth), y + 3.15,
            Math.sin(angle) * (deckOuter + depth));
          lamp.visible = false;
          scene.add(lamp);
          allLights.push({ light: lamp, base, phase: level * 1.7 + bay + depth, failing: false });
        }
      }

      // The door leaf: flat in the opening when shut, swung back into the home
      // when it stands open. Its origin is the hinge, so it is placed at the
      // jamb rather than at the middle of the opening.
      const doorOffset = 0;   // centred in the bay, lining up with the home behind it
      const hinge = doorOffset - doorHalf + 0.04;
      const dx = Math.cos(angle) * (deckOuter - 0.28) + Math.sin(angle) * hinge;
      const dz = Math.sin(angle) * (deckOuter - 0.28) - Math.cos(angle) * hinge;
      if (assets.habDoor) {
        place(assets.habDoor, scene, [dx, y, dz],
          [0, -angle + Math.PI / 2 - (open ? 1.85 : 0), 0], 1, { world: 'silo', collide: false });
      }

      // The partitions inside the home, so the rooms are rooms rather than a
      // drawing of rooms. Only for homes that are actually built — behind a
      // shut door there is no interior to walk into. These numbers are the
      // room plan from blender/generate_habitat_v4.py: keep them in step.
      if (open && assets.habApartment) {
        const homeWidth = 2 * (Math.PI * deckOuter / segments) - 0.3;
        const halfW = homeWidth / 2;
        const halfD = (apartmentBack - deckOuter) / 2;
        const centre = (deckOuter + apartmentBack) / 2;
        const T = 0.10, DW = 0.48, WIDE = 0.85, top = y + levelHeight - 0.5;
        // A partition running across the width, at local z, between x0 and x1.
        const across = (z, x0, x1) => colliders.addBox(
          ringBox(angle + ((x0 + x1) / 2) / centre, centre + z,
            (x1 - x0) / 2, T, y, top), {});
        // A partition running back into the home, at local x, from z0 to z1.
        const along = (x, z0, z1) => colliders.addBox(
          ringBox(angle + x / centre, centre + (z0 + z1) / 2, T, (z1 - z0) / 2, y, top), {});

        const HALL_BACK = -3.20, KITCHEN_X = -0.90, KITCHEN_BACK = -0.60, BED_FRONT = 1.60;
        const kitchenDoor = -2.05, livingGap = 1.95, bedA = -1.70, bedB = 1.70;
        across(HALL_BACK, -halfW, kitchenDoor - DW);
        across(HALL_BACK, kitchenDoor + DW, livingGap - WIDE);
        across(HALL_BACK, livingGap + WIDE, halfW);
        along(KITCHEN_X, HALL_BACK, KITCHEN_BACK);
        across(BED_FRONT, -halfW, bedA - DW);
        across(BED_FRONT, bedA + DW, bedB - DW);
        across(BED_FRONT, bedB + DW, halfW);
        along(0, BED_FRONT, halfD);
      }

      // The floor of the home itself. Without it the deck collision stopped at
      // the facade and walking through an open door dropped you down the silo.
      const homeMid = (deckOuter + apartmentBack) / 2;
      const homeHalf = (apartmentBack - deckOuter) / 2;
      colliders.addBox(ringBox(angle, homeMid, arcHalf(apartmentBack), homeHalf,
        y - 0.3, y + 0.02), { climbable: true });
      // ...and its ceiling, so an open door is not a way onto the roof.
      colliders.addBox(ringBox(angle, homeMid, arcHalf(apartmentBack), homeHalf,
        y + levelHeight - 0.4, y + levelHeight), {});

      // Home shell: side walls between neighbours, and the rear wall.
      const boundary = ((bay + 0.5) * Math.PI * 2) / segments;
      colliders.addBox(ringBox(boundary, apartmentMid, 0.2, apartmentDepth, y, y + levelHeight), {});
      colliders.addBox(ringBox(angle, apartmentBack, arcHalf(apartmentBack), 0.3, y, y + levelHeight), {});

      // Facade: a panel either side of the doorway, and a lintel over it. A
      // shut door fills the gap; an open one leaves it walkable. These match
      // the wall the Blender ring builds — 300 mm thick at deckOuter - 0.30,
      // with a 1.24 m clear opening between the jambs.
      const wallMid = deckOuter - 0.30;
      const reveal = doorHalf + 0.12;
      const panelHalf = (arcHalf(deckOuter - 0.15) - reveal) / 2;
      for (const side of [-1, 1]) {
        const offset = doorOffset + side * (reveal + panelHalf);
        colliders.addBox(ringBox(angle + offset / deckOuter, wallMid, panelHalf, 0.30,
          y, y + levelHeight), {});
      }
      colliders.addBox(ringBox(angle + doorOffset / deckOuter, wallMid, reveal, 0.30,
        y + 2.24, y + levelHeight), {});
      if (!open) {
        colliders.addBox(ringBox(angle + doorOffset / deckOuter, wallMid, doorHalf, 0.30,
          y, y + 2.24), {});
      }
    }
  }

  // A bridge from the stair to the gallery on every level: without one the
  // helix ends in mid-air and the galleries are unreachable.
  const landingSpan = (wellRadius + 0.3 - stairRadius) / 2;
  const landingMid = stairRadius + landingSpan;
  for (let level = 0; level <= levels; level++) {
    const y = levelY(level);
    // At the foot of that level's flight: the bottom tread stands at floor
    // height, so stepping off it puts you straight onto the landing.
    const angle = level * stairTurn;
    if (assets.habLanding) {
      place(assets.habLanding, scene,
        [Math.cos(angle) * landingMid, y, Math.sin(angle) * landingMid],
        [0, -angle + Math.PI / 2, 0], 1, { world: 'silo', collide: false });
    }
    colliders.addBox(ringBox(angle, landingMid, landingHalf, landingSpan, y - 0.3, y + 0.02),
      { climbable: true });
  }

  // --- Fittings -------------------------------------------------------------
  // Hydroponics and mess tables, spread so no two levels read the same.
  const dress = [];
  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    if (assets.habHydroponics && level % 3 === 1) {
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3 + level * 0.4;
        const radius = deckOuter - 2.6;
        const rack = place(assets.habHydroponics, scene,
          [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle + Math.PI / 2, 0], 1,
          { world: 'silo' });
        if (i === 0) {
          addInteraction(rack, `HYDROPONICS — LEVEL ${levels - level}`, 'silo',
            () => window.dispatchEvent(new CustomEvent('lostsignal:hydroponics', { detail: { level: levels - level } })));
        }
        dress.push(rack);
      }
    }
    if (assets.habCommons && level % 3 === 2) {
      for (let i = 0; i < 2; i++) {
        const angle = (i * Math.PI) + level * 0.7;
        const radius = deckOuter - 3.4;
        dress.push(place(assets.habCommons, scene,
          [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle, 0], 1,
          { world: 'silo' }));
      }
    }
    if (assets.habDirectory && level % 2 === 0) {
      const angle = level * 0.9;
      const radius = wellRadius + 1.1;
      place(assets.habDirectory, scene,
        [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle + Math.PI / 2, 0], 1,
        { world: 'silo', collide: false });
    }
  }

  // --- The secure unit ------------------------------------------------------
  // Top landing, above the residential levels. The CCTV console watches it.
  const topY = levelY(levels);
  place(assets.habLevel, scene, [0, topY, 0], [0, 0, 0], 1, { world: 'silo', collide: false });
  for (let i = 0; i < segments; i++) {
    const angle = (i * Math.PI * 2) / segments;
    colliders.addBox(ringBox(angle, deckMid, arcHalf(deckOuter), deckHalf, topY - 0.3, topY + 0.02),
      { climbable: true });
    colliders.addBox(ringBox(angle, deckOuter - 0.3, arcHalf(deckOuter - 0.3), 0.34, topY, topY + levelHeight), {});
    galleryRail(i, angle, topY);
    // The level ring carries a doorway in every bay. On the residential levels
    // a home stands behind each one; up here there is only the secure unit, so
    // the openings get shut doors rather than being left as holes onto nothing.
    if (assets.habDoor) {
      const hinge = -doorHalf + 0.04;
      place(assets.habDoor, scene,
        [Math.cos(angle) * (deckOuter - 0.28) + Math.sin(angle) * hinge, topY,
         Math.sin(angle) * (deckOuter - 0.28) - Math.cos(angle) * hinge],
        [0, -angle + Math.PI / 2, 0], 1, { world: 'silo', collide: false });
    }
  }

  const secureAngle = Math.PI * 0.25;
  const secureRadius = deckOuter - 0.9;
  const securePosition = new THREE.Vector3(
    Math.cos(secureAngle) * secureRadius, topY, Math.sin(secureAngle) * secureRadius);
  let secureDoor = null;
  if (assets.habSecureDoor) {
    secureDoor = place(assets.habSecureDoor, scene,
      [securePosition.x, topY, securePosition.z], [0, -secureAngle + Math.PI / 2, 0], 1,
      { world: 'silo', collide: false });
    addInteraction(secureDoor, 'SECURE UNIT — ENTRANCE', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:secureunit')));
  }

  // The way back up to the shelter, on the top landing.
  const shaftAngle = Math.PI * 1.25;
  const shaftPosition = new THREE.Vector3(
    Math.cos(shaftAngle) * (deckOuter - 1.0), topY, Math.sin(shaftAngle) * (deckOuter - 1.0));
  if (assets.accessControl) {
    const panel = place(assets.accessControl, scene,
      [shaftPosition.x, topY + 1.05, shaftPosition.z], [0, -shaftAngle + Math.PI / 2, 0], 0.75,
      { world: 'silo', collide: false });
    addInteraction(panel, 'ACCESS SHAFT — CLIMB TO SHELTER', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:ascend')));
  }

  const cache = assets.siloCache ? place(assets.siloCache, scene,
    [Math.cos(2.1) * (deckOuter - 2.2), 0, Math.sin(2.1) * (deckOuter - 2.2)], [0, -2.1, 0], 1,
    { world: 'silo' }) : null;
  if (cache) {
    addInteraction(cache, 'SILO STORES', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:cache')));
  }

  // The galleries have to look occupied. Ten residents walk and talk; these are
  // the rest of the three hundred, joined into one mesh each so a populated
  // silo costs draw calls rather than skeletons.
  const crowd = [];
  if (assets.residentStill) {
    for (let level = 0; level < levels; level++) {
      const y = levelY(level);
      const count = 3 + ((level * 5) % 4);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + level * 0.83;
        const radius = wellRadius + 0.55 + ((i + level) % 3) * 0.5;
        const figure = place(assets.residentStill, scene,
          [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
          [0, Math.atan2(-Math.cos(angle), -Math.sin(angle)) + (i % 2 ? 0.4 : -0.3), 0], 1,
          { world: 'silo', collide: false });
        dressPerson(figure, level * 5 + i);
        crowd.push(figure);
      }
    }
  }

  // --- Lighting -------------------------------------------------------------
  // A silo is lit level by level. Strip lights over the doors give each gallery
  // its own band of light, and the well between them stays dim, which is what
  // sells the drop.
  // Warm. The silo used to be lit with a blue sky light and a blue ambient,
  // which turned every wall in it cold grey-blue — the opposite of how the
  // living spaces are meant to read.
  scene.add(new THREE.HemisphereLight(0x9a8f7c, 0x1c1814, 1.25));
  scene.add(new THREE.AmbientLight(0x5f5648, 0.60));

  // A hemisphere light barely touches a vertical wall — its contribution is
  // driven by how much of the surface faces up — so the shaft's tall surfaces,
  // the stair's column above all, fell to black between point lights. Two
  // opposed directionals light every vertical face regardless of distance, at
  // the cost of two lights rather than one per level.
  for (const [dx, dz] of [[1, 0.35], [-1, -0.35]]) {
    const wash = new THREE.DirectionalLight(0xc6b49c, 0.42);
    wash.position.set(dx * 40, shaftHeight * 0.6, dz * 40);
    wash.target.position.set(0, shaftHeight * 0.35, 0);
    scene.add(wash, wash.target);
  }

  // Fifty-two point lights would be compiled into every shader in the scene.
  // They are all created, but only the nearest handful are ever visible, and
  // the visible count is held constant so the material shaders never recompile.
  const strips = [];
  const LIT_AT_ONCE = 14;
  for (let level = 0; level <= levels; level++) {
    const y = levelY(level) + levelHeight - 0.5;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + level * 0.5;
      const light = new THREE.PointLight(0xffd9a2, 40, 15, 2);
      light.position.set(Math.cos(angle) * (deckOuter - 2.2), y, Math.sin(angle) * (deckOuter - 2.2));
      light.visible = false;
      scene.add(light);
      const entry = { light, base: 40, phase: level * 1.3 + i, failing: (level * count + i) % 11 === 3 };
      strips.push(entry);
      allLights.push(entry);
    }
  }

  const _lightSort = [];
  function cullLights(playerPosition) {
    _lightSort.length = 0;
    for (const strip of allLights) {
      // Vertical distance dominates: the gallery you are on matters far more
      // than one seven levels down on the same bearing.
      const dy = strip.light.position.y - playerPosition.y;
      const dx = strip.light.position.x - playerPosition.x;
      const dz = strip.light.position.z - playerPosition.z;
      strip.score = dx * dx + dz * dz + dy * dy * 4;
      _lightSort.push(strip);
    }
    _lightSort.sort((a, b) => a.score - b.score);
    for (let i = 0; i < _lightSort.length; i++) {
      _lightSort[i].light.visible = i < LIT_AT_ONCE;
    }
  }

  // Culled lights leave the far side of the well black, which reads as a void
  // rather than as a silo. A ring of wide, always-on lights stands in the open
  // shaft between the stair and the galleries. They hang out here rather than
  // on the axis because a light inside the stair column lights everything
  // except the column, which is how the silo's spine came to be a black
  // cylinder. They are never culled, so the visible light count stays constant.
  const fillRadius = stairRadius + 2.4;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const fill = new THREE.PointLight(0xc7b49a, 210, 46, 1.5);
    fill.position.set(Math.cos(angle) * fillRadius,
      (shaftHeight / 5) * (i % 6) + levelHeight * 0.6,
      Math.sin(angle) * fillRadius);
    scene.add(fill);
  }

  // A single hard light at the very top of the well, so looking up reads as a
  // long way from the surface and looking down reads as a long way to fall.

  const crown = new THREE.SpotLight(0xe8dcc6, 2400, shaftHeight + 12, 0.5, 0.7, 2);
  crown.position.set(0, topY + levelHeight - 0.4, 0);
  crown.target.position.set(0, 0, 0);
  scene.add(crown, crown.target);

  const secureGlow = new THREE.PointLight(0xff6a4a, 12, 6, 2);
  secureGlow.position.copy(securePosition).setY(topY + 1.6);
  scene.add(secureGlow);

  // Dust in the well.
  const motes = 420;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(motes * 3);
  const speeds = new Float32Array(motes);
  for (let i = 0; i < motes; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (deckOuter - 0.5);
    positions[i * 3] = Math.cos(angle) * distance;
    positions[i * 3 + 1] = Math.random() * (shaftHeight + levelHeight);
    positions[i * 3 + 2] = Math.sin(angle) * distance;
    speeds[i] = 0.1 + Math.random() * 0.36;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xd2dad6, size: 0.03, transparent: true, opacity: 0.26, depthWrite: false,
  }));
  scene.add(dust);

  // The player arrives on the top landing, at the head of the stair.
  const spawn = new THREE.Vector3(
    Math.cos(shaftAngle) * (deckOuter - 2.6), topY + 0.06, Math.sin(shaftAngle) * (deckOuter - 2.6));

  // Where residents can walk: the mid-radius of each gallery.
  const walkable = [];
  for (let level = 0; level < levels; level++) {
    walkable.push({ y: levelY(level) + 0.02, radius: deckMid });
  }

  let elapsed = 0;
  function update(dt, playerPosition) {
    elapsed += dt;
    if (playerPosition) cullLights(playerPosition);
    for (const strip of allLights) {
      if (!strip.light.visible) continue;
      const hum = 1 + Math.sin(elapsed * 1.4 + strip.phase) * 0.035;
      const stutter = strip.failing && Math.sin(elapsed * 12.3 + strip.phase) * Math.sin(elapsed * 2.9) > 0.72
        ? 0.15 : 1;
      strip.light.intensity = strip.base * hum * stutter;
    }
    secureGlow.intensity = 10 + Math.sin(elapsed * 1.7) * 3;

    const array = geometry.attributes.position.array;
    const ceiling = shaftHeight + levelHeight;
    for (let i = 0; i < motes; i++) {
      array[i * 3 + 1] -= speeds[i] * dt;
      if (array[i * 3 + 1] < 0.1) array[i * 3 + 1] = ceiling;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { spawn, update, walkable, secureDoor, securePosition, topY, shaftHeight, homes,
           stairRadius, stairColumn, stairSteps, stairTurn, wellRadius, deckOuter,
           levelHeight, levels };
}
