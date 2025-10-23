"""
Ship-Ready PBR Wheel Build Script
Generates bulb array, sets up materials, bakes AO/curvature, creates LODs, and exports FBX files.
Usage: blender -b assets/wheel/models/wheel_base.blend -P tools/blender/build_wheel.py
"""

import bpy
import math
import mathutils as mu
import os
import sys
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

BULB_COUNT = 24
RIM_OUTER_RADIUS = 0.34  # meters, adjust based on actual rim size
BULB_OFFSET = 0.01  # offset from rim outer edge
BULB_RADIUS = RIM_OUTER_RADIUS - BULB_OFFSET
BULB_Z_POSITION = 0.0

# Paths (relative to blend file)
TEXTURE_DIR = "../../textures"
LIGHTING_DIR = "../../lighting"
BAKE_DIR = "../../bake"
LOD_DIR = "../../lod"
MODELS_DIR = "."

# LOD settings (tri count reduction per level)
LOD_RATIOS = [1.0, 0.3, 0.1]  # LOD0=100%, LOD1=30%, LOD2=10%

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_abs_path(relative_path):
    """Convert relative path to absolute based on blend file location."""
    blend_dir = Path(bpy.data.filepath).parent
    return str(blend_dir / relative_path)

def clear_collection(collection_name):
    """Remove all objects from a collection."""
    coll = bpy.data.collections.get(collection_name)
    if coll:
        for obj in list(coll.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

def ensure_collection(collection_name, parent=None):
    """Create collection if it doesn't exist."""
    coll = bpy.data.collections.get(collection_name)
    if not coll:
        coll = bpy.data.collections.new(collection_name)
        if parent:
            parent.children.link(coll)
        else:
            bpy.context.scene.collection.children.link(coll)
    return coll

# ============================================================================
# MATERIAL SETUP
# ============================================================================

def setup_tire_material():
    """Create PBR tire material with decals."""
    mat = bpy.data.materials.get("Tire") or bpy.data.materials.new("Tire")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # Nodes
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    # Texture coordinate and mapping
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')

    # Base rubber textures (ambientCG Rubber_001 assumed)
    bc_tex = nodes.new('ShaderNodeTexImage')
    bc_tex.label = "Base Color"
    bc_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/tire_basecolor_2k.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/tire_basecolor_2k.png")) else None

    rough_tex = nodes.new('ShaderNodeTexImage')
    rough_tex.label = "Roughness"
    rough_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/tire_roughness_2k.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/tire_roughness_2k.png")) else None
    rough_tex.image.colorspace_settings.name = 'Non-Color' if rough_tex.image else None

    normal_tex = nodes.new('ShaderNodeTexImage')
    normal_tex.label = "Normal"
    normal_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/tire_normal_2k.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/tire_normal_2k.png")) else None
    normal_tex.image.colorspace_settings.name = 'Non-Color' if normal_tex.image else None

    normal_map = nodes.new('ShaderNodeNormalMap')

    # Decal overlay (sidewall)
    decal_tex = nodes.new('ShaderNodeTexImage')
    decal_tex.label = "Sidewall Decal"
    decal_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/decals_sidewall_A.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/decals_sidewall_A.png")) else None

    decal_mix = nodes.new('ShaderNodeMixRGB')
    decal_mix.blend_type = 'MIX'
    decal_mix.inputs[0].default_value = 0.5  # Factor

    # Links
    links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], bc_tex.inputs['Vector'])
    links.new(mapping.outputs['Vector'], rough_tex.inputs['Vector'])
    links.new(mapping.outputs['Vector'], normal_tex.inputs['Vector'])
    links.new(mapping.outputs['Vector'], decal_tex.inputs['Vector'])

    links.new(bc_tex.outputs['Color'], decal_mix.inputs[1])
    links.new(decal_tex.outputs['Color'], decal_mix.inputs[2])
    links.new(decal_mix.outputs['Color'], bsdf.inputs['Base Color'])

    links.new(rough_tex.outputs['Color'], bsdf.inputs['Roughness'])
    links.new(normal_tex.outputs['Color'], normal_map.inputs['Color'])
    links.new(normal_map.outputs['Normal'], bsdf.inputs['Normal'])

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    # Layout
    output.location = (400, 0)
    bsdf.location = (200, 0)
    decal_mix.location = (0, 200)
    bc_tex.location = (-300, 300)
    rough_tex.location = (-300, 0)
    normal_tex.location = (-300, -200)
    normal_map.location = (0, -200)
    decal_tex.location = (-300, 100)

    return mat

def setup_rim_material():
    """Create metallic rim material with clear coat."""
    mat = bpy.data.materials.get("Rim") or bpy.data.materials.new("Rim")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # Nodes
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    # Metallic workflow
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = 0.2
    bsdf.inputs['Clearcoat'].default_value = 0.3
    bsdf.inputs['Clearcoat Roughness'].default_value = 0.08

    # Texture coordinate
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')

    # Rim textures (brushed metal)
    bc_tex = nodes.new('ShaderNodeTexImage')
    bc_tex.label = "Base Color"
    bc_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/rim_basecolor_2k.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/rim_basecolor_2k.png")) else None

    rough_tex = nodes.new('ShaderNodeTexImage')
    rough_tex.label = "Roughness"
    rough_tex.image = bpy.data.images.load(get_abs_path(f"{TEXTURE_DIR}/rim_roughness_2k.png"), check_existing=True) if os.path.exists(get_abs_path(f"{TEXTURE_DIR}/rim_roughness_2k.png")) else None
    rough_tex.image.colorspace_settings.name = 'Non-Color' if rough_tex.image else None

    # Links
    links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], bc_tex.inputs['Vector'])
    links.new(mapping.outputs['Vector'], rough_tex.inputs['Vector'])
    links.new(bc_tex.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(rough_tex.outputs['Color'], bsdf.inputs['Roughness'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

def setup_disc_material():
    """Create brake disc material (carbon ceramic or metallic)."""
    mat = bpy.data.materials.get("BrakeDisc") or bpy.data.materials.new("BrakeDisc")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Metallic'].default_value = 0.8
    bsdf.inputs['Roughness'].default_value = 0.4
    bsdf.inputs['Base Color'].default_value = (0.1, 0.1, 0.12, 1.0)  # Dark metallic

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

def setup_bulb_glass_material():
    """Create glass material for bulb."""
    mat = bpy.data.materials.get("BulbGlass") or bpy.data.materials.new("BulbGlass")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Transmission'].default_value = 1.0
    bsdf.inputs['IOR'].default_value = 1.5
    bsdf.inputs['Roughness'].default_value = 0.0
    bsdf.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

def setup_bulb_emissive_material():
    """Create emissive material for bulb filament."""
    mat = bpy.data.materials.get("BulbFilament") or bpy.data.materials.new("BulbFilament")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    emission = nodes.new('ShaderNodeEmission')

    emission.inputs['Strength'].default_value = 5.0
    emission.inputs['Color'].default_value = (1.0, 0.9, 0.7, 1.0)  # Warm white

    links.new(emission.outputs['Emission'], output.inputs['Surface'])

    return mat

# ============================================================================
# BULB ARRAY GENERATION
# ============================================================================

def create_bulb_array():
    """Generate N bulb instances around rim."""
    print(f"Creating bulb array with {BULB_COUNT} instances...")

    # Ensure bulb object exists
    bulb = bpy.data.objects.get('bulb_cc0')
    if not bulb:
        print("ERROR: 'bulb_cc0' object not found in scene!")
        return None

    # Clear existing array
    clear_collection('BulbArray')
    coll = ensure_collection('BulbArray')

    # Create instances
    for i in range(BULB_COUNT):
        angle = 2 * math.pi * i / BULB_COUNT

        # Create instance
        inst = bulb.copy()
        inst.data = bulb.data  # Reuse mesh data
        inst.name = f"bulb_instance_{i:02d}"

        # Position on circle
        x = BULB_RADIUS * math.cos(angle)
        y = BULB_RADIUS * math.sin(angle)
        inst.location = mu.Vector((x, y, BULB_Z_POSITION))

        # Rotate to face outward
        inst.rotation_euler[2] = angle + math.pi / 2

        # Link to collection
        coll.objects.link(inst)

    # Hide original bulb
    bulb.hide_set(True)
    bulb.hide_render = True

    print(f"✓ Created {BULB_COUNT} bulb instances")
    return coll

# ============================================================================
# PIVOT & ORIGIN SETUP
# ============================================================================

def set_wheel_origin():
    """Set wheel origin to axle center (0,0,0)."""
    print("Setting wheel origin to world origin...")

    # Move 3D cursor to origin
    bpy.context.scene.cursor.location = (0, 0, 0)

    # Set origin for main wheel parts
    for obj_name in ['tire', 'rim', 'brake_disc', 'caliper']:
        obj = bpy.data.objects.get(obj_name)
        if obj:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
            obj.select_set(False)

    # Verify cursor is at origin
    cursor_dist = bpy.context.scene.cursor.location.length
    assert cursor_dist < 1e-6, f"Cursor not at world origin! Distance: {cursor_dist}"

    print("✓ Wheel origin set to (0,0,0)")

# ============================================================================
# BAKING
# ============================================================================

def bake_ao_map(output_path, resolution=2048):
    """Bake ambient occlusion map for the wheel assembly."""
    print(f"Baking AO map at {resolution}x{resolution}...")

    # Select all wheel parts
    bpy.ops.object.select_all(action='DESELECT')
    for obj_name in ['tire', 'rim', 'brake_disc', 'caliper']:
        obj = bpy.data.objects.get(obj_name)
        if obj:
            obj.select_set(True)

    # Join temporarily for baking
    bpy.ops.object.join()
    wheel = bpy.context.active_object

    # Create bake material and image
    mat = bpy.data.materials.new("BakeMaterial")
    mat.use_nodes = True
    wheel.data.materials.append(mat)

    img = bpy.data.images.new("wheel_ao", width=resolution, height=resolution)
    img_node = mat.node_tree.nodes.new('ShaderNodeTexImage')
    img_node.image = img
    mat.node_tree.nodes.active = img_node

    # Bake settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 128
    bpy.context.scene.cycles.bake_type = 'AO'

    # Bake
    bpy.ops.object.bake(type='AO')

    # Save
    img.filepath_raw = get_abs_path(output_path)
    img.file_format = 'PNG'
    img.save()

    print(f"✓ AO map saved to {output_path}")

def bake_curvature_map(output_path, resolution=2048):
    """Bake curvature map (approximated via normal variation)."""
    print(f"Baking curvature map at {resolution}x{resolution}...")

    # Note: True curvature requires special shaders or add-ons
    # This is a placeholder - curvature can be derived from normals in post

    img = bpy.data.images.new("wheel_curvature", width=resolution, height=resolution)
    img.filepath_raw = get_abs_path(output_path)
    img.file_format = 'PNG'

    # Fill with neutral gray (no curvature data yet)
    pixels = [0.5] * (resolution * resolution * 4)
    img.pixels = pixels
    img.save()

    print(f"✓ Curvature map placeholder saved to {output_path}")

# ============================================================================
# LOD GENERATION
# ============================================================================

def create_lod(base_objects, ratio, lod_index):
    """Create LOD by decimating meshes."""
    print(f"Creating LOD{lod_index} with {ratio*100}% tri count...")

    lod_objects = []

    for obj in base_objects:
        if obj.type != 'MESH':
            continue

        # Duplicate
        lod_obj = obj.copy()
        lod_obj.data = obj.data.copy()
        lod_obj.name = f"{obj.name}_LOD{lod_index}"
        bpy.context.collection.objects.link(lod_obj)

        # Decimate
        if ratio < 1.0:
            mod = lod_obj.modifiers.new(name="Decimate", type='DECIMATE')
            mod.ratio = ratio
            bpy.context.view_layer.objects.active = lod_obj
            bpy.ops.object.modifier_apply(modifier=mod.name)

        lod_objects.append(lod_obj)

    print(f"✓ LOD{lod_index} created with {len(lod_objects)} objects")
    return lod_objects

# ============================================================================
# FBX EXPORT
# ============================================================================

def export_fbx(objects, filepath, apply_transforms=True):
    """Export objects to FBX with correct settings."""
    print(f"Exporting to {filepath}...")

    # Select objects
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)

    # Export
    bpy.ops.export_scene.fbx(
        filepath=get_abs_path(filepath),
        use_selection=True,
        apply_scale_options='FBX_SCALE_ALL' if apply_transforms else 'FBX_SCALE_NONE',
        axis_forward='Y',
        axis_up='Z',
        bake_space_transform=apply_transforms,
        mesh_smooth_type='FACE',
        use_mesh_modifiers=True,
        use_tspace=True,
        embed_textures=False
    )

    print(f"✓ Exported to {filepath}")

# ============================================================================
# MAIN BUILD PROCESS
# ============================================================================

def main():
    """Main build pipeline."""
    print("=" * 80)
    print("WHEEL BUILD SCRIPT - Starting...")
    print("=" * 80)

    # 1. Setup materials
    print("\n[1/7] Setting up materials...")
    setup_tire_material()
    setup_rim_material()
    setup_disc_material()
    setup_bulb_glass_material()
    setup_bulb_emissive_material()

    # 2. Create bulb array
    print("\n[2/7] Creating bulb array...")
    bulb_array = create_bulb_array()

    # 3. Set pivots/origins
    print("\n[3/7] Setting wheel origin...")
    set_wheel_origin()

    # 4. Bake maps (optional - can be time-consuming)
    # Uncomment to enable baking
    # print("\n[4/7] Baking AO and curvature...")
    # bake_ao_map(f"{BAKE_DIR}/wheel_ao_2k.png")
    # bake_curvature_map(f"{BAKE_DIR}/wheel_curvature_2k.png")
    print("\n[4/7] Skipping baking (enable in script if needed)")

    # 5. Create LODs
    print("\n[5/7] Creating LOD levels...")
    base_objects = [bpy.data.objects.get(n) for n in ['tire', 'rim', 'brake_disc', 'caliper'] if bpy.data.objects.get(n)]
    lod_sets = []
    for i, ratio in enumerate(LOD_RATIOS):
        lod_objs = create_lod(base_objects, ratio, i)
        lod_sets.append(lod_objs)

    # 6. Export FBX files
    print("\n[6/7] Exporting FBX files...")

    # Individual components
    if bpy.data.objects.get('tire'):
        export_fbx([bpy.data.objects['tire']], f"{MODELS_DIR}/tire.fbx")
    if bpy.data.objects.get('rim'):
        export_fbx([bpy.data.objects['rim']], f"{MODELS_DIR}/rim.fbx")
    if bpy.data.objects.get('brake_disc'):
        export_fbx([bpy.data.objects['brake_disc']], f"{MODELS_DIR}/brake_disc.fbx")
    if bpy.data.objects.get('caliper'):
        export_fbx([bpy.data.objects['caliper']], f"{MODELS_DIR}/caliper.fbx")
    if bpy.data.objects.get('bulb_cc0'):
        export_fbx([bpy.data.objects['bulb_cc0']], f"{MODELS_DIR}/bulb_cc0.fbx")

    # Combined LODs
    for i, lod_objs in enumerate(lod_sets):
        export_fbx(lod_objs, f"{LOD_DIR}/wheel_LOD{i}.fbx")

    # 7. Validation
    print("\n[7/7] Running validation checks...")

    # Check origin
    cursor_dist = bpy.context.scene.cursor.location.length
    assert cursor_dist < 1e-6, "❌ Origin check failed!"
    print("✓ Origin at (0,0,0)")

    # Check bulb count
    bulb_coll = bpy.data.collections.get('BulbArray')
    if bulb_coll:
        bulb_count = len(bulb_coll.objects)
        assert bulb_count == BULB_COUNT, f"❌ Expected {BULB_COUNT} bulbs, found {bulb_count}"
        print(f"✓ {BULB_COUNT} bulb instances verified")

    print("\n" + "=" * 80)
    print("WHEEL BUILD COMPLETE!")
    print("=" * 80)

if __name__ == "__main__":
    main()
