import * as THREE from 'three';

// Final colour grade for the first-person view: a gentle filmic curve, edge
// desaturation, vignette and film grain. Everything is cheap enough for a
// mobile GPU and driven from one uniform block.
export const GradeShader = {
  name: 'LostSignalGrade',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    // Keep the lens treatment visible without letting it obscure authored
    // detail on a small phone screen. The previous combination crushed the
    // corners and laid a coarse noise field over every concrete surface.
    vignette: { value: 0.34 },
    grain: { value: 0.006 },
    aberration: { value: 0.00045 },
    contrast: { value: 1.025 },
    saturation: { value: 0.94 },
    // Where the bottom of the picture sits. Shadows out here are not black:
    // they are whatever the sky is putting into them, and holding them off
    // zero with the sky's own colour is what keeps a silhouette a shape
    // rather than a hole.
    lift: { value: new THREE.Color(0x0b1113) },
    // Split toning. The surface is lit by two things that are nowhere near
    // each other on the wheel — a gold sun and a cyan sky — and pushing the
    // ends apart in the grade is what stops the render splitting the
    // difference and handing back a uniform brown. `tone` is how much of it
    // applies, so the shelter's own strip lights are left alone.
    shadowTint: { value: new THREE.Color(0.70, 0.97, 1.22) },
    highlightTint: { value: new THREE.Color(1.24, 1.01, 0.70) },
    tone: { value: 0 },
    damage: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time, vignette, grain, aberration, contrast, saturation, tone, damage;
    uniform vec3 lift, shadowTint, highlightTint;
    const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // A tint should move colour and leave level alone. Multiplying by a raw
    // tint darkens as well as colours — a cyan whose red channel is 0.70 takes
    // seven per cent of the luminance out of every shadow it touches, and at
    // full strength that is most of the frame. Dividing the tint through by
    // its own luminance first makes it a hue rotation with the brightness
    // kept, which is the difference between a grade and a dimmer.
    vec3 tint(vec3 c, vec3 t, float w) {
      return mix(c, c * (t / max(dot(t, LUMA), 1e-4)), w);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float radius = length(centered);

      // Lateral chromatic aberration, strongest at the edge of the frame.
      float spread = aberration * (1.0 + damage * 5.0) * radius;
      vec3 color;
      color.r = texture2D(tDiffuse, vUv - centered * spread).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv + centered * spread).b;

      // Contrast around a pivot below mid grey, then a soft shoulder. Pivoting
      // at 0.5 and clamping crushed the sky to a flat band the moment contrast
      // went above about 1.05; rolling the top off instead keeps the highlight
      // detail that makes a bright sky read as bright rather than as white.
      color = (color - 0.44) * contrast + 0.44;
      color = max(color, 0.0);
      color = color / (1.0 + max(color - 0.92, 0.0));

      float luma = dot(color, LUMA);
      // Warm end and cold end pulled apart before saturation, so saturation
      // has two directions to work with instead of one.
      float shadowWeight = 1.0 - smoothstep(0.0, 0.52, luma);
      float highWeight = smoothstep(0.30, 0.95, luma);
      color = tint(color, shadowTint, shadowWeight * tone);
      color = tint(color, highlightTint, highWeight * tone);

      luma = dot(color, LUMA);
      color = mix(vec3(luma), color, saturation);
      color += lift * (1.0 - luma);

      float falloff = smoothstep(1.05, 0.32, radius);
      color *= mix(1.0, falloff, vignette);

      // Fixed-pattern grain. Re-rolling the noise every frame put a sizzle over
      // the whole image that, on a dark surface at night, read as the entire
      // world flickering — and it was the largest single source of change
      // between two frames of a completely static scene. Seeded from the pixel
      // alone it is sensor noise: still texture, no shimmer.
      float noise = hash(vUv * vec2(1024.0, 768.0)) - 0.5;
      color += noise * grain * (0.35 + luma * 0.9);

      // Injury tint pulls the frame red and dark at the edges.
      color = mix(color, vec3(0.42, 0.05, 0.04) * luma * 1.6, damage * (0.25 + radius));

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }`,
};

// The CCTV monitor feed: interlaced scanlines, bloom-ish glow, tape noise,
// barrel distortion and an optional night-vision channel.
export const CameraFeedShader = {
  name: 'LostSignalCameraFeed',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    nightVision: { value: 0 },
    signal: { value: 1 },
    scanline: { value: 0.28 },
    curvature: { value: 0.12 },
  },
  vertexShader: GradeShader.vertexShader,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time, nightVision, signal, scanline, curvature;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // Barrel distortion, so the feed sits on a curved tube.
      vec2 centered = vUv - 0.5;
      float r2 = dot(centered, centered);
      vec2 uv = 0.5 + centered * (1.0 + curvature * r2);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Horizontal tearing that drifts down the frame like a bad tape head.
      float tear = step(0.995, hash(vec2(floor(uv.y * 90.0), floor(time * 8.0))));
      uv.x += tear * (hash(vec2(floor(time * 30.0), 3.0)) - 0.5) * 0.05 * (2.0 - signal);

      vec3 color = texture2D(tDiffuse, uv).rgb;

      if (nightVision > 0.5) {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        luma = pow(clamp(luma * 3.4 + 0.06, 0.0, 1.0), 0.78);
        color = vec3(luma * 0.32, luma, luma * 0.42);
      } else {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, 0.45) * vec3(0.86, 0.95, 0.9);
        color = pow(color, vec3(0.88));
      }

      // Interlaced scanlines and a slow roll bar.
      float lines = sin(uv.y * 900.0 + time * 6.0) * 0.5 + 0.5;
      color *= 1.0 - scanline * lines;
      float roll = smoothstep(0.0, 0.08, abs(fract(uv.y - time * 0.09) - 0.5));
      color *= 0.88 + 0.12 * roll;

      // Sensor noise, heavier when the signal is weak.
      float noise = hash(uv * vec2(640.0, 480.0) + fract(time) * 57.3);
      color += (noise - 0.5) * mix(0.30, 0.06, signal);
      color *= mix(0.35, 1.0, signal);

      float vig = smoothstep(0.95, 0.25, length(centered));
      color *= mix(0.55, 1.0, vig);

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }`,
};
