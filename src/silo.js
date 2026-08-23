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

  // The outer shell, as the circle it is. Built as thirty-six boxes it had the
  // same fault the walkway had — an axis-aligned box round a wide, thin slab is
  // far bigger than the slab — and it reached three metres inside the shell,
  // through the back wall of every home and into the bedrooms.
  colliders.addRing({ innerRadius: shellRadius, outerRadius: shellRadius + 1.4,
    minY: -1, maxY: shaftHeight + levelHeight * 2 });

  const levelY = (index) => index * levelHeight;
  const gallery = [];

  // Bay 0 is where the stair's landing arrives, on every level, because the
  // flight turns a full circle per storey. The railing opens there and only
  // its short returns are solid — an unbroken ring runs across the mouth of
  // the landing and the floor is then unreachable from the stairwell. Every
  // level goes through here, the secure unit at the top included, because it
  // used to have its own copy of this without the opening.
  // The walkway, its railing and the wall of front doors are circles, so they
  // are collided as circles. Built as one axis-aligned box per bay they were
  // metres wider than the geometry — a box around a slab that is wide along
  // the ring and thin through it is far bigger than the slab — and better than
  // a third of every walkway was solid to the player and invisible on screen.
  const doorGapHalf = doorHalf / (deckOuter - 0.30);
  const railGapHalf = landingHalf / wellRadius;

  function buildLevelRings(y, openBays) {
    // The walkway itself.
    colliders.addRing({ innerRadius: wellRadius, outerRadius: deckOuter,
      minY: y - 0.3, maxY: y + 0.02, climbable: true });
    // The railing over the well, open where the stair's landing arrives.
    colliders.addRing({ innerRadius: wellRadius - 0.1, outerRadius: wellRadius + 0.1,
      minY: y + 0.02, maxY: y + 1.15, gaps: [[0, railGapHalf]] });
    // The wall of front doors: solid, except at the doorways that stand open.
    // A shut door is simply not a gap.
    colliders.addRing({ innerRadius: deckOuter - 0.45, outerRadius: deckOuter - 0.15,
      minY: y, maxY: y + 2.24,
      gaps: openBays.map((bay) => [(bay * Math.PI * 2) / segments, doorGapHalf]) });
    // ...and solid all the way round above the door heads.
    colliders.addRing({ innerRadius: deckOuter - 0.45, outerRadius: deckOuter - 0.15,
      minY: y + 2.24, maxY: y + levelHeight });
  }

  // The homes behind that wall: their floor, their ceiling and the shell wall
  // at the back of them.
  function buildHomeRings(y) {
    colliders.addRing({ innerRadius: deckOuter, outerRadius: apartmentBack,
      minY: y - 0.3, maxY: y + 0.02, climbable: true });
    colliders.addRing({ innerRadius: deckOuter, outerRadius: apartmentBack,
      minY: y + levelHeight - 0.4, maxY: y + levelHeight });
    colliders.addRing({ innerRadius: apartmentBack - 0.3, outerRadius: apartmentBack + 0.3,
      minY: y, maxY: y + levelHeight });
  }

  // A wall running outward from the axis, added as several short boxes. One
  // box around the whole slab is axis-aligned, so a long slab at an angle
  // becomes a huge square; a run of short ones stays close to the wall.
  function addRadialWall(angle, r0, r1, halfWidth, minY, maxY, opts = {}) {
    const span = r1 - r0;
    const pieces = Math.max(1, Math.ceil(span / 0.9));
    const step = span / pieces;
    for (let i = 0; i < pieces; i++) {
      const mid = r0 + step * (i + 0.5);
      colliders.addBox(ringBox(angle, mid, halfWidth, step / 2, minY, maxY), opts);
    }
  }

  // ...and one running along the ring, split the same way for the same reason.
  function addArcWall(angle, radius, halfWidth, halfDepth, minY, maxY, opts = {}) {
    const pieces = Math.max(1, Math.ceil(halfWidth / 0.45));
    const step = (halfWidth * 2) / pieces;
    for (let i = 0; i < pieces; i++) {
      const offset = -halfWidth + step * (i + 0.5);
      colliders.addBox(ringBox(angle + offset / radius, radius, step / 2, halfDepth, minY, maxY), opts);
    }
  }

  // One bay on every level is an arched tunnel rather than a home: the silo's
  // landmark, facing the stair's landing across the well. It is the same
  // bearing on every level because the level ring is one mesh — the bay whose
  // facade is left out of it has to be in the same place each time — and a
  // landmark you can rely on is what makes a round building navigable.
  const TUNNEL_BAY = 9;
  const tunnelBay = () => TUNNEL_BAY;

  const doorwayAngle = (level, bay) => {
    // Which homes stand open. Deterministic, so a door you left open is open
    // when you come back, and roughly a third of the silo is welcoming.
    return ((level * 7 + bay * 5) % 3) === 0;
  };

  const openBaysFor = (level) => {
    const open = [];
    for (let bay = 0; bay < segments; bay++) {
      if (bay === TUNNEL_BAY) continue;   // the tunnel's bulkhead is shut
      if (doorwayAngle(level, bay)) open.push(bay);
    }
    return open;
  };

  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    place(assets.habLevel, scene, [0, y, 0], [0, 0, 0], 1, { world: 'silo', collide: false });
    buildLevelRings(y, openBaysFor(level));
    buildHomeRings(y);
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

  const homes = [];
  // Homes on the residential levels only; the top ring is the secure unit.
  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    for (let bay = 0; bay < segments; bay++) {
      const angle = (bay * Math.PI * 2) / segments;
      const open = doorwayAngle(level, bay);
      if (bay === TUNNEL_BAY) {
        // The tunnel carries its own wall, so the level ring's facade and the
        // home behind it both step aside for it. The bulkhead at the far end
        // is shut, so this opens no new space to walk into — the facade ring
        // stays solid across this bay.
        if (assets.habTunnel) {
          place(assets.habTunnel, scene,
            [Math.cos(angle) * (deckOuter - 0.30), y, Math.sin(angle) * (deckOuter - 0.30)],
            [0, -angle + Math.PI / 2, 0], 1, { world: 'silo', collide: false });
          const glow = new THREE.PointLight(0xffbe80, 20, 8, 2);
          glow.position.set(Math.cos(angle) * (deckOuter + 1.1), y + 2.2,
            Math.sin(angle) * (deckOuter + 1.1));
          glow.visible = false;
          scene.add(glow);
          allLights.push({ light: glow, base: 20, phase: level * 2.3, failing: false });
        }
        continue;
      }

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
        // A home is six and a half metres by ten with partitions in it. These
        // were tuned when it was one open room and left every flat a murky
        // brown box once it had rooms and a ceiling.
        for (const [depth, base] of [[2.2, 26], [5.0, 30], [8.4, 24]]) {
          const lamp = new THREE.PointLight(0xffc078, base, 12, 2);
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
        const across = (z, x0, x1) => addArcWall(
          angle + ((x0 + x1) / 2) / centre, centre + z, (x1 - x0) / 2, T, y, top);
        // A partition running back into the home, at local x, from z0 to z1.
        const along = (x, z0, z1) => addRadialWall(
          angle + x / centre, centre + z0, centre + z1, T, y, top);

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

      // The walls between one home and its neighbour. Radial rather than
      // circular, so they stay boxes — but split along their length, because a
      // box around a ten-metre slab lying at forty-five degrees is a
      // seven-metre square that fills the whole home.
      const boundary = ((bay + 0.5) * Math.PI * 2) / segments;
      addRadialWall(boundary, deckOuter, apartmentBack, 0.2, y, y + levelHeight);
    }
  }

  // --- The two ends of the shaft --------------------------------------------
  // Looking up and looking down both used to finish on a blank disc, which is
  // the most obviously unfinished thing in the silo. The head is a coffered
  // slab with a lit oculus in the middle of it; the floor is a stepped drain
  // around a bolted sump. Both give the shaft somewhere to end.
  const crownY = levelY(levels) + levelHeight;
  if (assets.habCrown) {
    place(assets.habCrown, scene, [0, crownY, 0], [0, 0, 0], 1, { world: 'silo', collide: false });
    colliders.addRing({ innerRadius: 0, outerRadius: wellRadius + 1.7,
      minY: crownY - 0.6, maxY: crownY + 1.2 });
    // The oculus reads as the light source, so there is one behind it.
    const oculus = new THREE.PointLight(0xf2e6cc, 210, 30, 1.7);
    oculus.position.set(0, crownY - 0.9, 0);
    scene.add(oculus);
  }
  if (assets.habSump) {
    place(assets.habSump, scene, [0, 0, 0], [0, 0, 0], 1, { world: 'silo', collide: false });
    colliders.addRing({ innerRadius: 0, outerRadius: wellRadius + 0.4,
      minY: -0.4, maxY: 0.02, climbable: true });
    // Two work lamps stand down there; they are what you see from six levels up.
    for (const angle of [1.9, 5.1]) {
      const lamp = new THREE.PointLight(0xdff0ff, 90, 22, 1.7);
      lamp.position.set(Math.cos(angle) * (wellRadius - 3.4), 1.72,
        Math.sin(angle) * (wellRadius - 3.4));
      scene.add(lamp);
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
  // Same rings as any other level, with no open doorways: up here the wall of
  // the secure unit is solid. This level used to carry its own copy of the
  // walkway collision, which is how it ended up without the railing opening
  // the landing needs.
  buildLevelRings(topY, []);
  for (let i = 0; i < segments; i++) {
    const angle = (i * Math.PI * 2) / segments;

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
  const stillBuilds = ['A', 'B', 'C', 'D', 'E', 'F']
    .map((k) => assets[`residentStill${k}`]).filter(Boolean);
  if (stillBuilds.length) {
    for (let level = 0; level < levels; level++) {
      const y = levelY(level);
      const count = 3 + ((level * 5) % 4);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + level * 0.83;
        const radius = wellRadius + 0.55 + ((i + level) % 3) * 0.5;
        const figure = place(stillBuilds[(level * 3 + i) % stillBuilds.length], scene,
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
  // Over how many metres a light ramps out as it nears the cull radius.
  const LIGHT_FADE_METRES = 4;
  for (let level = 0; level <= levels; level++) {
    const y = levelY(level) + levelHeight - 0.5;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + level * 0.5;
      const light = new THREE.PointLight(0xffd9a2, 40, 15, 2);
      light.position.set(Math.cos(angle) * (deckOuter - 2.2), y, Math.sin(angle) * (deckOuter - 2.2));
      light.visible = false;
      scene.add(light);
      const entry = { light, base: 40, phase: level * 1.3 + i, failing: (level * count + i) % 23 === 3 };
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
    // The visible count has to stay constant or every material in the scene
    // recompiles, so the set is still the nearest LIT_AT_ONCE. What changed is
    // that the last few fade down to nothing by the time they drop out: a
    // light switched off at full brightness as you walk is a flash, and the
    // whole silo appeared to flicker as you moved along a gallery.
    // Fade by distance, not by rank. A lamp two metres away that happens to
    // rank thirteenth is still a lamp two metres away; ranking it out dimmed
    // whole rooms. What matters is that a light is nearly out by the time it
    // reaches the cull radius, so switching it off is not a flash.
    const cutoff = _lightSort[LIT_AT_ONCE]
      ? Math.sqrt(_lightSort[LIT_AT_ONCE].score) : Infinity;
    for (let i = 0; i < _lightSort.length; i++) {
      const entry = _lightSort[i];
      entry.light.visible = i < LIT_AT_ONCE;
      entry.fade = i < LIT_AT_ONCE
        ? Math.min(1, Math.max(0, (cutoff - Math.sqrt(entry.score)) / LIGHT_FADE_METRES))
        : 0;
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
    // Reaching across a twenty-six metre well without washing it out. At 175
    // the far gallery fell to black; at 400 with a 1.35 falloff the whole silo
    // went to white paper.
    const fill = new THREE.PointLight(0xc7b49a, 230, 52, 1.55);
    fill.position.set(Math.cos(angle) * fillRadius,
      (shaftHeight / 5) * (i % 6) + levelHeight * 0.6,
      Math.sin(angle) * fillRadius);
    scene.add(fill);
  }

  // A single hard light at the very top of the well, so looking up reads as a
  // long way from the surface and looking down reads as a long way to fall.

  const crown = new THREE.SpotLight(0xe8dcc6, 1500, shaftHeight + 12, 0.5, 0.7, 2);
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
      // A failing lamp browns out rather than snapping to near-dark: at 0.15
      // it read as the whole level flashing rather than as one bad fitting.
      const stutter = strip.failing && Math.sin(elapsed * 12.3 + strip.phase) * Math.sin(elapsed * 2.9) > 0.82
        ? 0.55 : 1;
      strip.light.intensity = strip.base * hum * stutter * (strip.fade ?? 1);
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

  // Which bays stand open, per level, so a navigation check can visit the
  // rooms behind them rather than re-deriving the rule and drifting from it.
  const openBays = [];
  for (let level = 0; level < levels; level++) openBays.push(openBaysFor(level));

  return { spawn, update, walkable, secureDoor, securePosition, topY, shaftHeight, homes,
           openBays, tunnelBay: TUNNEL_BAY, apartmentMid,
           stairRadius, stairColumn, stairSteps, stairTurn, wellRadius, deckOuter,
           levelHeight, levels };
}
