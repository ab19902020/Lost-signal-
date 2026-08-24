import {
  geoCircle,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import countries110 from 'world-atlas/countries-110m.json';

export const OPENING_LENGTH = 62.2;
const EXCHANGE_START = 8.1;
const FINAL_COLLAPSE = 57.2;
const SETTINGS_KEY = 'lost-signal-opening-settings-v1';

const DEFAULT_SETTINGS = {
  master: 78,
  broadcast: 92,
  subtitles: true,
  filmGrain: false,
  impactDetail: true,
};

const NATO = new Set([
  'Albania', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Czechia', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland',
  'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Montenegro', 'Netherlands',
  'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 'Turkey', 'United Kingdom',
  'United States of America',
]);
const EASTERN = new Set(['Russia', 'China', 'North Korea']);

const STRIKES = [
  { from: [59, 45], to: [51.51, -.13], fromName: 'RUSSIA', toName: 'LONDON', bloc: 'eastern', launch: 8.2, duration: 11, height: 1.8 },
  { from: [43, -106], to: [55.75, 37.62], fromName: 'UNITED STATES', toName: 'MOSCOW', bloc: 'nato', launch: 8.6, duration: 11.1, height: 2.15 },
  { from: [49, -28], to: [55.75, 37.62], fromName: 'UNITED KINGDOM', toName: 'MOSCOW', bloc: 'nato', launch: 9.2, duration: 11.3, height: 1.85 },
  { from: [57, 49], to: [40.71, -74.01], fromName: 'RUSSIA', toName: 'NEW YORK', bloc: 'eastern', launch: 9.8, duration: 12.2, height: 3 },
  { from: [46, -8], to: [59.93, 30.34], fromName: 'FRANCE', toName: 'ST PETERSBURG', bloc: 'nato', launch: 11.1, duration: 11.2, height: 1.9 },
  { from: [38, 105], to: [38.91, -77.04], fromName: 'CHINA', toName: 'WASHINGTON', bloc: 'eastern', launch: 11.8, duration: 11.9, height: 2.75 },
  { from: [42, -100], to: [39.9, 116.41], fromName: 'UNITED STATES', toName: 'BEIJING', bloc: 'nato', launch: 13, duration: 12.4, height: 2.7 },
  { from: [36, 107], to: [51.51, -.13], fromName: 'CHINA', toName: 'LONDON', bloc: 'eastern', launch: 14, duration: 11.9, height: 2.35 },
  { from: [49, -28], to: [39.9, 116.41], fromName: 'UNITED KINGDOM', toName: 'BEIJING', bloc: 'nato', launch: 15.2, duration: 12, height: 2.9 },
  { from: [35, 148], to: [31.23, 121.47], fromName: 'UNITED STATES', toName: 'SHANGHAI', bloc: 'nato', launch: 17, duration: 11, height: 1.55 },
  { from: [37, 106], to: [34.05, -118.24], fromName: 'CHINA', toName: 'LOS ANGELES', bloc: 'eastern', launch: 18.1, duration: 11.2, height: 3.1 },
  { from: [68, 39], to: [48.86, 2.35], fromName: 'RUSSIA', toName: 'PARIS', bloc: 'eastern', launch: 20, duration: 10.6, height: 1.75 },
  { from: [39, -103], to: [39.9, 116.41], fromName: 'UNITED STATES', toName: 'BEIJING', bloc: 'nato', launch: 22, duration: 9.5, height: 2.65 },
  { from: [40.2, 127], to: [35.68, 139.65], fromName: 'NORTH KOREA', toName: 'TOKYO', bloc: 'eastern', launch: 24.5, duration: 8.6, height: 1.3 },
  { from: [58, 47], to: [52.52, 13.4], fromName: 'RUSSIA', toName: 'BERLIN', bloc: 'eastern', launch: 27, duration: 8.5, height: 1.45 },
  { from: [41, -101], to: [43.12, 131.89], fromName: 'UNITED STATES', toName: 'VLADIVOSTOK', bloc: 'nato', launch: 29, duration: 8.5, height: 2.2 },
  { from: [38, 106], to: [43.65, -79.38], fromName: 'CHINA', toName: 'TORONTO', bloc: 'eastern', launch: 31.2, duration: 7.8, height: 3 },
  { from: [67, 40], to: [38.91, -77.04], fromName: 'RUSSIA', toName: 'WASHINGTON', bloc: 'eastern', launch: 33, duration: 7.6, height: 2.9 },
  { from: [42, -101], to: [31.23, 121.47], fromName: 'UNITED STATES', toName: 'SHANGHAI', bloc: 'nato', launch: 35.2, duration: 7.1, height: 2.45 },
  { from: [65, 42], to: [52.23, 21.01], fromName: 'RUSSIA', toName: 'WARSAW', bloc: 'eastern', launch: 38, duration: 6.8, height: 1.35 },
  { from: [47, -30], to: [55.75, 37.62], fromName: 'UNITED KINGDOM', toName: 'MOSCOW', bloc: 'nato', launch: 40.2, duration: 6.2, height: 1.75 },
  { from: [35, 108], to: [-33.87, 151.21], fromName: 'CHINA', toName: 'SYDNEY', bloc: 'eastern', launch: 41, duration: 7, height: 2.55 },
  { from: [58, 51], to: [41.9, 12.5], fromName: 'RUSSIA', toName: 'ROME', bloc: 'eastern', launch: 43, duration: 6, height: 1.7 },
  { from: [48, -29], to: [39.9, 116.41], fromName: 'UNITED KINGDOM', toName: 'BEIJING', bloc: 'nato', launch: 45, duration: 6.1, height: 2.85 },
  { from: [45, -12], to: [55.75, 37.62], fromName: 'NATO ATLANTIC', toName: 'MOSCOW', bloc: 'nato', launch: 47, duration: 5.3, height: 1.65 },
  { from: [36, 108], to: [51.51, -.13], fromName: 'CHINA', toName: 'LONDON', bloc: 'eastern', launch: 49, duration: 5.2, height: 2.25 },
  { from: [67, 40], to: [38.91, -77.04], fromName: 'RUSSIA', toName: 'WASHINGTON', bloc: 'eastern', launch: 51, duration: 5, height: 2.9 },
];

const CAMERA_KEYS = [
  { time: 0, lon: -22, lat: 12 },
  { time: 8, lon: -28, lat: 17 },
  { time: 19.2, lon: -3, lat: 24 },
  { time: 25, lon: 55, lat: 23 },
  { time: 32, lon: 123, lat: 18 },
  { time: 39, lon: -94, lat: 23 },
  { time: 46, lon: 18, lat: 22 },
  { time: 53, lon: 76, lat: 17 },
  { time: 57.5, lon: -64, lat: 14 },
  { time: OPENING_LENGTH, lon: -16, lat: 8 },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normaliseLongitude(value) {
  return ((value + 540) % 360) - 180;
}

function smoothStep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function cameraAt(time) {
  const nextIndex = CAMERA_KEYS.findIndex((key) => key.time >= time);
  if (nextIndex <= 0) return [CAMERA_KEYS[0].lon, CAMERA_KEYS[0].lat];
  const previous = CAMERA_KEYS[nextIndex - 1];
  const next = CAMERA_KEYS[nextIndex];
  const progress = smoothStep((time - previous.time) / Math.max(.01, next.time - previous.time));
  const longitudeDelta = normaliseLongitude(next.lon - previous.lon);
  return [normaliseLongitude(previous.lon + longitudeDelta * progress), previous.lat + (next.lat - previous.lat) * progress];
}

function visibleFrom(point, centre) {
  return geoDistance(centre, point) <= Math.PI / 2 + .025;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function storyCaption(time) {
  if (time < 2.3) return '';
  if (time < 7.7) return 'THIS IS A NATIONAL EMERGENCY BROADCAST.';
  if (time < 13.9) return 'AS OF THIS MORNING, THE UNITED KINGDOM IS AT WAR.';
  if (time < 18.9) return 'NATO FORCES ARE ENGAGED AGAINST RUSSIA, CHINA AND NORTH KOREA.';
  if (time < 24.7) return 'NUCLEAR WEAPONS HAVE BEEN USED.';
  if (time < 30.9) return 'LONDON IS GONE. MANCHESTER. GLASGOW. PORTSMOUTH.';
  if (time < 37.1) return 'TAKE SHELTER. TAKE SHELTER. TAKE SHELTER NOW.';
  if (time < 42.6) return 'GET BELOW GROUND. ANYWHERE BELOW GROUND.';
  if (time < 49.6) return 'DO NOT WAIT FOR ANYONE. THERE IS NO ONE COMING.';
  if (time < 55.8) return 'SEAL WHAT YOU CAN. STAY DOWN UNTIL IT PASSES.';
  if (time < 59.4) return 'YOU ARE NOT ALONE YET.';
  return 'GOD BE WITH YOU ALL.';
}

export function readOpeningSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeOpeningSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Private browsing may block storage; the current session still uses the setting.
  }
}

async function enterLandscapeFullscreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
    if (screen.orientation?.lock) await screen.orientation.lock('landscape');
  } catch {
    // Android browsers that block orientation locking can still be rotated manually.
  }
}

function drawLocalGlow(context, x, y, radius, alpha, red = true) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, red ? `rgba(255,132,50,${alpha})` : `rgba(94,205,231,${alpha})`);
  gradient.addColorStop(.22, red ? `rgba(229,67,24,${alpha * .72})` : `rgba(48,144,185,${alpha * .62})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawMissile(context, x, y, angle, scale, bloc, progress, phase) {
  context.save();
  context.translate(x, y);
  context.rotate(angle + Math.PI / 2);
  context.scale(scale, scale);

  const reentry = smoothStep((progress - .72) / .24);
  const flameLength = 14 + Math.sin(phase) * 2.2;
  const exhaust = context.createLinearGradient(0, 5, 0, flameLength + 12);
  exhaust.addColorStop(0, `rgba(255,184,74,${.88 - reentry * .22})`);
  exhaust.addColorStop(.28, 'rgba(235,78,27,.72)');
  exhaust.addColorStop(1, 'rgba(89,111,107,0)');
  context.fillStyle = exhaust;
  context.beginPath();
  context.moveTo(-2.15, 5.2);
  context.quadraticCurveTo(-3.5, 11, 0, flameLength + 12);
  context.quadraticCurveTo(3.5, 11, 2.15, 5.2);
  context.closePath();
  context.fill();

  context.fillStyle = '#242a28';
  context.fillRect(-2.65, 4.2, 5.3, 2.1);
  const metal = context.createLinearGradient(-3.3, 0, 3.3, 0);
  metal.addColorStop(0, '#343a38');
  metal.addColorStop(.24, bloc === 'nato' ? '#98aaa8' : '#807f78');
  metal.addColorStop(.5, '#d2d8d4');
  metal.addColorStop(.72, bloc === 'nato' ? '#71888b' : '#766d63');
  metal.addColorStop(1, '#202523');
  context.fillStyle = metal;
  context.beginPath();
  context.moveTo(-3, -8.2);
  context.quadraticCurveTo(-3.2, -2, -2.75, 4.8);
  context.lineTo(2.75, 4.8);
  context.quadraticCurveTo(3.2, -2, 3, -8.2);
  context.closePath();
  context.fill();

  context.fillStyle = reentry > .02 ? `rgba(214,72,31,${.38 + reentry * .5})` : '#222725';
  context.beginPath();
  context.moveTo(-3, -8.2);
  context.quadraticCurveTo(-1.7, -12.8, 0, -16.2);
  context.quadraticCurveTo(1.7, -12.8, 3, -8.2);
  context.closePath();
  context.fill();

  context.fillStyle = bloc === 'nato' ? '#365966' : '#732f24';
  context.fillRect(-3.05, -2.8, 6.1, 1.15);
  context.fillRect(-3.05, 2.3, 6.1, .9);
  context.fillStyle = '#3a403d';
  context.beginPath();
  context.moveTo(-2.7, 1.8);
  context.lineTo(-7.1, 6.8);
  context.lineTo(-2.35, 5.1);
  context.closePath();
  context.moveTo(2.7, 1.8);
  context.lineTo(7.1, 6.8);
  context.lineTo(2.35, 5.1);
  context.closePath();
  context.fill();
  context.strokeStyle = 'rgba(230,239,233,.48)';
  context.lineWidth = .55;
  context.beginPath();
  context.moveTo(-1.25, -8);
  context.lineTo(-1.25, 3.8);
  context.stroke();
  context.restore();
}

function createGlobeRenderer(canvas, getSettings) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('This browser cannot create the opening canvas.');
  const countries = feature(countries110, countries110.objects.countries);
  const borders = mesh(countries110, countries110.objects.countries, (a, b) => a !== b);
  const graticule = geoGraticule10();
  const projection = geoOrthographic().clipAngle(90).precision(.5);
  const path = geoPath(projection, context);
  const blastCircle = geoCircle().precision(7);
  const interpolators = STRIKES.map((strike) => geoInterpolate(
    [strike.from[1], strike.from[0]], [strike.to[1], strike.to[0]],
  ));
  const random = seededRandom(592025);
  const stars = Array.from({ length: 520 }, () => ({
    x: random(), y: random(), size: .45 + random() * 1.25, alpha: .22 + random() * .48,
  }));

  let width = 1;
  let height = 1;
  let dpr = 1;
  let measuredWidth = 0;
  let measuredHeight = 0;

  function measure() {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    const mobile = Math.min(width, height) < 700;
    const detail = getSettings().impactDetail;
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1 : (detail ? 1.35 : 1.05));
    if (width !== measuredWidth || height !== measuredHeight || canvas.width !== Math.floor(width * dpr)) {
      measuredWidth = width;
      measuredHeight = height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function render(time, mode = 'cutscene') {
    measure();
    const menu = mode === 'menu';
    const portrait = height > width;
    const centreX = menu && !portrait ? width * .69 : width * .5;
    const centreY = menu && portrait ? height * .31 : height * .515;
    const radius = menu
      ? Math.min(width * (portrait ? .42 : .31), height * (portrait ? .23 : .435))
      : Math.min(width * .31, height * .435);
    projection.translate([centreX, centreY]).scale(radius);
    const impactCount = menu ? 0 : STRIKES.filter((strike) => time >= strike.launch + strike.duration).length;
    const devastation = clamp(impactCount / STRIKES.length, 0, 1);
    const viewCentre = menu
      ? [normaliseLongitude(-24 + time * 2.1), 12 + Math.sin(time * .18) * 2]
      : cameraAt(time);
    projection.rotate([-viewCentre[0], -viewCentre[1], -4]);

    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.fillStyle = '#000302';
    context.fillRect(0, 0, width, height);
    const space = context.createRadialGradient(centreX, centreY, radius * .25, centreX, centreY, Math.max(width, height) * .75);
    space.addColorStop(0, '#07100f');
    space.addColorStop(.5, '#020606');
    space.addColorStop(1, '#000101');
    context.fillStyle = space;
    context.fillRect(0, 0, width, height);
    const starCount = getSettings().impactDetail ? stars.length : 310;
    for (let index = 0; index < starCount; index += 1) {
      const star = stars[index];
      const twinkle = .72 + Math.sin(time * (.45 + (index % 7) * .07) + index) * .16;
      context.fillStyle = `rgba(160,190,190,${star.alpha * twinkle})`;
      context.fillRect(star.x * width, star.y * height, star.size, star.size);
    }

    context.save();
    context.beginPath();
    context.arc(centreX, centreY, radius, 0, Math.PI * 2);
    context.clip();
    const ocean = context.createRadialGradient(centreX - radius * .3, centreY - radius * .27, radius * .03, centreX, centreY, radius * 1.12);
    ocean.addColorStop(0, devastation < .55 ? '#1d5361' : '#46302b');
    ocean.addColorStop(.5, devastation < .55 ? '#0c3340' : '#251a18');
    ocean.addColorStop(1, '#030c10');
    context.fillStyle = ocean;
    context.fillRect(centreX - radius, centreY - radius, radius * 2, radius * 2);

    context.beginPath();
    path(graticule);
    context.strokeStyle = 'rgba(119,170,174,.12)';
    context.lineWidth = .65;
    context.stroke();

    context.beginPath();
    path(countries);
    const land = context.createLinearGradient(centreX - radius, centreY - radius, centreX + radius, centreY + radius);
    land.addColorStop(0, devastation < .5 ? '#55725b' : '#5a493d');
    land.addColorStop(.46, devastation < .5 ? '#304c3c' : '#49392f');
    land.addColorStop(1, devastation < .5 ? '#172d2a' : '#2b211e');
    context.fillStyle = land;
    context.fill();

    if (!menu) {
      for (const country of countries.features) {
        const name = country.properties?.name || '';
        const faction = NATO.has(name) ? 'nato' : (EASTERN.has(name) ? 'eastern' : null);
        if (!faction) continue;
        context.beginPath();
        path(country);
        context.fillStyle = faction === 'nato' ? 'rgba(63,153,181,.34)' : 'rgba(185,55,37,.42)';
        context.fill();
      }
    }

    context.beginPath();
    path(borders);
    context.strokeStyle = 'rgba(192,216,205,.22)';
    context.lineWidth = .62;
    context.stroke();
    context.beginPath();
    path(countries);
    context.strokeStyle = 'rgba(205,227,214,.2)';
    context.lineWidth = Math.max(.55, radius * .0022);
    context.stroke();

    if (!menu) {
      for (const strike of STRIKES) {
        const sinceImpact = time - strike.launch - strike.duration;
        if (sinceImpact < 0) continue;
        const point = [strike.to[1], strike.to[0]];
        if (!visibleFrom(point, viewCentre)) continue;
        context.beginPath();
        path(blastCircle.center(point).radius(Math.min(3.6, .65 + sinceImpact * .16))());
        context.fillStyle = `rgba(54,10,6,${Math.min(.84, .34 + sinceImpact * .045)})`;
        context.fill();
        context.strokeStyle = `rgba(145,49,26,${Math.min(.34, .12 + sinceImpact * .012)})`;
        context.lineWidth = .65;
        context.stroke();
      }
    }

    const night = context.createLinearGradient(centreX - radius, centreY, centreX + radius, centreY);
    night.addColorStop(0, 'rgba(0,2,4,.78)');
    night.addColorStop(.42, 'rgba(0,2,3,.16)');
    night.addColorStop(.78, `rgba(28,4,2,${.08 + devastation * .18})`);
    night.addColorStop(1, 'rgba(0,0,0,.45)');
    context.fillStyle = night;
    context.fillRect(centreX - radius, centreY - radius, radius * 2, radius * 2);
    const surfaceHaze = context.createRadialGradient(centreX - radius * .2, centreY - radius * .22, radius * .15, centreX, centreY, radius);
    surfaceHaze.addColorStop(0, 'rgba(102,169,168,.07)');
    surfaceHaze.addColorStop(.7, 'rgba(58,116,120,.015)');
    surfaceHaze.addColorStop(.92, 'rgba(34,72,79,.08)');
    surfaceHaze.addColorStop(1, 'rgba(5,10,12,.3)');
    context.fillStyle = surfaceHaze;
    context.fillRect(centreX - radius, centreY - radius, radius * 2, radius * 2);
    context.restore();

    context.strokeStyle = devastation < .6 ? 'rgba(90,177,196,.48)' : 'rgba(175,67,43,.48)';
    context.lineWidth = Math.max(1.4, radius * .009);
    context.beginPath();
    context.arc(centreX, centreY, radius + context.lineWidth * .35, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = devastation < .6 ? 'rgba(91,167,184,.16)' : 'rgba(157,48,31,.18)';
    context.lineWidth = Math.max(5, radius * .035);
    context.beginPath();
    context.arc(centreX, centreY, radius + context.lineWidth * .25, 0, Math.PI * 2);
    context.stroke();

    if (menu) return { impactCount: 0, trajectoryCount: 0, collapse: 0, activeStrike: null };

    for (let index = 0; index < STRIKES.length; index += 1) {
      const strike = STRIKES[index];
      const progress = clamp((time - strike.launch) / strike.duration, 0, 1);
      const sinceLaunch = time - strike.launch;
      const sinceImpact = time - strike.launch - strike.duration;
      const interpolate = interpolators[index];
      const screenPointAt = (fraction) => {
        const point = interpolate(clamp(fraction, 0, 1));
        if (!visibleFrom(point, viewCentre)) return null;
        const projected = projection(point);
        if (!projected) return null;
        const altitude = Math.sin(clamp(fraction, 0, 1) * Math.PI) * radius * (.16 + strike.height * .026);
        const dx = projected[0] - centreX;
        const dy = projected[1] - centreY;
        const surfaceDistance = Math.max(1, Math.hypot(dx, dy));
        return [projected[0] + dx / surfaceDistance * altitude, projected[1] + dy / surfaceDistance * altitude];
      };

      if (progress > 0 && sinceImpact < 1.4) {
        const steps = Math.max(5, Math.ceil(progress * 42));
        const track = [];
        for (let step = 0; step <= steps; step += 1) track.push(screenPointAt(progress * step / steps));
        const strokeTrack = (colour, lineWidth) => {
          context.beginPath();
          let drawing = false;
          for (const point of track) {
            if (!point) { drawing = false; continue; }
            if (!drawing) context.moveTo(point[0], point[1]); else context.lineTo(point[0], point[1]);
            drawing = true;
          }
          context.strokeStyle = colour;
          context.lineWidth = lineWidth;
          context.stroke();
        };
        strokeTrack('rgba(0,4,4,.62)', Math.max(2.2, radius * .009));
        strokeTrack(strike.bloc === 'nato' ? 'rgba(101,192,210,.5)' : 'rgba(211,83,56,.54)', Math.max(.9, radius * .0038));
      }

      if (progress > .01 && progress < .995) {
        const missilePoint = screenPointAt(progress);
        const previousPoint = screenPointAt(Math.max(0, progress - .012));
        if (missilePoint && previousPoint) {
          for (let tail = 10; tail >= 1; tail -= 1) {
            const from = screenPointAt(progress - tail * .007);
            const to = screenPointAt(progress - (tail - 1) * .007);
            if (!from || !to) continue;
            const strength = (11 - tail) / 10;
            context.strokeStyle = strike.bloc === 'nato'
              ? `rgba(137,196,198,${.035 + strength * .22})`
              : `rgba(207,103,68,${.04 + strength * .25})`;
            context.lineWidth = Math.max(.55, radius * .0022 * strength);
            context.beginPath();
            context.moveTo(from[0], from[1]);
            context.lineTo(to[0], to[1]);
            context.stroke();
          }
          drawMissile(
            context, missilePoint[0], missilePoint[1],
            Math.atan2(missilePoint[1] - previousPoint[1], missilePoint[0] - previousPoint[0]),
            clamp(radius / 225, .9, 1.55), strike.bloc, progress, time * 27 + index * 1.71,
          );
        }
      }

      const launchPoint = [strike.from[1], strike.from[0]];
      if (sinceLaunch >= 0 && sinceLaunch < 3 && visibleFrom(launchPoint, viewCentre)) {
        const projected = projection(launchPoint);
        if (projected) {
          drawLocalGlow(context, projected[0], projected[1], radius * (.025 + sinceLaunch * .01), Math.max(0, .7 - sinceLaunch * .22), strike.bloc === 'eastern');
          context.strokeStyle = strike.bloc === 'nato' ? 'rgba(92,194,219,.42)' : 'rgba(230,75,48,.46)';
          context.lineWidth = 1;
          context.beginPath();
          context.arc(projected[0], projected[1], radius * (.018 + sinceLaunch * .018), 0, Math.PI * 2);
          context.stroke();
        }
      }

      const impactPoint = [strike.to[1], strike.to[0]];
      if (sinceImpact >= 0 && sinceImpact < 9 && visibleFrom(impactPoint, viewCentre)) {
        const projected = projection(impactPoint);
        if (!projected) continue;
        for (const delay of [0, .55, 1.1]) {
          const rippleAge = sinceImpact - delay;
          if (rippleAge < 0 || rippleAge > 4.1) continue;
          context.beginPath();
          path(blastCircle.center(impactPoint).radius(.7 + rippleAge * 4.35)());
          context.strokeStyle = `rgba(235,104,58,${(1 - rippleAge / 4.1) * .52})`;
          context.lineWidth = Math.max(.8, radius * .0036 * (1 - rippleAge / 5));
          context.stroke();
        }

        if (sinceImpact < 3.2) {
          context.beginPath();
          path(blastCircle.center(impactPoint).radius(.45 + sinceImpact * 1.45)());
          context.fillStyle = `rgba(178,46,20,${Math.max(0, .5 - sinceImpact * .13)})`;
          context.fill();
          drawLocalGlow(context, projected[0], projected[1], radius * (.035 + sinceImpact * .022), Math.max(0, .64 - sinceImpact * .16));
          const coreRadius = radius * (.009 + Math.min(1, sinceImpact * 2.3) * .014);
          const core = context.createRadialGradient(projected[0], projected[1], 0, projected[0], projected[1], coreRadius);
          core.addColorStop(0, `rgba(255,171,73,${Math.max(0, .8 - sinceImpact * .2)})`);
          core.addColorStop(.38, `rgba(221,72,27,${Math.max(0, .72 - sinceImpact * .18)})`);
          core.addColorStop(1, 'rgba(93,20,12,0)');
          context.fillStyle = core;
          context.beginPath();
          context.arc(projected[0], projected[1], coreRadius, 0, Math.PI * 2);
          context.fill();
        }

        if (getSettings().impactDetail && sinceImpact < 1.65) {
          for (let spark = 0; spark < 12; spark += 1) {
            const seed = ((index + 11) * (spark + 7) * .1937) % 1;
            const angle = spark * 2.399 + seed;
            const length = radius * (.02 + sinceImpact * (.024 + seed * .017));
            const alpha = (1 - sinceImpact / 1.65) * (.32 + seed * .35);
            context.strokeStyle = `rgba(244,113,50,${alpha})`;
            context.lineWidth = .7 + seed * .8;
            context.beginPath();
            context.moveTo(projected[0] + Math.cos(angle) * length * .25, projected[1] + Math.sin(angle) * length * .25);
            context.lineTo(projected[0] + Math.cos(angle) * length, projected[1] + Math.sin(angle) * length);
            context.stroke();
          }
        }

        const radialX = projected[0] - centreX;
        const radialY = projected[1] - centreY;
        const radialLength = Math.hypot(radialX, radialY);
        const normalX = radialLength > 2 ? radialX / radialLength : 0;
        const normalY = radialLength > 2 ? radialY / radialLength : -1;
        const tangentX = -normalY;
        const tangentY = normalX;
        const puffs = getSettings().impactDetail ? 9 : 5;
        for (let puff = 0; puff < puffs; puff += 1) {
          const seed = ((index + 3) * (puff + 5) * .173) % 1;
          const puffAge = Math.max(0, sinceImpact - puff * .11);
          const lift = radius * (.008 + puffAge * (.007 + seed * .003));
          const spread = radius * Math.sin(Math.min(1, puffAge / 3) * Math.PI * .7) * (.012 + seed * .015);
          const direction = puff % 2 === 0 ? -1 : 1;
          const x = projected[0] + normalX * lift + tangentX * spread * direction;
          const y = projected[1] + normalY * lift + tangentY * spread * direction;
          context.fillStyle = `rgba(${puff < 3 ? '111,52,35' : '34,39,37'},${Math.max(0, .46 - sinceImpact * .045)})`;
          context.beginPath();
          context.arc(x, y, radius * (.009 + puffAge * .0028 + seed * .005), 0, Math.PI * 2);
          context.fill();
        }

        if (sinceImpact < 3.4 && radius > 185) {
          const labelX = projected[0] + tangentX * radius * .07 + normalX * radius * .035;
          const labelY = projected[1] + tangentY * radius * .07 + normalY * radius * .035;
          context.strokeStyle = `rgba(225,101,60,${Math.max(0, .54 - sinceImpact * .12)})`;
          context.lineWidth = .75;
          context.beginPath();
          context.moveTo(projected[0], projected[1]);
          context.lineTo(labelX, labelY);
          context.stroke();
          context.fillStyle = `rgba(234,170,137,${Math.max(0, .66 - sinceImpact * .13)})`;
          context.font = `700 ${clamp(radius * .023, 6, 9)}px ui-monospace, monospace`;
          context.textAlign = 'center';
          context.fillText(`${strike.toName} // IMPACT`, labelX, labelY - 3);
        }
      }
    }

    if (devastation > .15) {
      context.strokeStyle = `rgba(111,35,24,${devastation * .28})`;
      context.lineWidth = radius * .055;
      context.beginPath();
      context.arc(centreX, centreY, radius * .93, 0, Math.PI * 2);
      context.stroke();
    }

    return {
      impactCount,
      trajectoryCount: STRIKES.filter((strike) => time >= strike.launch && time < strike.launch + strike.duration).length,
      collapse: Math.round(devastation * 100),
      activeStrike: [...STRIKES].reverse().find((strike) => time >= strike.launch && time < strike.launch + strike.duration) || null,
    };
  }

  return { render };
}

function markup(hasSave) {
  return `
    <div class="opening-stage"><canvas aria-hidden="true"></canvas></div>
    <div class="opening-vignette"></div>
    <div class="opening-fade"></div>
    <div class="opening-scanlines"></div>

    <section class="opening-menu" aria-label="Lost Signal main menu">
      <div class="opening-eyebrow">SHELTER 47 // OPENING PROTOCOL</div>
      <h1 class="opening-title">LOST <span>SIGNAL</span></h1>
      <p class="opening-menu-copy">The surface channel has been silent for years. Tonight, Shelter 47 received a transmission. What remains of the world is waiting below.</p>
      <div class="opening-actions">
        <button id="openingContinue" class="opening-action" type="button" ${hasSave ? '' : 'disabled'}>
          <span class="index">01</span><span><b>CONTINUE</b><small>${hasSave ? 'RESUME SHELTER 47' : 'NO ACTIVE SAVE'}</small></span><span class="arrow">›</span>
        </button>
        <button id="openingNew" class="opening-action" type="button">
          <span class="index">02</span><span><b>NEW GAME</b><small>BEGIN THE LAST TRANSMISSION</small></span><span class="arrow">›</span>
        </button>
        <button id="openingSettings" class="opening-action" type="button">
          <span class="index">03</span><span><b>SETTINGS</b><small>AUDIO · SUBTITLES · EFFECTS</small></span><span class="arrow">›</span>
        </button>
      </div>
      <div class="opening-menu-footer"><span>BUILD: OPENING 1.0</span><span id="openingEngine">SHELTER LOADS AFTER INTRO</span><span>LANDSCAPE FULLSCREEN</span></div>
    </section>

    <section class="opening-settings" aria-label="Opening settings" hidden>
      <div class="opening-settings-card">
        <div class="opening-settings-head"><h2>SETTINGS</h2><button class="opening-close" type="button">RETURN</button></div>
        <label class="opening-setting"><span class="opening-setting-copy"><b>MASTER VOLUME</b><span>CUTSCENE AND SHELTER AUDIO</span></span><span><input id="openingMaster" type="range" min="0" max="100" step="1"><output id="openingMasterOut"></output></span></label>
        <label class="opening-setting"><span class="opening-setting-copy"><b>EMERGENCY BROADCAST</b><span>VOICE AND RADIO TRACK LEVEL</span></span><span><input id="openingBroadcast" type="range" min="0" max="100" step="1"><output id="openingBroadcastOut"></output></span></label>
        <label class="opening-setting"><span class="opening-setting-copy"><b>SUBTITLES</b><span>DISPLAY THE EMERGENCY MESSAGE</span></span><input id="openingSubtitles" class="opening-toggle" type="checkbox"></label>
        <label class="opening-setting"><span class="opening-setting-copy"><b>FILM GRAIN</b><span>ARCHIVE TRANSMISSION TEXTURE</span></span><input id="openingGrain" class="opening-toggle" type="checkbox"></label>
        <label class="opening-setting"><span class="opening-setting-copy"><b>IMPACT DETAIL</b><span>MISSILE DEBRIS AND FULL SMOKE PLUMES</span></span><input id="openingDetail" class="opening-toggle" type="checkbox"></label>
      </div>
    </section>

    <section class="opening-cutscene-ui" aria-label="The Last Transmission cutscene" hidden>
      <header class="opening-cutscene-header"><span class="opening-rec"><i></i> ORBITAL RELAY 7</span><span>FULL-GLOBE STRATEGIC TRACKING</span><span id="openingTimecode">T+00:00:00</span></header>
      <div class="opening-cutscene-controls"><button id="openingFullscreen" type="button">FULLSCREEN</button><button id="openingSkip" type="button">SKIP INTRO ›</button></div>
      <div class="opening-threat" hidden><i></i> GLOBAL STRATEGIC EXCHANGE <span>MULTIPLE BALLISTIC TRACKS CONFIRMED</span></div>
      <div class="opening-factions" hidden><span><i class="nato"></i>NATO / UNITED STATES</span><b>VERSUS</b><span><i class="east"></i>RUSSIA / CHINA / DPRK</span></div>
      <aside class="opening-telemetry" hidden><p>MISSILES IN FLIGHT</p><strong id="openingFlights">00</strong><p>CONFIRMED IMPACTS</p><strong id="openingImpacts" class="danger">00</strong><p>NETWORK COLLAPSE</p><strong id="openingCollapse" class="danger">00%</strong></aside>
      <div class="opening-track" hidden><span>ACTIVE BALLISTIC TRACK</span><strong id="openingFrom"></strong><i>→</i><strong id="openingTo"></strong></div>
      <div class="opening-subtitle" hidden></div>
      <div class="opening-archive"><p>ARCHIVE FILE // EXTINCTION EVENT</p><h2>THE LAST<br>TRANSMISSION</h2><span>GLOBAL VIEW — STABLE MOBILE RENDER</span></div>
      <div class="opening-lost" hidden><p>GLOBAL NETWORK STATUS</p><h2>LOST <span>SIGNAL</span></h2><div></div><strong>WORLDWIDE COMMUNICATION FAILURE</strong></div>
      <div class="opening-audio-badge">ORIGINAL AUDIO // TAKE SHELTER NOW // 62.20 SEC</div>
    </section>

    <div class="opening-audio-gate" hidden><p>AUDIO PLAYBACK WAS PAUSED BY THIS DEVICE</p><button type="button">PLAY CUTSCENE WITH AUDIO</button></div>
    <div class="opening-handoff" hidden><b>OPENING PROTOCOL COMPLETE</b><div class="opening-loader"><i></i></div><p id="openingHandoffText">PREPARING SHELTER 47…</p></div>
    <div class="opening-failure" hidden><b>SHELTER STARTUP FAILED</b><p id="openingFailureText"></p></div>
  `;
}

export function createOpeningExperience({ hasSave = false, onEnter, onSequenceStart, onSettingsChange } = {}) {
  const root = document.getElementById('opening-root');
  if (!root) throw new Error('Opening root is missing from the document.');
  let settings = readOpeningSettings();
  root.innerHTML = markup(hasSave);
  root.classList.toggle('film-grain', settings.filmGrain);
  document.body.classList.add('opening-active');

  const canvas = root.querySelector('canvas');
  const menu = root.querySelector('.opening-menu');
  const settingsPanel = root.querySelector('.opening-settings');
  const cutscene = root.querySelector('.opening-cutscene-ui');
  const audioGate = root.querySelector('.opening-audio-gate');
  const handoff = root.querySelector('.opening-handoff');
  const failure = root.querySelector('.opening-failure');
  const fade = root.querySelector('.opening-fade');
  const renderer = createGlobeRenderer(canvas, () => settings);
  const audio = new Audio(`${import.meta.env.BASE_URL}assets/audio/take-shelter-now.mp3`);
  audio.preload = 'auto';
  audio.playsInline = true;

  const elements = {
    threat: root.querySelector('.opening-threat'),
    factions: root.querySelector('.opening-factions'),
    telemetry: root.querySelector('.opening-telemetry'),
    track: root.querySelector('.opening-track'),
    subtitle: root.querySelector('.opening-subtitle'),
    archive: root.querySelector('.opening-archive'),
    lost: root.querySelector('.opening-lost'),
    timecode: root.querySelector('#openingTimecode'),
    flights: root.querySelector('#openingFlights'),
    impacts: root.querySelector('#openingImpacts'),
    collapse: root.querySelector('#openingCollapse'),
    from: root.querySelector('#openingFrom'),
    to: root.querySelector('#openingTo'),
    engine: root.querySelector('#openingEngine'),
    handoff: root.querySelector('#openingHandoffText'),
    failure: root.querySelector('#openingFailureText'),
  };

  let mode = 'menu';
  let pendingRestore = false;
  let finished = false;
  let animationFrame = 0;
  let menuEpoch = performance.now();
  let cutsceneEpoch = 0;
  let audioFailed = false;
  let lastUi = -1;

  function applySettings() {
    root.classList.toggle('film-grain', settings.filmGrain);
    audio.volume = clamp(settings.master / 100 * settings.broadcast / 100, 0, 1);
    writeOpeningSettings(settings);
    onSettingsChange?.({ ...settings });
  }

  const master = root.querySelector('#openingMaster');
  const broadcast = root.querySelector('#openingBroadcast');
  const subtitles = root.querySelector('#openingSubtitles');
  const grain = root.querySelector('#openingGrain');
  const detail = root.querySelector('#openingDetail');
  const masterOut = root.querySelector('#openingMasterOut');
  const broadcastOut = root.querySelector('#openingBroadcastOut');
  master.value = settings.master;
  broadcast.value = settings.broadcast;
  subtitles.checked = settings.subtitles;
  grain.checked = settings.filmGrain;
  detail.checked = settings.impactDetail;

  const syncControls = () => {
    settings = {
      master: Number(master.value),
      broadcast: Number(broadcast.value),
      subtitles: subtitles.checked,
      filmGrain: grain.checked,
      impactDetail: detail.checked,
    };
    masterOut.value = `${settings.master}%`;
    broadcastOut.value = `${settings.broadcast}%`;
    applySettings();
  };
  [master, broadcast, subtitles, grain, detail].forEach((input) => input.addEventListener('input', syncControls));
  syncControls();

  function updateCutsceneUi(time, readings) {
    const visibleExchange = time >= EXCHANGE_START && time < FINAL_COLLAPSE;
    elements.threat.hidden = !visibleExchange;
    elements.factions.hidden = !visibleExchange;
    elements.telemetry.hidden = !visibleExchange;
    elements.track.hidden = !visibleExchange || !readings.activeStrike;
    elements.archive.hidden = time >= 6.75;
    elements.lost.hidden = time < FINAL_COLLAPSE;
    elements.flights.textContent = String(readings.trajectoryCount).padStart(2, '0');
    elements.impacts.textContent = String(readings.impactCount).padStart(2, '0');
    elements.collapse.textContent = `${String(readings.collapse).padStart(2, '0')}%`;
    if (readings.activeStrike) {
      elements.from.textContent = readings.activeStrike.fromName;
      elements.to.textContent = readings.activeStrike.toName;
    }
    const caption = storyCaption(time);
    elements.subtitle.hidden = !settings.subtitles || !caption;
    elements.subtitle.textContent = caption;
    elements.timecode.textContent = `T+${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}:${String(Math.floor(time % 1 * 100)).padStart(2, '0')}`;
    fade.style.opacity = time < 1.25 ? String(1 - time / 1.25)
      : (time > 60.45 ? String(clamp((time - 60.45) / 1.55, 0, .92)) : '0');
  }

  function frame(now) {
    if (root.hidden) return;
    if (mode === 'menu' || mode === 'settings') {
      renderer.render((now - menuEpoch) / 1000, 'menu');
    } else if (mode === 'cutscene') {
      const time = clamp(audioFailed ? (now - cutsceneEpoch) / 1000 : audio.currentTime, 0, OPENING_LENGTH);
      const readings = renderer.render(time, 'cutscene');
      if (time - lastUi > .055 || time >= OPENING_LENGTH - .04) {
        updateCutsceneUi(time, readings);
        lastUi = time;
      }
      if (time >= OPENING_LENGTH - .04) void completeCutscene();
    }
    animationFrame = requestAnimationFrame(frame);
  }

  async function completeCutscene() {
    if (finished) return;
    finished = true;
    mode = 'handoff';
    audio.pause();
    cutscene.hidden = true;
    audioGate.hidden = true;
    handoff.hidden = false;
    fade.style.opacity = '0';
    try {
      await onEnter?.({ restore: pendingRestore, settings: { ...settings } });
      hide();
    } catch (error) {
      showFailure(error);
    }
  }

  function startCutscene(restore) {
    if (mode === 'cutscene') return;
    pendingRestore = restore;
    finished = false;
    audioFailed = false;
    lastUi = -1;
    mode = 'cutscene';
    root.classList.add('is-cutscene');
    menu.hidden = true;
    settingsPanel.hidden = true;
    failure.hidden = true;
    handoff.hidden = true;
    cutscene.hidden = false;
    audioGate.hidden = true;
    fade.style.opacity = '1';
    audio.currentTime = 0;
    audio.volume = clamp(settings.master / 100 * settings.broadcast / 100, 0, 1);
    cutsceneEpoch = performance.now();
    onSequenceStart?.({ settings: { ...settings } });
    void enterLandscapeFullscreen();
    const play = audio.play();
    if (play) play.catch(() => { audioGate.hidden = false; });
  }

  function showFailure(error) {
    mode = 'failure';
    audio.pause();
    menu.hidden = true;
    cutscene.hidden = true;
    handoff.hidden = true;
    audioGate.hidden = true;
    failure.hidden = false;
    elements.failure.textContent = String(error?.message || error || 'The game could not start.');
  }

  function hide() {
    audio.pause();
    root.hidden = true;
    document.body.classList.remove('opening-active');
    cancelAnimationFrame(animationFrame);
  }

  root.querySelector('#openingContinue').addEventListener('click', () => startCutscene(true));
  root.querySelector('#openingNew').addEventListener('click', () => startCutscene(false));
  root.querySelector('#openingSettings').addEventListener('click', () => {
    mode = 'settings';
    settingsPanel.hidden = false;
  });
  root.querySelector('.opening-close').addEventListener('click', () => {
    mode = 'menu';
    settingsPanel.hidden = true;
  });
  root.querySelector('#openingSkip').addEventListener('click', () => void completeCutscene());
  root.querySelector('#openingFullscreen').addEventListener('click', () => void enterLandscapeFullscreen());
  root.querySelector('.opening-audio-gate button').addEventListener('click', () => {
    const play = audio.play();
    if (play) play.then(() => { audioGate.hidden = true; }).catch(() => {});
  });
  audio.addEventListener('ended', () => void completeCutscene());
  audio.addEventListener('error', () => {
    audioFailed = true;
    cutsceneEpoch = performance.now();
    audioGate.hidden = true;
  });

  animationFrame = requestAnimationFrame(frame);

  return {
    get settings() { return { ...settings }; },
    hide,
    fail: showFailure,
    setLoadStatus(text) {
      elements.engine.textContent = text;
      elements.handoff.textContent = text;
    },
    setReady() {
      elements.engine.textContent = 'SHELTER 47 READY';
      elements.handoff.textContent = 'ENTERING SHELTER 47…';
    },
  };
}
