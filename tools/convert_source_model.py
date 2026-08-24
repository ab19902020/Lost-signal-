"""Convert a supplied FBX/OBJ source model into a GLB the game can load.

Run under Blender:

    blender -b --python-exit-code 1 --python tools/convert_source_model.py -- \
        --input "<source>" --output public/assets/supplied/<name>.glb [options]

The third-party packs the shelter now dresses itself from ship FBX and OBJ.
Everything the runtime loads is glTF, so this is the one-way door between the
two. It is deliberately a tool rather than part of the asset build: the sources
are large, licensed separately and are not in the repository, so the GLB it
writes is the artefact that gets committed.
"""

import argparse
import math
import sys
import bpy


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_source(path):
    lower = path.lower()
    if lower.endswith('.fbx'):
        bpy.ops.import_scene.fbx(filepath=path, use_anim=True,
                                 ignore_leaf_bones=True, automatic_bone_orientation=True)
    elif lower.endswith('.obj'):
        bpy.ops.wm.obj_import(filepath=path)
    elif lower.endswith('.glb') or lower.endswith('.gltf'):
        bpy.ops.import_scene.gltf(filepath=path)
    else:
        raise SystemExit(f'unsupported source format: {path}')


def select_meshes(only, exclude):
    """Drop mesh objects the caller does not want.

    The packs ship several variants in one file — five dead trees, or a set of
    first-person arms sharing a rig with the weapon they were posed around — and
    the game wants them as separate assets it can place independently.
    """
    for obj in list(bpy.context.scene.objects):
        if obj.type != 'MESH':
            continue
        if only and obj.name not in only:
            bpy.data.objects.remove(obj, do_unlink=True)
        elif obj.name in exclude:
            bpy.data.objects.remove(obj, do_unlink=True)


def stack_animations():
    """Put every imported action on its own NLA track.

    Blender's FBX importer reads all of a file's takes but leaves only the last
    one assigned, and the glTF exporter writes what it finds on the timeline.
    Without this a dog with eleven animations exports with one.
    """
    exported = 0
    for obj in bpy.context.scene.objects:
        if obj.type != 'ARMATURE':
            continue
        if obj.animation_data is None:
            obj.animation_data_create()
        obj.animation_data.action = None
        for track in list(obj.animation_data.nla_tracks):
            obj.animation_data.nla_tracks.remove(track)
        # The importer produces the same take under more than one name
        # ('Rig|Walk' and 'Rig|Rig|Walk'). Key on the clip itself so each
        # animation is exported once, whichever spellings a pack happens to use.
        seen = set()
        for action in bpy.data.actions:
            clip = action.name.split('|')[-1]
            if clip in seen:
                continue
            seen.add(clip)
            track = obj.animation_data.nla_tracks.new()
            track.name = clip
            track.strips.new(clip, int(action.frame_range[0]), action)
            exported += 1
    return exported


def freeze_rig():
    """Bake the armature away, leaving a plain mesh.

    A rigged prop renders through its bones, so its bind-pose bounding box says
    one thing and the screen shows another — which is how a rigged Glock ended
    up lying across the bottom of the frame no matter which way the viewmodel
    turned it. Nothing in the game animates a held weapon's own rig, so the
    pose is applied and the skeleton discarded.
    """
    for obj in list(bpy.context.scene.objects):
        if obj.type != 'MESH':
            continue
        bpy.context.view_layer.objects.active = obj
        for modifier in list(obj.modifiers):
            if modifier.type != 'ARMATURE':
                continue
            try:
                bpy.ops.object.modifier_apply(modifier=modifier.name)
            except RuntimeError:
                obj.modifiers.remove(modifier)
        obj.parent = None
    for obj in list(bpy.context.scene.objects):
        if obj.type == 'ARMATURE':
            bpy.data.objects.remove(obj, do_unlink=True)


def top_level():
    return [o for o in bpy.context.scene.objects if o.parent is None]


def measure():
    """World-space bounds of every mesh in the scene."""
    lo = [float('inf')] * 3
    hi = [float('-inf')] * 3
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ __import__('mathutils').Vector(corner)
            for axis in range(3):
                lo[axis] = min(lo[axis], world[axis])
                hi[axis] = max(hi[axis], world[axis])
    if lo[0] == float('inf'):
        return (0, 0, 0), (0, 0, 0)
    return tuple(lo), tuple(hi)


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--name', default=None,
                        help='rename the single root object, so findNamed() works in game code')
    parser.add_argument('--scale', type=float, default=1.0)
    parser.add_argument('--height', type=float, default=0.0,
                        help='uniformly scale so the model stands this many metres tall')
    parser.add_argument('--length', type=float, default=0.0,
                        help='uniformly scale so the model measures this along X')
    parser.add_argument('--rotate-x', type=float, default=0.0, help='degrees')
    parser.add_argument('--rotate-y', type=float, default=0.0, help='degrees')
    parser.add_argument('--rotate-z', type=float, default=0.0, help='degrees')
    parser.add_argument('--ground', action='store_true',
                        help='drop the model so its lowest point sits on y=0')
    parser.add_argument('--centre', action='store_true',
                        help='centre the model on the vertical axis')
    parser.add_argument('--no-animation', action='store_true')
    parser.add_argument('--static', action='store_true',
                        help='apply the armature and drop the skeleton')
    parser.add_argument('--only', default='', help='comma-separated mesh names to keep')
    parser.add_argument('--exclude', default='', help='comma-separated mesh names to drop')
    args = parser.parse_args(argv)

    only = {name for name in args.only.split(',') if name}
    exclude = {name for name in args.exclude.split(',') if name}

    clear()
    import_source(args.input)
    select_meshes(only, exclude)
    if args.static:
        freeze_rig()
    clips = 0 if (args.no_animation or args.static) else stack_animations()

    roots = top_level()
    if not roots:
        raise SystemExit(f'{args.input} imported nothing')

    # One empty at the origin owns the whole import, so scaling and rotation are
    # a single transform rather than a per-object walk.
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    pivot = bpy.context.object
    pivot.name = args.name or 'Model'
    for root in roots:
        if root is not pivot:
            root.parent = pivot
            root.matrix_parent_inverse = pivot.matrix_world.inverted()

    pivot.rotation_euler = (math.radians(args.rotate_x), math.radians(args.rotate_y),
                            math.radians(args.rotate_z))
    pivot.scale = (args.scale, args.scale, args.scale)
    bpy.context.view_layer.update()

    lo, hi = measure()
    if args.length > 0:
        # Weapons are quoted by length: the armoury's models all lie along +X,
        # and a pack whose unit is the centimetre would otherwise put a
        # seven-metre rifle on the wall.
        long_side = hi[0] - lo[0]
        if long_side > 1e-6:
            factor = args.length / long_side
            pivot.scale = tuple(component * factor for component in pivot.scale)
            bpy.context.view_layer.update()
            lo, hi = measure()
    if args.height > 0:
        # Blender is Z-up; the glTF exporter converts to the Y-up the game uses.
        tall = hi[2] - lo[2]
        if tall > 1e-6:
            factor = args.height / tall
            pivot.scale = tuple(component * factor for component in pivot.scale)
            bpy.context.view_layer.update()
            lo, hi = measure()

    offset = [0.0, 0.0, 0.0]
    if args.centre:
        offset[0] = -(lo[0] + hi[0]) / 2
        offset[1] = -(lo[1] + hi[1]) / 2
    if args.ground:
        offset[2] = -lo[2]
    pivot.location = tuple(offset)
    bpy.context.view_layer.update()

    # The loader rotates anything without this marker back from the legacy
    # up-axis. These exports are already Y-up, so say so.
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    marker = bpy.context.object
    marker.name = 'LS_ORIENT_YUP'
    marker.parent = pivot

    bpy.ops.export_scene.gltf(
        filepath=args.output,
        export_format='GLB',
        export_apply=False,
        export_animations=not args.no_animation,
        export_yup=True,
    )
    lo, hi = measure()
    print(f'CONVERTED {args.output} '
          f'size={hi[0] - lo[0]:.2f} x {hi[2] - lo[2]:.2f} x {hi[1] - lo[1]:.2f} m '
          f'clips={clips}')


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
