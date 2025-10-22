# 3D Model Assets

## Current: Procedural Geometry ✅

The carnival wheel is **procedurally generated** using Three.js code.

Benefits:
- No file download needed
- Customizable colors/segments
- Smaller file size
- Instant loading

## Optional: Custom 3D Models

If you want to use a custom glTF/GLB model:

1. Download from Sketchfab (CC-BY/CC0)
2. Place `.glb` file here
3. Update `src/Wheel.js` to load the model

Example:
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('assets/models/wheel.glb', (gltf) => {
    this.wheelGroup.add(gltf.scene);
});
```

## Recommended Models

- **Spinning Wheel**: https://sketchfab.com/search?q=spinning+wheel&type=models
- **Fortune Wheel**: https://sketchfab.com/search?q=fortune+wheel&type=models

Filter by:
- ✅ Downloadable
- ✅ CC-BY or CC0 license
- ✅ glTF format
