// Two men in a car you can see into.
//
// The upload was a closed shell with the windows painted on, and the pair who
// steal it were simply hidden while they rode - so the car drove off with
// nobody in it, and there was nothing to shoot at through a windscreen that
// was not a windscreen.
//
// Both halves of that are geometry, and geometry is measurable. The glass has
// to exist, be transparent, and let a round through. The men have to be drawn,
// folded into a seated pose, and entirely inside the car - a hand through the
// door or a head through the roof is the failure this test exists to catch,
// and both of them happened on the way here.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(1200);

const result = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const V3 = ls.body.position.constructor;
  ls.world('outside');
  ls.simulate(1 / 60);
  const car = ls.game.vehicles[0];
  if (!car) return { error: 'no car in the world' };
  const agents = ls.game.townEnemies?.agents || [];
  if (agents.length < 2) return { error: 'no attackers in the world' };
  agents[0].role = 'driver';
  agents[1].role = 'passenger';
  for (const agent of agents) { agent.state = 'riding'; agent.collider.enabled = false; }
  // Out on the open road, away from the compound's props.
  car.state.x = -24.5; car.state.z = 72.8; car.state.heading = Math.PI - 0.42;
  for (let frame = 0; frame < 30; frame++) ls.simulate(1 / 60);

  const shell = car.root.getObjectByName('Car_Shell');
  const glass = car.root.getObjectByName('Car_Glass');
  const wheel = car.root.getObjectByName('Car_SteeringWheel');
  const body = ls.bounds(shell);
  // The body's own frame: measuring "is his hand inside the car" in world axes
  // is meaningless once the car is at an angle to them.
  const local = (point) => car.root.worldToLocal(point.clone());
  const box = { x: [-0.90, 0.86], y: [0.10, 1.40], z: [-2.05, 2.05] };
  const inside = (point) => {
    const p = local(point);
    return p.x > box.x[0] && p.x < box.x[1] && p.y > box.y[0] && p.y < box.y[1]
      && p.z > box.z[0] && p.z < box.z[1];
  };
  const bones = ['Head', 'Hip', 'L_Hand', 'R_Hand', 'L_Foot', 'R_Foot', 'L_Calf', 'R_Calf'];
  const wheelAt = wheel ? wheel.getWorldPosition(new V3()) : null;

  // Bones are cheap to check and they are not the thing anyone looks at. A
  // sleeve out through a door and a head out through a roof are both skin, and
  // both happened while every bone was comfortably inside the car. So this
  // walks the actual posed vertices - all ninety thousand of them, once.
  const skin = (agent) => {
    const point = new V3();
    const worst = { top: -Infinity, x: 0, z: 0 };
    agent.model.traverse((part) => {
      if (!part.isSkinnedMesh || !part.applyBoneTransform) return;
      const position = part.geometry.attributes.position;
      for (let index = 0; index < position.count; index++) {
        point.fromBufferAttribute(position, index);
        part.applyBoneTransform(index, point);
        part.localToWorld(point);
        car.root.worldToLocal(point);
        if (point.y > worst.top) worst.top = point.y;
        worst.x = Math.max(worst.x, Math.abs(point.x));
        worst.z = Math.max(worst.z, Math.abs(point.z));
      }
    });
    return { top: +worst.top.toFixed(3), x: +worst.x.toFixed(3), z: +worst.z.toFixed(3) };
  };

  return {
    glass: glass ? {
      triangles: glass.geometry.index ? glass.geometry.index.count / 3 : 0,
      transparent: !!glass.material.transparent,
      opacity: +(glass.material.opacity ?? 1).toFixed(2),
      depthWrite: !!glass.material.depthWrite,
      skipBallistics: !!glass.userData.skipBallistics,
    } : null,
    cabin: !!car.root.getObjectByName('Car_Cabin'),
    roof: +body.max.y.toFixed(2),
    // What the car actually has over its seats, which is not its own height.
    headroom: +car.headroom.toFixed(3),
    riders: agents.map((agent) => {
      const at = (name) => {
        const bone = agent.model.getObjectByName(name);
        return bone ? bone.getWorldPosition(new V3()) : null;
      };
      const outside = bones.filter((name) => { const p = at(name); return p && !inside(p); });
      const hip = at('Hip'); const head = at('Head'); const foot = at('L_Foot');
      const hand = at('R_Hand');
      return {
        name: agent.root.name, role: agent.role, drawn: agent.model.visible,
        crown: +(agent.root.position.y + agent.seatCrown()).toFixed(2),
        hip: +local(hip).y.toFixed(2),
        // Seated means the knee is up near the hip and the foot is well below
        // it. A standing man inside a car passes every bounding-box test.
        kneeAboveFoot: +(at('L_Calf').y - foot.y).toFixed(2),
        hipAboveKnee: +(hip.y - at('L_Calf').y).toFixed(2),
        // Distance to the rim, not the boss: a hand at the centre of a
        // steering wheel is not holding it either.
        toRim: wheelAt ? +Math.abs(hand.distanceTo(wheelAt) - 0.19).toFixed(2) : null,
        outside,
        skin: skin(agent),
      };
    }),
  };
});
await browser.close();
if (result.error) { console.error(result.error); process.exit(1); }
console.log(JSON.stringify(result, null, 1));

assert.ok(result.glass, 'the car has no Car_Glass; the glasshouse was never split off the shell');
assert.ok(result.glass.triangles > 150,
  `only ${result.glass.triangles} triangles of glass; the cut lost the glasshouse`);
assert.ok(result.glass.transparent && result.glass.opacity < 0.6,
  'the glass is not see-through');
assert.equal(result.glass.depthWrite, false,
  'the glass writes depth, so it hides whoever is sitting behind it');
assert.ok(result.glass.skipBallistics, 'rounds stop on the window instead of going through it');
assert.ok(result.cabin, 'the car has no interior, so the glass looks out the far side');

for (const rider of result.riders) {
  assert.ok(rider.drawn, `${rider.name} is not drawn while riding`);
  assert.deepEqual(rider.outside, [],
    `${rider.name} has ${rider.outside.join(', ')} outside the bodywork`);
  // Against the roof over the seats, not the top of the car. The Escort's
  // highest point is over the rear of its roof; above the front seats the roof
  // has already begun falling away, and the four and a half centimetres of
  // difference is exactly what two heads came through.
  assert.ok(rider.skin.top <= result.headroom + 0.03,
    `${rider.name}'s head comes through the roof: his highest vertex is at `
    + `${rider.skin.top} and there is ${result.headroom} m over the seat`);
  assert.ok(rider.skin.x < 0.90,
    `${rider.name} has skin ${rider.skin.x} m off the centreline, out through the door`);
  assert.ok(rider.skin.z < 2.05,
    `${rider.name} has skin ${rider.skin.z} m up the car, out through the screen`);
  assert.ok(rider.hipAboveKnee > -0.15 && rider.hipAboveKnee < 0.35,
    `${rider.name} is not folded at the hip (hip is ${rider.hipAboveKnee} m above the knee)`);
  assert.ok(rider.kneeAboveFoot > 0.12,
    `${rider.name}'s feet are not below his knees (${rider.kneeAboveFoot} m)`);
}
const driver = result.riders.find((rider) => rider.role === 'driver');
assert.ok(driver.toRim < 0.13,
  `the driver's hand is ${driver.toRim} m off the wheel rim; he is not holding it`);
console.log('Riders QA passed: the glasshouse is cut, see-through and shootable, and both '
  + 'men sit inside the car with the driver on the wheel.');
