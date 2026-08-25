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
const SKY_STOPS = [
  //  t     zenith     horizon    sun/moon light   ambient sky  ambient ground
  [0.00, 0x05070e, 0x0b1017, 0x8fa8bd, 0x2a3644, 0x14140f],
  [0.22, 0x0c1420, 0x1d2430, 0x9fb4c6, 0x3b4a58, 0x1a1a14],
  [0.27, 0x27364f, 0x8a5a3e, 0xffb27a, 0x6b5a52, 0x2e2620],
  [0.34, 0x3f6791, 0xbe9a78, 0xffd7ad, 0x8ea3b4, 0x50463a],
  [0.50, 0x4d7fae, 0xb7c6cd, 0xfff4e2, 0xa9c0d0, 0x6a6250],
  [0.68, 0x40699a, 0xc0a184, 0xffdcb4, 0x93a6b3, 0x574c3f],
  [0.76, 0x24324a, 0x8f5a39, 0xff9d63, 0x63544c, 0x2b241e],
  [0.83, 0x0d1522, 0x1c232f, 0x9cb1c4, 0x3a4855, 0x191913],
  [1.00, 0x05070e, 0x0b1017, 0x8fa8bd, 0x2a3644, 0x14140f],
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
    float sunGlow = pow(max(sunAngle, 0.0), 220.0) * 0.5
                  + pow(max(sunAngle, 0.0), 8.0) * 0.10;

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

    // Overcast flattens everything toward a single grey.
    vec3 overcast = mix(vec3(0.055, 0.062, 0.070), vec3(0.40, 0.42, 0.44), sunAbove);
    colour = mix(colour, overcast, cloud * 0.72);
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

  sun.shadow.camera.left = -46;
  sun.shadow.camera.right = 46;
  sun.shadow.camera.top = 46;
  sun.shadow.camera.bottom = -46;
  sun.shadow.camera.far = 220;
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
    cloud,
    rain,
    // Something for the shelter's own copy to talk about.
    label: 'CLEAR',
  };

  const _sunDir = new THREE.Vector3();
  const _moonDir = new THREE.Vector3();

  function update(dt) {
    elapsed += dt;
    const t = (elapsed / dayLength) % 1;
    state.timeOfDay = t;

    // Sun rises at 0.25 and sets at 0.75, so noon is the top of its arc.
    const sunAngle = (t - 0.25) * TAU;
    _sunDir.set(Math.cos(sunAngle) * 0.42, Math.sin(sunAngle), Math.cos(sunAngle) * 0.86).normalize();
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
    sun.position.copy(_sunDir).multiplyScalar(120);
    sun.color.copy(lightColour);
    sun.intensity = Math.max(0, dayFactor) * 3.6 * weatherDim;
    sun.visible = sun.intensity > 0.01;
    // The shadow map is left on its automatic per-frame refresh. Holding it
    // and stepping it when the sun had moved a set amount traded a crawl for a
    // jump, and a jump across the whole compound is far more obvious than the
    // crawl was — the sun being seven times slower, the map being 2K with a
    // normal bias, and the far ground no longer asking for shadows deal with
    // the crawl on their own.

    moon.position.copy(_moonDir).multiplyScalar(120);
    moon.intensity = Math.max(0, 1 - dayFactor) * 2.4 * (1 - cloud * 0.55);
    moon.visible = moon.intensity > 0.01;

    ambient.color.copy(ambientSky);
    ambient.groundColor.copy(ambientGround);
    ambient.intensity = (0.85 + dayFactor * 1.25) * (1 - cloud * 0.25);

    if (scene.fog) {
      // The fog matches the horizon, so distance runs out into haze rather
      // than into a colour that belongs to nothing on screen.
      scene.fog.color.copy(horizon).lerp(_a.setHex(0x9aa6ad), cloud * 0.35 * dayFactor);
      scene.fog.density = 0.0075 + rain * 0.012 + cloud * 0.003;
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
