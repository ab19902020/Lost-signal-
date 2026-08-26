import * as THREE from 'three';

// Sky, sun, moon, stars and weather for the surface.
//
// The compound is in Berkshire, some years after the exchange, and the surface
// was a single fixed night with a flat black backdrop. This gives it a clock:
// the sun comes up, crosses, and goes down; the moon and the stars take over;
// cloud rolls in and it rains, then it clears. The world rule keeps built
// things in Blender — a sky is not a built thing. Like the rain and the dust
// motes it is atmosphere, and it costs one inverted sphere and two lights.

const TAU = Math.PI * 2;

// Where the sun sits at each stage of the day, as colours to mix between.
// Sampled at midnight, dawn, morning, noon, evening, dusk and back to midnight.
// Two colours, held apart. The key is never white — gold at noon, orange on
// the way down — and the fill is never grey: it is the sky, which out here is
// a hard cyan. Everything the sun touches goes amber and everything it does
// not goes blue, and the further those two are pushed the more the surface
// reads as somewhere the atmosphere is full of dust rather than somewhere
// slightly overcast. A neutral white key at noon is what made the compound
// look like a car park.
const SKY_STOPS = [
  //  t     zenith     horizon    sun/moon light   ambient sky  ambient ground
  [0.00, 0x04080f, 0x0a141c, 0x7fa6c8, 0x1d3550, 0x11140f],
  [0.22, 0x0b1826, 0x1c2c3a, 0x93b6cf, 0x2c4a66, 0x171a15],
  [0.27, 0x2a3358, 0xc25a1e, 0xff8f3c, 0x5d6a8a, 0x37241a],
  [0.34, 0x2f6ea6, 0xd8944a, 0xffc070, 0x6f9cc4, 0x5c3a20],
  [0.50, 0x1f74b4, 0xd8b083, 0xffe0a8, 0x74aad4, 0x7a5028],
  [0.68, 0x2a6ba4, 0xd98f4a, 0xffbe74, 0x6b9ac2, 0x6a4522],
  [0.76, 0x22304f, 0xc4571c, 0xff7a2e, 0x50607f, 0x33201a],
  [0.83, 0x0b1622, 0x18242f, 0x89aecc, 0x24405c, 0x141713],
  [1.00, 0x04080f, 0x0a141c, 0x7fa6c8, 0x1d3550, 0x11140f],
];

const _a = new THREE.Color();
const _b = new THREE.Color();

function sampleStops(t) {
  let index = 0;
  while (index < SKY_STOPS.length - 2 && SKY_STOPS[index + 1][0] <= t) index++;
  const from = SKY_STOPS[index];
  const to = SKY_STOPS[index + 1];
  const span = Math.max(1e-5, to[0] - from[0]);
  const k = THREE.MathUtils.clamp((t - from[0]) / span, 0, 1);
  const out = [];
  for (let channel = 1; channel < from.length; channel++) {
    _a.setHex(from[channel]);
    _b.setHex(to[channel]);
    out.push(_a.clone().lerp(_b, k));
  }
  return out;
}

const VERTEX = /* glsl */`
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */`
  uniform vec3 zenith;
  uniform vec3 horizon;
  uniform vec3 sunColor;
  uniform vec3 sunDirection;
  uniform vec3 moonDirection;
  uniform float sunAbove;
  uniform float starOpacity;
  uniform float cloud;
  varying vec3 vDirection;

  // A cheap stable hash, so the stars are in the same place every frame and
  // the same place every run.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vDirection);
    float up = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    // Band the gradient toward the horizon rather than spreading it evenly:
    // most of a sky's colour change happens in the bottom quarter of it.
    vec3 base = mix(horizon, zenith, pow(up, 0.62));

    // Stars: a sparse grid of points, brightest overhead, gone in daylight and
    // dimmed by cloud.
    float star = 0.0;
    if (starOpacity > 0.001) {
      vec3 cell = floor(dir * 220.0);
      float h = hash(cell);
      if (h > 0.9955) {
        vec3 centre = (cell + 0.5) / 220.0;
        float d = length(normalize(centre) - dir);
        star = smoothstep(0.0045, 0.0, d) * (0.35 + hash(cell + 3.3) * 0.65);
      }
      star *= starOpacity * smoothstep(-0.02, 0.35, dir.y);
    }

    // The sun: a disc with a wide warm bloom around it.
    float sunAngle = dot(dir, sunDirection);
    float sunDisc = smoothstep(0.99955, 0.99985, sunAngle);
    // Three terms: the tight corona, a broad flare, and a very wide scatter
    // that is the air itself full of dust. The last is what makes looking
    // toward the sun feel like looking through something.
    float sunGlow = pow(max(sunAngle, 0.0), 220.0) * 0.55
                  + pow(max(sunAngle, 0.0), 12.0) * 0.16
                  + pow(max(sunAngle, 0.0), 2.5) * 0.09;

    // The moon: smaller, colder, with a faint halo.
    float moonAngle = dot(dir, moonDirection);
    float moonDisc = smoothstep(0.99975, 0.99992, moonAngle);
    float moonGlow = pow(max(moonAngle, 0.0), 900.0) * 0.35;

    vec3 colour = base;
    colour += star;
    colour += sunColor * (sunGlow * (1.0 - cloud * 0.85));
    colour += sunColor * sunDisc * 2.6 * (1.0 - cloud * 0.9);
    colour += vec3(0.72, 0.79, 0.88) * (moonGlow + moonDisc * 1.5)
            * (1.0 - sunAbove) * (1.0 - cloud * 0.8);

    // Dust settles out of the air slowly, so it piles up along the horizon and
    // thins overhead. This is the band that puts the ground and the sky on
    // speaking terms instead of meeting at a hard line.
    float horizonDust = pow(1.0 - clamp(abs(dir.y) * 2.2, 0.0, 1.0), 2.0);
    // Wider and hotter at a low sun, which is when there is most air between
    // the eye and the light: the far field glows instead of ending in a band
    // of the same navy as the near ground.
    colour += sunColor * horizonDust * (0.085 + 0.10 * (1.0 - sunAbove))
            * smoothstep(-0.2, 0.35, sunDirection.y) * (1.0 - cloud * 0.6);

    // Overcast flattens everything — toward dust-grey, not toward neutral.
    vec3 overcast = mix(vec3(0.050, 0.055, 0.065), vec3(0.44, 0.40, 0.34), sunAbove);
    colour = mix(colour, overcast, cloud * 0.72);
    colour *= mix(1.0, 1.35, sunAbove);
    gl_FragColor = vec4(colour, 1.0);
  }
`;

/**
 * `dayLength` is how many seconds of play one full cycle takes. The shelter's
 * own clock already runs a day in four minutes, and the sky is driven off the
 * same elapsed time so the HUD's DAY counter and the sun agree.
 */
export function createSky({ scene, dayLength = 1800, startAt = 0.30 }) {
  const uniforms = {
    zenith: { value: new THREE.Color(0x05070e) },
    horizon: { value: new THREE.Color(0x0b1017) },
    sunColor: { value: new THREE.Color(0xfff4e2) },
    sunDirection: { value: new THREE.Vector3(0, 1, 0) },
    moonDirection: { value: new THREE.Vector3(0, -1, 0) },
    sunAbove: { value: 0 },
    starOpacity: { value: 1 },
    cloud: { value: 0 },
  };

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(760, 32, 20),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: true,
    }));
  dome.name = 'Sky_Dome';
  dome.renderOrder = -1000;
  dome.frustumCulled = false;
  scene.add(dome);

  const sun = new THREE.DirectionalLight(0xfff4e2, 0);
  sun.castShadow = true;
  // A moving sun re-renders the shadow map every frame, so any coarseness in
  // it reads as a crawl along every edge in the compound rather than as a soft
  // edge. Twice the resolution and a normal bias stop the shimmer; the map is
  // still one 2K texture for the whole surface.
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0004;

  // The shadow box travels with whoever is looking at it. Held on the world
  // origin it covered the compound and stopped, and beyond its edge every
  // sample clamps to the border texel — which drew a hard straight line across
  // the open ground where the shadowing simply gave up, running diagonally
  // through the middle of the frame the moment the sun came off the vertical.
  const SHADOW_EXTENT = 64;
  sun.shadow.camera.left = -SHADOW_EXTENT;
  sun.shadow.camera.right = SHADOW_EXTENT;
  sun.shadow.camera.top = SHADOW_EXTENT;
  sun.shadow.camera.bottom = -SHADOW_EXTENT;
  sun.shadow.camera.far = 260;
  // One shadow texel on the ground. The focus is snapped to this, because a
  // box that slides continuously makes every shadow edge in the world crawl
  // as the player walks; snapped, the map moves a whole texel at a time and
  // the edges sit still.
  const SHADOW_TEXEL = (SHADOW_EXTENT * 2) / 2048;
  scene.add(sun, sun.target);

  const moon = new THREE.DirectionalLight(0xa6bdc9, 0);
  scene.add(moon, moon.target);

  const ambient = new THREE.HemisphereLight(0x2a3644, 0x14140f, 1.0);
  scene.add(ambient);

  // Weather runs as a slow walk between clear and overcast; rain only falls
  // once the cloud is genuinely in, and eases off before it clears.
  let cloudTarget = 0.15;
  let cloud = 0.15;
  let rain = 0;
  let weatherTimer = 26;
  let elapsed = startAt * dayLength;

  const state = {
    timeOfDay: startAt,
    dayFactor: 0,
    // The exposure the surface wants, filled in by update().
    exposure: 1,
    cloud,
    rain,
    // Something for the shelter's own copy to talk about.
    label: 'CLEAR',
  };

  const _sunDir = new THREE.Vector3();
  const _moonDir = new THREE.Vector3();

  const _focus = new THREE.Vector3();

  function update(dt, focus = null) {
    elapsed += dt;
    const t = (elapsed / dayLength) % 1;
    state.timeOfDay = t;

    // Sun rises at 0.25 and sets at 0.75, so noon is the top of its arc — but
    // the arc is tilted out of the vertical rather than passing through the
    // zenith. A sun directly overhead lights the ground and nothing else: every
    // wall, vehicle and figure in the compound gets only the sky's fill, so the
    // whole of the middle of the day came out cold and flat with the warm half
    // of the light landing where the camera never looks. Leaning it over keeps
    // a raking key and a long shadow on the ground at every hour the sun is up,
    // which is the light this place is supposed to be baked by.
    const sunAngle = (t - 0.25) * TAU;
    const TILT = 0.5;
    _sunDir.set(
      Math.cos(sunAngle) * 0.42 + TILT * 0.86,
      Math.sin(sunAngle),
      Math.cos(sunAngle) * 0.86 - TILT * 0.42).normalize();
    _moonDir.copy(_sunDir).negate();

    const height = _sunDir.y;
    // A soft horizon: the light does not switch off the instant the sun sets.
    const dayFactor = THREE.MathUtils.smoothstep(height, -0.14, 0.22);
    state.dayFactor = dayFactor;

    // Weather: hold a state for a while, then walk to a new one.
    weatherTimer -= dt;
    if (weatherTimer <= 0) {
      const roll = Math.random();
      cloudTarget = roll < 0.34 ? 0.08 + Math.random() * 0.14
        : roll < 0.68 ? 0.35 + Math.random() * 0.22
          : 0.72 + Math.random() * 0.26;
      weatherTimer = 40 + Math.random() * 70;
    }
    cloud = THREE.MathUtils.damp(cloud, cloudTarget, 0.28, dt);
    // Rain needs the cloud in first, and lags it going out.
    const wantRain = THREE.MathUtils.smoothstep(cloud, 0.62, 0.92);
    rain = THREE.MathUtils.damp(rain, wantRain, wantRain > rain ? 0.35 : 0.16, dt);
    state.cloud = cloud;
    state.rain = rain;
    state.label = rain > 0.45 ? 'RAIN' : (cloud > 0.55 ? 'OVERCAST' : (dayFactor > 0.5 ? 'CLEAR' : 'CLEAR NIGHT'));

    const [zenith, horizon, lightColour, ambientSky, ambientGround] = sampleStops(t);
    uniforms.zenith.value.copy(zenith);
    uniforms.horizon.value.copy(horizon);
    uniforms.sunColor.value.copy(lightColour);
    uniforms.sunDirection.value.copy(_sunDir);
    uniforms.moonDirection.value.copy(_moonDir);
    uniforms.sunAbove.value = dayFactor;
    uniforms.starOpacity.value = (1 - dayFactor) * (1 - cloud * 0.9);
    uniforms.cloud.value = cloud;

    const weatherDim = 1 - cloud * 0.72;
    if (focus) {
      _focus.set(Math.round(focus.x / SHADOW_TEXEL) * SHADOW_TEXEL, 0,
        Math.round(focus.z / SHADOW_TEXEL) * SHADOW_TEXEL);
    } else {
      _focus.set(0, 0, 0);
    }
    sun.target.position.copy(_focus);
    sun.target.updateMatrixWorld();
    sun.position.copy(_focus).addScaledVector(_sunDir, 120);
    sun.color.copy(lightColour);
    // Hot, but gold rather than white. A key of 3.6 in near-white clipped the
    // yard to paper and took the surface off everything; pulling it to 2.35
    // and leaving it neutral only made the same picture darker. The heat is
    // back, and it is the colour doing the work: at this tint the red channel
    // runs into the shoulder while green and blue still have somewhere to go,
    // so a lit wall goes amber instead of going white.
    sun.intensity = Math.max(0, dayFactor) * 2.90 * weatherDim;
    sun.visible = sun.intensity > 0.01;
    // The shadow map is left on its automatic per-frame refresh. Holding it
    // and stepping it when the sun had moved a set amount traded a crawl for a
    // jump, and a jump across the whole compound is far more obvious than the
    // crawl was — the sun being seven times slower, the map being 2K with a
    // normal bias, and the far ground no longer asking for shadows deal with
    // the crawl on their own.

    moon.target.position.copy(_focus);
    moon.target.updateMatrixWorld();
    moon.position.copy(_focus).addScaledVector(_moonDir, 120);
    moon.intensity = Math.max(0, 1 - dayFactor) * 2.55 * (1 - cloud * 0.55);
    moon.visible = moon.intensity > 0.01;

    ambient.color.copy(ambientSky);
    ambient.groundColor.copy(ambientGround);
    // Fill, not a second sun — and blue, because the only thing filling a
    // shadow out here is the sky. Kept well under the key: what separates the
    // two is colour, not level, and lifting this is how a shadow stops being a
    // shadow and starts being a slightly darker patch of the same grey.
    // Roughly two and a half parts key to one part fill, held at that ratio
    // whatever the level. Raising the fill on its own to rescue a dark noon
    // took the rake out of every morning and evening as well: at a low sun the
    // key lands at a glancing angle and is easily out-shouted, and the moment
    // it is, the ground stops being gold and goes the colour of the sky.
    ambient.intensity = (0.95 + dayFactor * 1.25) * (1 - cloud * 0.18);

    // What the eye is stopped down to out here. A little under at noon, open
    // at night. The previous 0.80 was a stop and a half of correction on top
    // of a key that had already been cut, which is how the yard ended up
    // muddy: nothing was clipping and nothing was bright either.
    state.exposure = THREE.MathUtils.lerp(1.24, 1.16, dayFactor)
      + cloud * 0.08 * dayFactor;

    if (scene.fog) {
      // The fog matches the horizon, so distance runs out into haze rather
      // than into a colour that belongs to nothing on screen.
      scene.fog.color.copy(horizon).lerp(_a.setHex(0x9aa6ad), cloud * 0.35 * dayFactor);
      // Clear-day density used to be 0.0075, which is seventy per cent fogged
      // at a hundred and fifty metres. That was tuned for a surface with
      // nothing on it past the wire; there is now half a kilometre of hedged
      // country and a town out there, and all of it was arriving as a white
      // wash. Weather still closes it down — a rainstorm is still a rainstorm.
      scene.fog.density = 0.0026 + rain * 0.0115 + cloud * 0.0035;
    }
    return state;
  }

  update(0);

  return {
    dome, sun, moon, ambient, uniforms, state, update,
    /** Jump the clock, for QA and for the debug console. */
    setTimeOfDay(value) { elapsed = ((value % 1) + 1) % 1 * dayLength; update(0); },
    setWeather(value) { cloudTarget = THREE.MathUtils.clamp(value, 0, 1); weatherTimer = 90; },
  };
}
