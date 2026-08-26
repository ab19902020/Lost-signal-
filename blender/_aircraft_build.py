"""The light aircraft.

A high-wing single, built as surfaces. The old one was eleven boxes and four
cylinders, which is fine as a placeholder and reads as a placeholder from any
angle: the fuselage was a drainpipe, the wing was a plank, and the propeller
was two more planks crossed over. This is the same aeroplane drawn properly —
a lofted fuselage that tapers to the tail, a real aerofoil on every flying
surface, control surfaces hung off the hinge lines they actually turn about,
glass that follows the roof line, a spinner, sprung legs, spatted wheels and a
cabin with something in it.

Everything the runtime moves is left as its own object with its pivot on the
hinge: Aileron_L/R, Elevator, Rudder, Wheel_Main_L/R, Wheel_Nose, Plane_Prop
and Disc_Blur. Everything else joins into Plane_Hull.

Authored +Y up, nose down -Z.
"""
import bpy
import math

from _aircraft_body import (skin, section, ring_at, aerofoil, foil_edge,
                            place_ring, revolve, set_origin, join_objects,
                            section_point, interpolate)

RING = 28          # points around a fuselage station
TOP = RING // 4    # index of the point on the crown


def build(mat):
    """Build the aeroplane. `mat(name, colour, metallic, roughness)` makes one."""
    paint = mat('Plane_Paint', (.395, .400, .383), metallic=.12, roughness=.52)
    trim = mat('Plane_Trim', (.232, .073, .038), metallic=.16, roughness=.54)
    charcoal = mat('Plane_Charcoal', (.043, .045, .047), metallic=.10, roughness=.62)
    alloy = mat('Plane_Alloy', (.240, .248, .262), metallic=.88, roughness=.34)
    chrome = mat('Plane_Chrome', (.400, .410, .430), metallic=.94, roughness=.17)
    glass = mat('Plane_Glass', (.036, .052, .062), metallic=.06, roughness=.09)
    rubber = mat('Plane_Tyre', (.024, .024, .026), metallic=.0, roughness=.94)
    cabin = mat('Plane_Cabin', (.062, .058, .053), metallic=.04, roughness=.86)
    hide = mat('Plane_Hide', (.098, .070, .050), metallic=.03, roughness=.78)
    dial = mat('Plane_Panel', (.030, .032, .034), metallic=.20, roughness=.42)

    # --- Fuselage ----------------------------------------------------------
    # Station lines: (z, half-width, half-height, centre, squareness, belly).
    # The cabin is the widest and tallest part and the section squares off
    # through it, because that is where the doors and the floor are; forward of
    # the firewall it rounds into the cowl and aft of the baggage bay it
    # collapses into a tail boom.
    STATIONS = [
        (-3.02, .385, .326, .040, 2.7, .96),
        (-2.74, .500, .414, .036, 2.7, .96),
        (-2.32, .570, .462, .030, 2.6, .95),
        (-1.98, .606, .484, .028, 2.5, .93),
        # The windscreen. Without a real rake here the roof simply runs on
        # forward and the glass over it reads as a sunroof.
        (-1.84, .618, .500, .030, 2.5, .92),
        (-1.60, .636, .620, .056, 2.35, .90),
        (-1.36, .654, .742, .080, 2.25, .88),
        (-1.16, .664, .790, .090, 2.2, .87),
        (-0.92, .672, .804, .092, 2.2, .86),
        (-0.30, .680, .812, .086, 2.2, .86),
        (0.34, .672, .792, .078, 2.2, .86),
        (0.94, .630, .716, .072, 2.3, .88),
        (1.52, .560, .606, .082, 2.4, .92),
        (2.14, .462, .500, .112, 2.4, .95),
        (2.80, .372, .420, .160, 2.4, .97),
        (3.46, .282, .338, .212, 2.3, 1.0),
        (4.06, .212, .280, .252, 2.2, 1.0),
        (4.56, .150, .228, .282, 2.1, 1.0),
        (4.86, .076, .158, .300, 2.0, 1.0),
    ]
    # Built from the same smooth interpolation the panels lying on it use.
    # Bridging the station list directly makes the hull a series of straight
    # runs between stations while a window curves between them, so the glass
    # dips below the skin in the middle of every bay and the whole cabin comes
    # out speckled where the two surfaces cross.
    SAMPLES = 72
    rings = []
    for i in range(SAMPLES + 1):
        z = STATIONS[0][0] + (STATIONS[-1][0] - STATIONS[0][0]) * (i / SAMPLES)
        hw, hh, cy, power, belly = interpolate(STATIONS, z)
        rings.append(ring_at(z, section(hw, hh, cy, points=RING, power=power,
                                        belly=belly)))
    skin('Hull_Body', rings, paint)

    # Anything that lies on the skin — glass, trim, the anti-glare panel — is
    # the hull's own surface evaluated where the feature wants to be and
    # nudged outward, so it follows the curve exactly at any resolution.
    def hull_at(z, angle):
        hw, hh, cy, power, belly = interpolate(STATIONS, z)
        x, y = section_point(hw, hh, cy, power, belly, angle)
        return (x, y, z)

    def hull_point(z, angle, lift=.012):
        """A point `lift` metres out from the skin, along its normal.

        Standing a panel off by a percentage of the section looked right on the
        cabin and was nothing at all down the tail boom, where the fuselage is
        a fifth as wide — so the cheatline sank into the skin aft of the wing
        and the windscreen speckled wherever the hull curved fastest. A fixed
        distance along the normal is the same clearance everywhere.
        """
        e = 2e-3
        here = hull_at(z, angle)
        da = hull_at(z, angle + e)
        dz = hull_at(z + e, angle)
        ta = [da[i] - here[i] for i in range(3)]
        tz = [dz[i] - here[i] for i in range(3)]
        n = [ta[1] * tz[2] - ta[2] * tz[1],
             ta[2] * tz[0] - ta[0] * tz[2],
             ta[0] * tz[1] - ta[1] * tz[0]]
        length = math.sqrt(sum(c * c for c in n)) or 1.0
        # Point it outward: away from the section's own centre.
        cy = interpolate(STATIONS, z)[2]
        outward = (here[0] - 0) * n[0] + (here[1] - cy) * n[1]
        sign = -1.0 if outward < 0 else 1.0
        return tuple(here[i] + n[i] / length * lift * sign for i in range(3))

    def patch(name, material, z_range, angle, half, lift=.012, nz=10, na=5,
              taper=.30, drift=None):
        """A panel lying on the skin.

        `angle` is where it sits around the section and `half` how far it
        reaches either side; `taper` rounds the two ends off, which is the
        difference between a window and a rectangle of black paint.
        """
        z0, z1 = z_range
        rows = []
        for i in range(nz + 1):
            t = i / nz
            z = z0 + (z1 - z0) * t
            # Ease the width to nothing at each end.
            edge = min(t, 1 - t) / max(taper, 1e-6)
            width = half * (1.0 if edge >= 1 else edge ** .42)
            centre = angle + (drift(t) if drift else 0.0)
            rows.append([hull_point(z, centre - width + 2 * width * (j / na), lift)
                         for j in range(na + 1)])
        return skin(name, rows, material, closed=False, cap_start=False,
                    cap_end=False)

    UP = math.pi / 2
    # The glasshouse. A high-wing single is mostly window, and the windows are
    # the difference between an aeroplane and a fuselage-shaped object.
    patch('Hull_Screen', glass, (-1.88, -1.18), UP, .78, lift=.013, taper=.16,
          nz=16)
    patch('Hull_Skylight', glass, (-1.14, -0.58), UP, .30, lift=.011, taper=.34)
    for side in (1, -1):
        tag = 'R' if side > 0 else 'L'
        # Angles are measured from the widest point of the section; the port
        # side is the same window read backwards round the hull.
        def at(a, side=side):
            return a if side > 0 else math.pi - a
        patch(f'Hull_Door_Glass_{tag}', glass, (-1.18, 0.14), at(0.54), .60,
              lift=.012, taper=.20, nz=14, na=7)
        patch(f'Hull_Quarter_{tag}', glass, (0.30, 1.22), at(0.52), .46,
              lift=.012, taper=.28, nz=12, na=7)
    # Anti-glare, so the sun off the cowl does not come back up at the pilot.
    patch('Hull_AntiGlare', charcoal, (-2.52, -1.90), UP, .60, lift=.010,
          taper=.20)

    # A cheatline down each side, sweeping up over the tail. Modelled rather
    # than painted: there is nothing textured anywhere in this project, so the
    # stripe has to be geometry, and geometry that follows the hull.
    def sweep(t):
        # Low at the nose, climbing aft — the shape every light single wears.
        return -0.30 + 1.16 * (t ** 1.7)
    for side in (1, -1):
        tag = 'R' if side > 0 else 'L'
        rows = []
        for i in range(26):
            t = i / 25
            z = -2.66 + (4.62 + 2.66) * t
            centre = sweep(t)
            if side < 0:
                centre = math.pi - centre
            hi = .085 * (1 - .45 * t)
            rows.append([hull_point(z, centre - hi + 2 * hi * (j / 3), .010)
                         for j in range(4)])
        skin(f'Hull_Stripe_{tag}', rows, trim, closed=False, cap_start=False,
             cap_end=False)
        # A thin second line under it, which is what stops one stripe reading
        # as a mistake.
        rows = []
        for i in range(26):
            t = i / 25
            z = -2.66 + (4.62 + 2.66) * t
            centre = sweep(t) - .175
            if side < 0:
                centre = math.pi - centre
            hi = .026
            rows.append([hull_point(z, centre - hi + 2 * hi * (j / 2), .012)
                         for j in range(3)])
        skin(f'Hull_Pinstripe_{tag}', rows, charcoal, closed=False,
             cap_start=False, cap_end=False)

        # The door itself: a raised outline, so it reads as something that
        # opens rather than as a window painted on a wall.
        _door_outline(f'Hull_DoorLine_{tag}', hull_point, side, charcoal)

    # --- Wing --------------------------------------------------------------
    # (span, chord, y, leading edge z, twist). Washout: the tip flies at a
    # lower angle than the root so the root stalls first and the wing drops
    # straight ahead instead of rolling over.
    PANELS = [
        (0.00, 1.680, 1.000, -0.980, .030),
        (1.30, 1.660, 1.012, -0.962, .028),
        (2.60, 1.560, 1.032, -0.900, .022),
        (3.90, 1.404, 1.060, -0.802, .014),
        (4.90, 1.262, 1.088, -0.722, .006),
        (5.34, 1.146, 1.104, -0.664, .000),
        (5.52, 0.880, 1.112, -0.520, .000),
        (5.60, 0.420, 1.114, -0.300, .000),
    ]
    CUT = .72                       # the wing box ends at the hinge line
    for side, tag in ((-1, 'L'), (1, 'R')):
        box = []
        for span, chord, y, z_le, twist in PANELS:
            foil = aerofoil(chord, thickness=.12, camber=.02, points=18, cut=CUT)
            box.append(place_ring(foil, side * span, z_le, y, twist))
        skin(f'Hull_Wing_{tag}', box, paint)

        # Flaps inboard, ailerons outboard, each a wedge off the hinge line.
        _surface(f'Hull_Flap_{tag}', side, PANELS, 0.72, 2.86, CUT, paint,
                 hinge_origin=False)
        aileron = _surface(f'Aileron_{tag}', side, PANELS, 3.06, 5.24, CUT, trim,
                           hinge_origin=True)

        # Struts: a high wing is held up by two of them and they are the most
        # recognisable thing on the aeroplane after the wing itself.
        for z_top, z_bot, thick in ((-0.62, -0.10, .052), (0.28, 0.30, .044)):
            _strut(f'Hull_Strut_{tag}_{"F" if z_top < 0 else "R"}',
                   (side * 2.42, 1.000, z_top), (side * 0.60, -0.480, z_bot),
                   thick, alloy)

        # Tip: nav light, and a light in the leading edge to land by.
        nav = mat(f'Plane_Nav_{tag}', (.52, .05, .04) if side < 0 else (.05, .46, .12),
                  metallic=.0, roughness=.26)
        revolve(f'Hull_Nav_{tag}', [(-.06, .02), (0, .085), (.07, .05), (.10, .0)],
                nav, axis='x', centre=(side * 5.60, 1.114, -0.16), segments=12)
        revolve(f'Hull_LandLight_{tag}',
                [(0, .0), (.03, .10), (.06, .105), (.07, .06)],
                mat('Plane_Lens', (.62, .60, .50), metallic=.10, roughness=.15),
                axis='z', centre=(side * 2.10, 1.006, -0.906), segments=12)

    # The wing sits straight onto the roof: the cabin crown is at .896 and the
    # wing's underside at the root is .90, so they meet on their own. An added
    # blister here was half inside the hull and z-fought with it, which is what
    # put a speckled grey patch across the top of the cabin.
    # --- Tail --------------------------------------------------------------
    FIN = [
        (0.20, 1.560, 3.180),
        (0.78, 1.420, 3.360),
        (1.32, 1.230, 3.606),
        (1.76, 1.020, 3.836),
        (1.98, 0.760, 4.010),
        (2.06, 0.430, 4.120),
    ]
    fin_box = []
    for y, chord, z_le in FIN:
        foil = aerofoil(chord, thickness=.11, camber=0, points=14, cut=.62)
        # A fin is the same section stood on edge.
        fin_box.append([(vy, y, z_le + vx) for vx, vy in foil])
    skin('Hull_Fin', fin_box, paint)
    # Dorsal fillet, which is what stops the fin looking stuck on.
    skin('Hull_Dorsal', [
        [(0, .30 + i * .0, 2.10) for i in range(2)],
        [(0.030, .34, 2.60), (-0.030, .34, 2.60)],
        [(0.045, .52, 3.05), (-0.045, .52, 3.05)],
        [(0.050, .20 + FIN[0][0], FIN[0][2]), (-0.050, .20 + FIN[0][0], FIN[0][2])],
    ], paint, closed=True)
    rudder = _fin_surface('Rudder', FIN, .62, trim)

    STAB = [
        (0.00, 1.180, 0.640, 3.640),
        (0.90, 1.100, 0.652, 3.706),
        (1.70, 0.980, 0.668, 3.804),
        (2.20, 0.840, 0.680, 3.900),
        (2.36, 0.560, 0.686, 3.990),
    ]
    for side, tag in ((-1, 'L'), (1, 'R')):
        stab = []
        for span, chord, y, z_le in STAB:
            foil = aerofoil(chord, thickness=.10, camber=0, points=14, cut=.60)
            stab.append(place_ring(foil, side * span, z_le, y, 0))
        skin(f'Hull_Stab_{tag}', stab, paint)
    elevator = _tail_surface('Elevator', STAB, .60, trim)

    # --- Nose, cowl and propeller ------------------------------------------
    revolve('Hull_Spinner', [
        (-3.360, .010), (-3.320, .062), (-3.250, .118), (-3.160, .166),
        (-3.060, .196), (-3.000, .205),
    ], chrome, axis='z', centre=(0, .045, 0), segments=22)
    # Cooling inlets either side of the spinner.
    for side, tag in ((-1, 'L'), (1, 'R')):
        revolve(f'Hull_Inlet_{tag}', [(-3.020, .105), (-2.900, .118), (-2.760, .112)],
                charcoal, axis='z', centre=(side * .225, -.055, 0), segments=12)
    # Exhaust, under the cowl on the left.
    revolve('Hull_Exhaust', [(-2.70, .046), (-2.35, .050), (-2.28, .058)],
            charcoal, axis='z', centre=(-.20, -.300, 0), segments=10)

    blades = []
    for index in range(2):
        turn = index * math.pi
        rings = []
        for radius, chord, twist in ((0.100, .150, .62), (0.240, .225, .52),
                                     (0.480, .238, .38), (0.720, .222, .26),
                                     (0.920, .188, .18), (1.040, .120, .13),
                                     (1.080, .034, .11)):
            foil = aerofoil(chord, thickness=.14, camber=.03, points=12)
            ring = []
            for cx, cy in foil:
                # Chordwise across the disc, thickness along the thrust axis.
                bx = cx - chord * .42
                px = bx * math.cos(twist) - cy * math.sin(twist)
                pz = bx * math.sin(twist) + cy * math.cos(twist)
                ring.append((px * math.cos(turn) - radius * math.sin(turn),
                             px * math.sin(turn) + radius * math.cos(turn),
                             pz))
            rings.append(ring)
        blades.append(skin(f'Blade_{index}', rings, charcoal))
    hub = revolve('Blade_Hub', [(-.10, .10), (-.04, .155), (.04, .155), (.09, .10)],
                  alloy, axis='z', centre=(0, 0, 0), segments=16)
    prop = join_objects('Plane_Prop', blades + [hub])
    prop.location = (0, .045, -3.120)

    # The disc it becomes when it is turning.
    # What the propeller becomes at speed. A solid plate on the nose is worse
    # than nothing, so this is nearly clear — it is meant to read as the air
    # being disturbed, not as a disc of metal.
    disc_material = mat('Plane_Disc', (.145, .148, .155), metallic=.10, roughness=.62)
    _translucent(disc_material, .22)
    revolve('Disc_Blur', [(-.004, 1.062), (0, 1.080), (.004, 1.062)],
            disc_material, axis='z', centre=(0, .045, -3.120), segments=30)

    # --- Undercarriage ------------------------------------------------------
    for side, tag in ((-1, 'L'), (1, 'R')):
        _strut(f'Hull_Leg_{tag}', (side * .34, -.480, .200), (side * 1.120, -.985, .200),
               .058, alloy, taper=.62)
        tyre = revolve(f'Tyre_{tag}', _tyre_profile(.360, .150), rubber,
                       axis='x', centre=(side * 1.120, -1.000, .200), segments=22)
        hubcap = revolve(f'Hub_{tag}', [
            (-.080, .0), (-.075, .105), (-.030, .150), (.030, .150),
            (.075, .105), (.080, .0),
        ], alloy, axis='x', centre=(side * 1.120, -1.000, .200), segments=18)
        wheel = join_objects(f'Wheel_Main_{tag}', [tyre, hubcap])
        set_origin(wheel, (side * 1.120, -1.000, .200))
        # Spat, which is most of what a tidy light single's gear looks like.
        _spat(f'Hull_Spat_{tag}', (side * 1.120, -1.000, .200), paint)

    # Nose leg: a trunnion off the firewall, a chromed oleo that visibly
    # telescopes into it, a torque link across the join and a fork round the
    # wheel. The first version was a stub and a wheel, and from anywhere near
    # the front of the aeroplane the wheel looked unattached.
    _strut('Hull_NoseTrunnion', (0, -.470, -1.360), (0, -.660, -1.610), .078,
           alloy, taper=.86)
    _strut('Hull_NoseLeg', (0, -.640, -1.585), (0, -.905, -1.700), .066, alloy,
           taper=.80)
    revolve('Hull_Oleo', [(-.13, .045), (.10, .045), (.12, .039)], chrome,
            axis='y', centre=(0, -.905, -1.700), segments=14)
    for side in (-1, 1):
        tag = 'R' if side > 0 else 'L'
        _strut(f'Hull_Fork_{tag}', (side * .038, -.930, -1.700),
               (side * .098, -1.060, -1.700), .034, alloy, taper=.72)
        # Torque link, the scissor that stops the leg turning in its own barrel.
        _strut(f'Hull_Link_{tag}', (side * .052, -.700, -1.628),
               (side * .062, -.830, -1.640), .020, charcoal)
        _strut(f'Hull_Link2_{tag}', (side * .062, -.830, -1.640),
               (side * .050, -.930, -1.672), .018, charcoal)
    # Mudguard over the nosewheel.
    _spat('Hull_NoseGuard', (0, -1.060, -1.700), paint, scale=.66)
    nose_tyre = revolve('Tyre_Nose', _tyre_profile(.300, .126), rubber,
                        axis='x', centre=(0, -1.060, -1.700), segments=20)
    nose_hub = revolve('Hub_Nose', [
        (-.066, .0), (-.062, .088), (-.026, .124), (.026, .124), (.062, .088),
        (.066, .0),
    ], alloy, axis='x', centre=(0, -1.060, -1.700), segments=16)
    nose_wheel = join_objects('Wheel_Nose', [nose_tyre, nose_hub])
    set_origin(nose_wheel, (0, -1.060, -1.700))

    # --- Cabin --------------------------------------------------------------
    # Only what can be seen through the glass, which from outside is the seats
    # and the top of the panel, and from the pilot's seat is the panel and the
    # yoke in front of them.
    skin('Hull_Floor', [
        [(-.60, -.28, -1.30), (.60, -.28, -1.30)],
        [(-.62, -.30, 0.30), (.62, -.30, 0.30)],
        [(-.55, -.28, 1.30), (.55, -.28, 1.30)],
    ], cabin, closed=False, cap_start=False, cap_end=False)
    # Panel and glareshield.
    skin('Hull_Panel', [
        [(-.62, .04, -1.36), (.62, .04, -1.36)],
        [(-.64, .34, -1.30), (.64, .34, -1.30)],
        [(-.64, .38, -1.12), (.64, .38, -1.12)],
    ], dial, closed=False, cap_start=False, cap_end=False)
    skin('Hull_Glare', [
        [(-.64, .40, -1.14), (.64, .40, -1.14)],
        [(-.62, .36, -0.94), (.62, .36, -0.94)],
    ], charcoal, closed=False, cap_start=False, cap_end=False)
    for side, tag in ((-1, 'L'), (1, 'R')):
        # Seat: a base and a back, which is all that reads at this size.
        _boxish(f'Hull_SeatBase_{tag}', (side * .33, -.10, -.28), (.24, .07, .28), hide)
        _boxish(f'Hull_SeatBack_{tag}', (side * .33, .26, .06), (.24, .32, .07), hide)
        _boxish(f'Hull_SeatRear_{tag}', (side * .33, -.06, .74), (.22, .07, .24), hide)
        # Yoke.
        revolve(f'Hull_Column_{tag}', [(-.30, .026), (0, .030)], charcoal,
                axis='z', centre=(side * .33, .20, -1.02), segments=8)
        _boxish(f'Hull_Yoke_{tag}', (side * .33, .20, -.98), (.16, .022, .030), charcoal)

    # --- Aerials and odds ---------------------------------------------------
    _boxish('Hull_Antenna', (0, .92, 0.58), (.014, .105, .085), charcoal)
    revolve('Hull_Beacon', [(0, .05), (.055, .06), (.10, .028)],
            mat('Plane_Beacon', (.56, .06, .05), metallic=.0, roughness=.28),
            axis='y', centre=(0, 2.06, 4.06), segments=10)
    revolve('Hull_Pitot', [(-.16, .014), (.10, .014)], alloy, axis='z',
            centre=(-1.70, .952, -0.92), segments=8)
    for side, tag in ((-1, 'L'), (1, 'R')):
        _boxish(f'Hull_Step_{tag}', (side * .72, -.56, .28), (.10, .022, .13), alloy)

    return {
        'movable': ['Plane_Prop', 'Disc_Blur', 'Aileron_L', 'Aileron_R',
                    'Elevator', 'Rudder', 'Wheel_Main_L', 'Wheel_Main_R',
                    'Wheel_Nose'],
    }


# --- Pieces used more than once ---------------------------------------------

def _surface(name, side, panels, span_from, span_to, cut, material,
             hinge_origin):
    """A flap or an aileron: a wedge hung off the wing's hinge line."""
    rings = []
    hinge_point = None
    for span, chord, y, z_le, twist in panels:
        if span < span_from - 1e-6 or span > span_to + 1e-6:
            continue
        rings.append((span, chord, y, z_le, twist))
    # Make sure the surface starts and stops where it was asked to, not at
    # whichever wing station happened to be nearest.
    rings = [_interp_panel(panels, span_from)] + rings + [_interp_panel(panels, span_to)]
    seen, ordered = set(), []
    for entry in rings:
        if round(entry[0], 4) in seen:
            continue
        seen.add(round(entry[0], 4))
        ordered.append(entry)
    ordered.sort(key=lambda e: e[0])

    sections = []
    for span, chord, y, z_le, twist in ordered:
        zc, up, lo = foil_edge(chord, cut, thickness=.12, camber=.02)
        tip = chord * .995
        _, te_up, te_lo = foil_edge(chord, .995, thickness=.12, camber=.02)
        mid = (te_up + te_lo) / 2
        pts = [(zc, up), (tip, mid + .008), (tip, mid - .008), (zc, lo)]
        sections.append(place_ring(pts, side * span, z_le, y, twist))
        if hinge_point is None:
            hinge_point = place_ring([(zc, (up + lo) / 2)], side * span, z_le, y,
                                     twist)[0]
    o = skin(name, sections, material)
    if hinge_origin:
        # Turn about the hinge line, which for a wing runs out along the span.
        set_origin(o, (0.0, hinge_point[1], hinge_point[2]))
    return o


def _interp_panel(panels, span):
    """A wing station at an arbitrary place along the span."""
    for a, b in zip(panels, panels[1:]):
        if a[0] - 1e-6 <= span <= b[0] + 1e-6:
            t = 0 if b[0] == a[0] else (span - a[0]) / (b[0] - a[0])
            return tuple(a[i] + (b[i] - a[i]) * t for i in range(5))
    return panels[-1]


def _tail_surface(name, stab, cut, material):
    """The elevator: one piece across both tailplanes, hinged on X."""
    sections = []
    hinge = None
    for side in (-1, 1):
        entries = stab if side > 0 else list(reversed(stab))
        for span, chord, y, z_le in entries:
            zc, up, lo = foil_edge(chord, cut, thickness=.10, camber=0)
            tip = chord * .99
            pts = [(zc, up), (tip, .008), (tip, -.008), (zc, lo)]
            sections.append(place_ring(pts, side * span, z_le, y, 0))
            if hinge is None:
                hinge = (0.0, y, z_le + zc)
    o = skin(name, sections, material)
    set_origin(o, hinge)
    return o


def _fin_surface(name, fin, cut, material):
    """The rudder: hinged on Y, so its origin sits on the fin post."""
    sections = []
    hinge = None
    for y, chord, z_le in fin:
        zc, up, lo = foil_edge(chord, cut, thickness=.11, camber=0)
        tip = chord * .99
        pts = [(zc, up), (tip, .008), (tip, -.008), (zc, lo)]
        # Stood on edge: the section's own "vertical" is the aeroplane's X.
        sections.append([(vy, y, z_le + vx) for vx, vy in pts])
        if hinge is None:
            hinge = (0.0, 0.0, z_le + zc)
    o = skin(name, sections, material)
    set_origin(o, hinge)
    return o


def _strut(name, start, end, radius, material, taper=1.0, segments=10):
    """A tapered round leg between two points."""
    ax = (end[0] - start[0], end[1] - start[1], end[2] - start[2])
    length = math.sqrt(sum(c * c for c in ax)) or 1e-6
    axis = [c / length for c in ax]
    # Any vector not along the leg gives a usable pair of cross-axes.
    helper = (0, 0, 1) if abs(axis[1]) > .9 else (0, 1, 0)
    u = _cross(axis, helper)
    u = [c / (math.sqrt(sum(v * v for v in u)) or 1e-6) for c in u]
    v = _cross(axis, u)
    rings = []
    for t in (0.0, .35, .7, 1.0):
        r = radius * (1 - (1 - taper) * t)
        centre = [start[i] + ax[i] * t for i in range(3)]
        ring = []
        for i in range(segments):
            a = i * math.tau / segments
            c, s = math.cos(a) * r, math.sin(a) * r
            ring.append(tuple(centre[i] + u[i] * c + v[i] * s for i in range(3)))
        rings.append(ring)
    return skin(name, rings, material)


def _cross(a, b):
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]]


def _tyre_profile(radius, half_width):
    """A tyre in cross-section: a tread with rounded shoulders and a bead."""
    return [
        (-half_width * .55, radius * .42),
        (-half_width * .92, radius * .74),
        (-half_width, radius * .93),
        (-half_width * .72, radius),
        (0, radius * 1.01),
        (half_width * .72, radius),
        (half_width, radius * .93),
        (half_width * .92, radius * .74),
        (half_width * .55, radius * .42),
    ]


def _spat(name, centre, material, scale=1.0):
    """A wheel fairing: a teardrop over the top of the wheel."""
    cx, cy, cz = centre
    rings = []
    for dz, half, top, bottom in ((-.62, .055, .10, -.10), (-.40, .118, .28, -.15),
                                  (-.14, .150, .375, -.19), (.16, .146, .355, -.18),
                                  (.42, .112, .26, -.14), (.62, .048, .10, -.06)):
        half *= scale
        rings.append([
            (cx - half, cy + top * scale, cz + dz * scale),
            (cx - half * .55, cy + (top + .07) * scale, cz + dz * scale),
            (cx + half * .55, cy + (top + .07) * scale, cz + dz * scale),
            (cx + half, cy + top * scale, cz + dz * scale),
            (cx + half * .82, cy + bottom * scale, cz + dz * scale),
            (cx - half * .82, cy + bottom * scale, cz + dz * scale),
        ])
    return skin(name, rings, material)


def _boxish(name, centre, half, material):
    """A rounded slab — a seat cushion, a step, an aerial."""
    cx, cy, cz = centre
    hx, hy, hz = half
    rings = []
    for t, shrink in ((-1, .78), (-.86, 1.0), (.86, 1.0), (1, .78)):
        z = cz + hz * t
        rings.append([
            (cx - hx * shrink, cy - hy * shrink, z),
            (cx + hx * shrink, cy - hy * shrink, z),
            (cx + hx * shrink, cy + hy * shrink, z),
            (cx - hx * shrink, cy + hy * shrink, z),
        ])
    return skin(name, rings, material, smooth=False)


def _door_outline(name, hull_point, side, material):
    """The seam round a cabin door, as a raised bead on the skin."""
    def at(a):
        return a if side > 0 else math.pi - a
    # Front post, roof, rear post, sill — walked as one loop.
    loop = []
    for i in range(7):                      # up the front post
        t = i / 6
        loop.append((-1.22, at(-0.40 + 1.44 * t)))
    for i in range(1, 7):                   # along the roof line
        t = i / 6
        loop.append((-1.22 + 1.42 * t, at(1.04)))
    for i in range(1, 7):                   # down the rear post
        t = i / 6
        loop.append((0.20, at(1.04 - 1.44 * t)))
    for i in range(1, 6):                   # forward along the sill
        t = i / 5
        loop.append((0.20 - 1.42 * t, at(-0.40)))
    rows = []
    for z, angle in loop:
        rows.append([hull_point(z, angle - .022, .015),
                     hull_point(z, angle + .022, .015)])
    rows.append(rows[0])
    return skin(name, rows, material, closed=False, cap_start=False,
                cap_end=False)


def _translucent(material, alpha):
    """Make a material see-through, and make it survive the glTF export."""
    material.blend_method = 'BLEND'
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    colour = bsdf.inputs['Base Color'].default_value
    bsdf.inputs['Base Color'].default_value = (colour[0], colour[1], colour[2], alpha)
    bsdf.inputs['Alpha'].default_value = alpha
    return material
