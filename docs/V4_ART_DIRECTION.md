# LOST SIGNAL — Shelter 47 V4 Art Direction

## Goal
Build a believable post-apocalyptic civil-defence shelter that looks like one real place, not a collection of independently placed game props.

## Reference language
The V4 room is inspired by real Cold War bunker and emergency shelter interiors:
- reinforced / arched concrete shell
- exposed pipework, cable trays and ventilation
- practical industrial pendant lighting
- dense analogue operations/control equipment
- metal cots, canvas bedding and utilitarian storage
- heavy pressure/blast door with visible frame, hinges and locking wheel
- worn painted steel, faded olive equipment, galvanised hardware
- damp concrete, floor stains, ration tins, jerry cans, toolboxes and improvised survivor clutter

This is reference-driven, not a copy of any one real bunker.

## Non-negotiable V4 rules
1. Blender Z-up coordinates only. No Y-up modelling inside Blender.
2. The entire interior is authored and placed in one Blender scene.
3. Three.js must not place visible bunker furniture individually.
4. Doors must be modelled inside actual openings; no wall may remain behind an opening door.
5. Furniture must visibly contact the floor and walls at correct scale.
6. Lighting must be readable before it is dramatic. No black-room / single-hotspot grading.
7. Practical fixtures define the light positions.
8. Materials: aged concrete, worn grey steel, faded olive paint, canvas, rubber, dark wood, limited amber/red indicators.
9. The player spawn view must clearly show the room and blast-door direction.
10. No merge to main until five Blender QA renders have been visually inspected.

## QA cameras
- Spawn / whole-room readability
- Blast door close view
- Operations/control wall
- Living/storage/cots
- High overview for furniture placement and circulation

## Performance target
One integrated room GLB for the environment. Repeated lights and gameplay effects may be runtime effects, but visible physical geometry belongs to Blender.
