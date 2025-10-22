# Texture Assets

## Included Placeholder Library ✅

To make it easier to wire materials before sourcing high-resolution scans, we
ship lightweight 1×1 RGBA placeholder textures:

```
assets/textures/
├── wood/
│   ├── albedo.png
│   ├── normal.png
│   ├── roughness.png
│   └── metallic.png
├── metal/
│   ├── albedo.png
│   ├── roughness.png
│   └── metallic.png
├── led/
│   ├── emissive_magenta.png
│   └── emissive_orange.png
└── pointer/
    └── albedo.png
```

These files are intentionally tiny (solid-color pixels) so you can hook up
Three.js materials without waiting for large downloads. Replace them with real
PBR sets when ready.

See `assets/textures/manifest.json` for an at-a-glance list that modules can
consume when wiring loaders.

## Upgrading to Photoreal Textures

When you are ready for production assets, download physically based texture
packs from CC0/CC-BY libraries and overwrite the placeholder PNGs:

- **AmbientCG** — https://ambientcg.com/
- **Poly Haven** — https://polyhaven.com/textures

Each material should include:

```
material-name/
  ├── albedo.(png|jpg)    # base color
  ├── normal.(png|jpg)    # surface detail
  ├── roughness.(png|jpg) # glossiness map
  └── metallic.(png|jpg)  # metallic mask (optional)
```

## HDR Environment Maps

For reflections and image-based lighting:
1. Download a night fairground HDR from https://polyhaven.com/hdris
2. Save it as `assets/textures/environment.hdr`
3. Load via `RGBELoader` in `VisualEffects.js`

## Applying the Textures

Example snippet for the wheel rim:

```js
const textureLoader = new THREE.TextureLoader();
const rimMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load('assets/textures/wood/albedo.png'),
  normalMap: textureLoader.load('assets/textures/wood/normal.png'),
  roughnessMap: textureLoader.load('assets/textures/wood/roughness.png'),
  metalnessMap: textureLoader.load('assets/textures/wood/metallic.png'),
  metalness: 0.25,
  roughness: 0.6,
});
```

Swap the `.png` files for real scans later—the code paths remain the same.
