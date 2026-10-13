import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

function flattenFurnitureManifest(manifest, dirName, inherited = {}) {
  const fileName = manifest.file ?? `${manifest.id}.png`;
  const base = {
    category: manifest.category ?? inherited.category ?? "misc",
    groupId: manifest.type === "group" ? manifest.id : inherited.groupId,
    orientation: manifest.orientation ?? inherited.orientation,
    state: manifest.state ?? inherited.state,
    rotationScheme: manifest.rotationScheme ?? inherited.rotationScheme,
    animationGroup: manifest.groupType === "animation" ? manifest.id : inherited.animationGroup,
    canPlaceOnSurfaces: manifest.canPlaceOnSurfaces ?? inherited.canPlaceOnSurfaces,
    backgroundTiles: manifest.backgroundTiles ?? inherited.backgroundTiles,
    canPlaceOnWalls: manifest.canPlaceOnWalls ?? inherited.canPlaceOnWalls,
    mirrorSide: manifest.mirrorSide ?? inherited.mirrorSide,
  };

  if (manifest.type === "asset") {
    return [{
      id: manifest.id,
      label: manifest.name ?? inherited.name ?? manifest.id,
      category: base.category,
      width: manifest.width,
      height: manifest.height,
      footprintW: manifest.footprintW,
      footprintH: manifest.footprintH,
      isDesk: base.category === "desks",
      groupId: base.groupId,
      orientation: base.orientation,
      state: base.state,
      rotationScheme: base.rotationScheme,
      animationGroup: base.animationGroup,
      frame: manifest.frame,
      canPlaceOnSurfaces: !!base.canPlaceOnSurfaces,
      backgroundTiles: base.backgroundTiles,
      canPlaceOnWalls: !!base.canPlaceOnWalls,
      mirrorSide: !!base.mirrorSide,
      furniturePath: `furniture/${dirName}/${fileName}`,
    }];
  }

  return (manifest.members ?? []).flatMap((member) =>
    flattenFurnitureManifest(member, dirName, {
      ...base,
      name: manifest.name ?? inherited.name,
    }),
  );
}

export async function writeAssetIndex(root, outputDir) {
  const assetsDir = path.join(root, "public", "assets");
  await mkdir(outputDir, { recursive: true });
  await cp(assetsDir, outputDir, { recursive: true });

  const furnitureRoot = path.join(assetsDir, "furniture");
  const furnitureDirs = await readdir(furnitureRoot, { withFileTypes: true });
  const furniture = [];
  for (const entry of furnitureDirs) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(furnitureRoot, entry.name, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    furniture.push(...flattenFurnitureManifest(manifest, entry.name));
  }

  const index = {
    characters: (await readdir(path.join(assetsDir, "characters")))
      .filter((name) => /^char_\d+\.png$/i.test(name))
      .sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0))
      .map((name) => `characters/${name}`),
    floors: Array.from({ length: 9 }, (_, index) => `floors/floor_${index}.png`),
    walls: ["walls/wall_0.png"],
    furniture,
    layouts: {
      office: "default-layout-1.json",
      boardroomKitchen: "agent-pixels-layout-boardroom-kitchen.json",
    },
    defaultLayout: "default-layout-1.json",
  };

  await writeFile(
    path.join(outputDir, "agent-pixels-assets.json"),
    JSON.stringify(index),
  );
}
