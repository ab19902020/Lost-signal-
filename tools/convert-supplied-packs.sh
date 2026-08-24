#!/usr/bin/env bash
# Convert the supplied third-party model packs into the GLBs the game loads.
#
# The packs ship as FBX and OBJ and are licensed separately from this
# repository, so they are not committed here — the converted GLBs under
# public/assets/supplied/ are. Point PACKS at a directory holding the
# extracted packs and re-run this to reproduce them:
#
#   $PACKS/post   Post Apocalypse Pack
#   $PACKS/fps    FPS pack
#   $PACKS/trees  Dead Trees (Quaternius)
#   $PACKS/solar  Solar Panel Structure (Quaternius)
#   $PACKS/survival  Survival Pack (already glTF; copied, not converted)
#
# Usage: PACKS=/path/to/packs tools/convert-supplied-packs.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKS="${PACKS:?set PACKS to the directory holding the extracted source packs}"
OUT="$ROOT/public/assets/supplied"
BLENDER="${BLENDER:-blender}"
mkdir -p "$OUT"

conv() {
  "$BLENDER" -b --python-exit-code 1 --python "$ROOT/tools/convert_source_model.py" -- "$@" \
    | grep -E 'CONVERTED|Error:'
}

# --- Surface dressing ------------------------------------------------------
conv --input "$PACKS/solar/SolarPanel_Structure.fbx" --output "$OUT/solar_array.glb" \
     --name Solar_Array --ground --centre
for n in 6 7 8 9 10; do
  conv --input "$PACKS/trees/MoreDeadTrees.fbx" --only "DeadTree_$n" \
       --output "$OUT/dead_tree_0$((n-5)).glb" --name "Dead_Tree_0$((n-5))" --ground --centre
done
conv --input "$PACKS/post/Barrel/Barrel.fbx"                   --output "$OUT/prop_barrel.glb"        --name Barrel        --ground --centre
conv --input "$PACKS/post/Container Green/Container_Green.fbx" --output "$OUT/prop_container.glb"     --name Container     --ground --centre
conv --input "$PACKS/post/Container Red/Container_Red.fbx"     --output "$OUT/prop_container_red.glb" --name Container_Red --ground --centre
conv --input "$PACKS/post/Pallet/Pallet.fbx"                   --output "$OUT/prop_pallet.glb"        --name Pallet        --ground --centre
conv --input "$PACKS/post/Pallet Broken/Pallet_Broken.fbx"     --output "$OUT/prop_pallet_broken.glb" --name Pallet_Broken --ground --centre
conv --input "$PACKS/post/Cinder Block/CinderBlock.fbx"        --output "$OUT/prop_cinder_block.glb"  --name Cinder_Block  --ground --centre
conv --input "$PACKS/post/Pipes/Pipes.fbx"                     --output "$OUT/prop_pipes.glb"         --name Pipes         --ground --centre
conv --input "$PACKS/post/Plastic Barrier/PlasticBarrier.fbx"  --output "$OUT/prop_barrier.glb"       --name Plastic_Barrier --ground --centre
conv --input "$PACKS/post/Traffic Cone/TrafficCone_1.fbx"      --output "$OUT/prop_cone.glb"          --name Traffic_Cone  --ground --centre
conv --input "$PACKS/post/Street Light/StreetLights.fbx"        --output "$OUT/prop_street_light.glb"  --name Street_Light  --ground --centre
conv --input "$PACKS/post/Town Sign/TownSign.fbx"              --output "$OUT/prop_town_sign.glb"     --name Town_Sign     --ground --centre
conv --input "$PACKS/post/Water Tower/WaterTower.fbx"          --output "$OUT/prop_water_tower.glb"   --name Water_Tower   --ground --centre
conv --input "$PACKS/post/Wheels Stack/Wheels_Stack.fbx"       --output "$OUT/prop_wheels.glb"        --name Wheels_Stack  --ground --centre
conv --input "$PACKS/post/Trash Bags/TrashBag_2.fbx"           --output "$OUT/prop_trash_bags.glb"    --name Trash_Bags    --ground --centre
conv --input "$PACKS/post/Chest/Chest.fbx"                     --output "$OUT/prop_chest.glb"         --name Supply_Chest  --ground --centre
conv --input "$PACKS/fps/M939 Truck/m939Truck.fbx"             --output "$OUT/prop_truck.glb"         --name Army_Truck    --ground --centre

# --- The patrol dog --------------------------------------------------------
conv --input "$PACKS/post/German Shepard/Characters_GermanShepherd.fbx" \
     --output "$OUT/german_shepherd.glb" --name German_Shepherd --ground --centre

# --- First-person arms -----------------------------------------------------
# Both rigs share one arm mesh, posed around the weapon they shipped with, and
# carry Idle / Shoot / Reload. Exporting the arms without the weapon lets the
# armoury's own model sit in front of whichever pair suits how it is held.
conv --input "$PACKS/fps/Fps Rig AKM/FpsAKM.fbx" --only ArmModel \
     --output "$OUT/fps_arms_rifle.glb" --name Fps_Arms_Rifle
conv --input "$PACKS/fps/Fps Rig/FpsGlock.fbx" --only ArmModel \
     --output "$OUT/fps_arms_pistol.glb" --name Fps_Arms_Pistol

# --- Weapons the FPS pack adds to the armoury ------------------------------
# The armoury's existing models all lie along +X at roughly six units to the
# metre, and the racks and the viewmodel are built around that. Rotate the long
# axis onto X and normalise the length so a new weapon hangs on the same hook
# as the twenty-five already there.
conv --input "$PACKS/fps/AKM/AKM.fbx"                       --output "$OUT/akm.glb"            --name AKM          --centre --no-animation --length 5.4
conv --input "$PACKS/fps/Mossberg 590A1/Mossberg590A1.fbx"  --output "$OUT/mossberg_590a1.glb" --name Mossberg     --centre --no-animation --length 5.9
conv --input "$PACKS/fps/Rigged Glock/Glock19.fbx"          --output "$OUT/glock_19.glb"       --name Glock19      --centre --static --rotate-z -90 --length 2.3
conv --input "$PACKS/fps/Combat Knife/CombatKnife.fbx"      --output "$OUT/combat_knife.glb"   --name Combat_Knife --centre --no-animation --rotate-y 90 --length 1.3

# --- Survival pack: already glTF, and used as shipped ----------------------
for name in "First Aid Kit" "Water Bottle" "Gas Can" "Battery" "Can" "Pot" "Pan" \
            "Backpack" "Torch" "Matchbox" "Propane Tank" "Shovel" "Axe" "Radio"; do
  slug="$(echo "$name" | tr 'A-Z ' 'a-z_')"
  cp "$PACKS/survival/$name.glb" "$OUT/survival_$slug.glb"
done
echo "Converted packs into $OUT"
