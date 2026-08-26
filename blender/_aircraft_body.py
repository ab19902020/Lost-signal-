"""Geometry helpers for the light aircraft.

Kept apart from the airstrip so the aeroplane can be built out of surfaces
rather than out of boxes. Everything here works the same way: describe a shape
as a stack of cross-sections and bridge them. That is how a real airframe is
drawn and it is the only way a script produces a shape that reads as an
aeroplane rather than as a pile of cylinders.

Authored +Y up, nose down -Z, to match the rest of the game.
"""
import bpy
import bmesh
import math


def skin(name, rings, material, smooth=True, cap_start=True, cap_end=True,
         closed=True):
    """Bridge a stack of cross-sections into one surface.

    `rings` is a list of equal-length lists of (x, y, z). Consecutive rings are
    joined with quads; the ends are capped unless told otherwise. `closed` is
    whether each ring wraps back on itself — false for an open sheet like a
    windscreen.
    """
    bm = bmesh.new()
    loops = [[bm.verts.new(p) for p in ring] for ring in rings]
    width = len(loops[0])
    for lower, upper in zip(loops, loops[1:]):
        span = width if closed else width - 1
        for i in range(span):
            j = (i + 1) % width
            a, b, c, d = lower[i], lower[j], upper[j], upper[i]
            # A ring may pinch to a point (a nose cone, a wing tip). Dropping
            # the duplicated corner turns the degenerate quad into the triangle
            # it actually is, instead of a zero-area face that shades black.
            corners = [a, b, c, d]
            unique = []
            for vert in corners:
                if vert not in unique:
                    unique.append(vert)
            if len(unique) >= 3:
                try:
                    bm.faces.new(unique)
                except ValueError:
                    pass
    if closed and cap_start and len(set(loops[0])) >= 3:
        try:
            bm.faces.new(loops[0])
        except ValueError:
            pass
    if closed and cap_end and len(set(loops[-1])) >= 3:
        try:
            bm.faces.new(loops[-1])
        except ValueError:
            pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    if smooth:
        for poly in o.data.polygons:
            poly.use_smooth = True
    return o


def section(half_width, half_height, centre_y, points=28, power=2.5,
            belly=1.0):
    """A fuselage cross-section: a superellipse, flattened underneath.

    A pure ellipse gives a tube, and a tube reads as a drainpipe. Real light
    aircraft are rounded on top and much flatter along the belly where the
    floor is, so the exponent squares the section off a little and `belly`
    pulls the lower half in.
    """
    pts = []
    for i in range(points):
        t = i * math.tau / points
        c, s = math.cos(t), math.sin(t)
        x = half_width * math.copysign(abs(c) ** (2.0 / power), c)
        y = half_height * math.copysign(abs(s) ** (2.0 / power), s)
        if y < 0:
            y *= belly
        pts.append((x, centre_y + y))
    return pts


def ring_at(z, profile):
    """Lift a 2-D fuselage section onto its station."""
    return [(x, y, z) for x, y in profile]


def aerofoil(chord, thickness=.12, camber=.02, camber_at=.40, points=20,
             cut=1.0):
    """A NACA four-digit section, nose at 0 and trailing edge at `chord`.

    Cosine spacing, so the leading edge — where all the curvature is — gets the
    points and the flat middle does not waste them. `cut` truncates the section
    at a fraction of the chord, which is how a wing with separate control
    surfaces is actually built: a box back to the hinge line, and the aileron
    or elevator hung off that.
    """
    def camber_line(x):
        if camber <= 0:
            return 0.0, 0.0
        if x < camber_at:
            y = camber / (camber_at ** 2) * (2 * camber_at * x - x * x)
            slope = 2 * camber / (camber_at ** 2) * (camber_at - x)
        else:
            k = (1 - camber_at) ** 2
            y = camber / k * ((1 - 2 * camber_at) + 2 * camber_at * x - x * x)
            slope = 2 * camber / k * (camber_at - x)
        return y, slope

    def half_thickness(x):
        return 5 * thickness * (.2969 * math.sqrt(max(x, 0)) - .1260 * x
                               - .3516 * x * x + .2843 * x ** 3 - .1015 * x ** 4)

    xs = [(1 - math.cos(i * math.pi / (points - 1))) / 2 for i in range(points)]
    xs = [x for x in xs if x <= cut]
    if xs[-1] < cut:
        xs.append(cut)

    upper, lower = [], []
    for x in xs:
        yc, slope = camber_line(x)
        yt = half_thickness(x)
        theta = math.atan(slope)
        upper.append((chord * (x - yt * math.sin(theta)), chord * (yc + yt * math.cos(theta))))
        lower.append((chord * (x + yt * math.sin(theta)), chord * (yc - yt * math.cos(theta))))
    # Round the loop: over the top from the leading edge, back under.
    return upper + list(reversed(lower[1:-1]))


def place_ring(points_2d, span_x, z_leading, y, twist=0.0):
    """Put a wing section on the span, nose at `z_leading`, rotated by `twist`."""
    ring = []
    for cx, cy in points_2d:
        c, s = math.cos(twist), math.sin(twist)
        rx = cx * c - cy * s
        ry = cx * s + cy * c
        # Chordwise runs aft, which is +Z.
        ring.append((span_x, y + ry, z_leading + rx))
    return ring


def revolve(name, profile, material, axis='x', centre=(0, 0, 0), segments=24,
            smooth=True):
    """Spin a profile about an axis — a tyre, a hub, a spinner.

    `profile` is a list of (along_axis, radius) pairs.
    """
    rings = []
    for along, radius in profile:
        ring = []
        for i in range(segments):
            t = i * math.tau / segments
            c, s = math.cos(t) * radius, math.sin(t) * radius
            if axis == 'x':
                ring.append((centre[0] + along, centre[1] + c, centre[2] + s))
            elif axis == 'y':
                ring.append((centre[0] + c, centre[1] + along, centre[2] + s))
            else:
                ring.append((centre[0] + c, centre[1] + s, centre[2] + along))
        rings.append(ring)
    return skin(name, rings, material, smooth=smooth)


def set_origin(o, point):
    """Move an object's pivot without moving the object.

    A control surface has to turn about its hinge. Blender puts the origin
    wherever the geometry was built, so a rotated aileron would swing about the
    middle of the wing and tear itself out of it.
    """
    for vert in o.data.vertices:
        vert.co.x -= point[0]
        vert.co.y -= point[1]
        vert.co.z -= point[2]
    o.location = point
    return o


def join_objects(name, objects):
    """Join an explicit list into one object under a given name."""
    objects = [o for o in objects if o is not None]
    if not objects:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


def foil_edge(chord, x_over_c, thickness=.12, camber=.02, camber_at=.40):
    """The section's aft cut: (chordwise position, upper y, lower y).

    A control surface has to start exactly where the wing box stops, at the
    same thickness, or the hinge line shows a step.
    """
    x = x_over_c
    if camber <= 0:
        yc = 0.0
    elif x < camber_at:
        yc = camber / (camber_at ** 2) * (2 * camber_at * x - x * x)
    else:
        k = (1 - camber_at) ** 2
        yc = camber / k * ((1 - 2 * camber_at) + 2 * camber_at * x - x * x)
    yt = 5 * thickness * (.2969 * math.sqrt(x) - .1260 * x - .3516 * x * x
                          + .2843 * x ** 3 - .1015 * x ** 4)
    return chord * x, chord * (yc + yt), chord * (yc - yt)


def section_point(half_width, half_height, centre_y, power, belly, angle):
    """One point on a fuselage station, at any angle at all.

    The stripe and the windows were first built by picking points out of the
    ring the hull was made from, which only lets a feature sit where a vertex
    already is — and a feature that drifts along the hull then has to slide
    between indices, which twists the band into a zigzag. Evaluating the
    section directly means a window edge is wherever it is asked to be.
    """
    c, s = math.cos(angle), math.sin(angle)
    x = half_width * math.copysign(abs(c) ** (2.0 / power), c)
    y = half_height * math.copysign(abs(s) ** (2.0 / power), s)
    if y < 0:
        y *= belly
    return x, centre_y + y


def interpolate(stations, z):
    """The station parameters part way between two built stations."""
    if z <= stations[0][0]:
        return stations[0][1:]
    if z >= stations[-1][0]:
        return stations[-1][1:]
    for a, b in zip(stations, stations[1:]):
        if a[0] <= z <= b[0]:
            t = 0 if b[0] == a[0] else (z - a[0]) / (b[0] - a[0])
            # Smoothstep, so a patch sampled finely does not show the corners
            # of the coarse station spacing it was interpolated from.
            t = t * t * (3 - 2 * t)
            return tuple(a[i + 1] + (b[i + 1] - a[i + 1]) * t for i in range(5))
    return stations[-1][1:]
