#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p public/assets/{wildlife,infected,weapons,props,textures,licenses}
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading MIT wildlife..."
curl -fL --retry 3 "https://raw.githubusercontent.com/kunalkushwaha/vsim/main/packages/assets/library/deer.glb" -o public/assets/wildlife/deer.glb
curl -fL --retry 3 "https://raw.githubusercontent.com/kunalkushwaha/vsim/main/packages/assets/library/rabbit.glb" -o public/assets/wildlife/rabbit.glb
curl -fL --retry 3 "https://raw.githubusercontent.com/kunalkushwaha/vsim/main/LICENSE" -o public/assets/licenses/vsim-MIT.txt

echo "Downloading CC0 Quaternius source pack..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/agentkaerf/FreeModels.git "$TMP/freemodels"
cd "$TMP/freemodels"
git sparse-checkout set "Zombie Apocalypse Kit - March 2024"
cd "$ROOT"

npm --yes exec --package @gltf-transform/cli@4.2.1 -- gltf-transform copy "$TMP/freemodels/Zombie Apocalypse Kit - March 2024/Characters/glTF/Zombie_Ribcage.gltf" public/assets/infected/zombie.glb
npm --yes exec --package @gltf-transform/cli@4.2.1 -- gltf-transform copy "$TMP/freemodels/Zombie Apocalypse Kit - March 2024/Weapons/glTF/Rifle.gltf" public/assets/weapons/rifle.glb
npm --yes exec --package @gltf-transform/cli@4.2.1 -- gltf-transform copy "$TMP/freemodels/Zombie Apocalypse Kit - March 2024/Environment/glTF/Barrel.gltf" public/assets/props/barrel.glb
npm --yes exec --package @gltf-transform/cli@4.2.1 -- gltf-transform copy "$TMP/freemodels/Zombie Apocalypse Kit - March 2024/Environment/glTF/Container_Green.gltf" public/assets/props/container.glb
npm --yes exec --package @gltf-transform/cli@4.2.1 -- gltf-transform copy "$TMP/freemodels/Zombie Apocalypse Kit - March 2024/Environment/glTF/CinderBlock.gltf" public/assets/props/cinderblock.glb

echo "Downloading CC0 PBR surfaces..."
TEX="https://raw.githubusercontent.com/rishipr/der-koloss-ce/main/assets/tex"
curl -fL --retry 3 "$TEX/concrete__Concrete034_1K_Color.jpg" -o public/assets/textures/concrete__Concrete034_1K_Color.jpg
curl -fL --retry 3 "$TEX/concrete__Concrete034_1K_NormalGL.jpg" -o public/assets/textures/concrete__Concrete034_1K_NormalGL.jpg
curl -fL --retry 3 "$TEX/concrete__Concrete034_1K_Roughness.jpg" -o public/assets/textures/concrete__Concrete034_1K_Roughness.jpg
curl -fL --retry 3 "$TEX/metal_floor_plate__DiamondPlate008C_1K_Color.jpg" -o public/assets/textures/metal_floor_plate__DiamondPlate008C_1K_Color.jpg
curl -fL --retry 3 "$TEX/metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg" -o public/assets/textures/metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg
curl -fL --retry 3 "$TEX/metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg" -o public/assets/textures/metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg

cat > public/assets/licenses/README.txt <<'EOF'
Wildlife:
- deer.glb / rabbit.glb from kunalkushwaha/vsim — repository MIT licence copied as vsim-MIT.txt.

Zombie Apocalypse Kit:
- zombie.glb, rifle.glb, barrel.glb, container.glb, cinderblock.glb from Quaternius Zombie Apocalypse Kit — CC0 1.0.

PBR surfaces:
- concrete and diamond-plate maps originate from ambientCG — CC0, mirrored through der-koloss-ce.
EOF

echo "Asset import complete."
find public/assets -type f -maxdepth 3 -printf "%p %k KB\n" | sort
