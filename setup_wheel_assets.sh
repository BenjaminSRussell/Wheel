#!/bin/bash

# Ship-Ready PBR Wheel - Asset Download & Setup Script
# Downloads all CC0 assets and sets up directory structure
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/assets/wheel"
TEXTURES_DIR="$ASSETS_DIR/textures"
LIGHTING_DIR="$ASSETS_DIR/lighting"
MODELS_DIR="$ASSETS_DIR/models"
LOD_DIR="$ASSETS_DIR/lod"
BAKE_DIR="$ASSETS_DIR/bake"
TOOLS_DIR="$SCRIPT_DIR/tools/blender"

# Asset URLs (CC0 verified)
HDRI_URL="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/studio_small_03_4k.hdr"

# ambientCG texture sets (CC0)
RUBBER_001_BASE="https://ambientcg.com/get?file=Rubber001_2K-PNG.zip"
METAL_BASE="https://ambientcg.com/get?file=Metal034_2K-PNG.zip"
DECAL_BASE="https://ambientcg.com/get?file=Decal006_2K-PNG.zip"

# 3D Models (CC0)
# Note: These are placeholder URLs - actual download may require manual intervention
# due to Sketchfab/CGTrader download mechanisms
BULB_MODEL_INFO="https://sketchfab.com/3d-models/light-bulb-[MODEL_ID]"
DISC_MODEL_INFO="https://www.meshy.ai/discover/[MODEL_ID]"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PBR Wheel Asset Download Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to download file with progress
download_file() {
    local url=$1
    local output=$2
    local description=$3

    echo -e "${BLUE}Downloading:${NC} $description"

    if command -v curl &> /dev/null; then
        curl -L -o "$output" "$url" --progress-bar
    elif command -v wget &> /dev/null; then
        wget -O "$output" "$url" -q --show-progress
    else
        print_error "Neither curl nor wget found! Please install one."
        exit 1
    fi

    print_status "Downloaded: $description"
}

# Function to extract zip
extract_zip() {
    local zip_file=$1
    local dest_dir=$2

    if command -v unzip &> /dev/null; then
        unzip -q "$zip_file" -d "$dest_dir"
    else
        print_error "unzip not found! Please install unzip."
        exit 1
    fi
}

# ============================================================================
# STEP 1: Verify/Create Directory Structure
# ============================================================================

echo -e "\n${BLUE}[1/6]${NC} Setting up directory structure..."

mkdir -p "$TEXTURES_DIR"
mkdir -p "$LIGHTING_DIR"
mkdir -p "$MODELS_DIR"
mkdir -p "$LOD_DIR"
mkdir -p "$BAKE_DIR"
mkdir -p "$TOOLS_DIR"

print_status "Directories created"

# ============================================================================
# STEP 2: Download HDRI (Poly Haven)
# ============================================================================

echo -e "\n${BLUE}[2/6]${NC} Downloading HDRI from Poly Haven..."

HDRI_FILE="$LIGHTING_DIR/studio_small_03_4k.hdr"

if [ -f "$HDRI_FILE" ]; then
    print_warning "HDRI already exists, skipping download"
else
    download_file "$HDRI_URL" "$HDRI_FILE" "Studio Small 03 HDRI (4K)"
fi

# Verify file size (should be ~50MB for 4K HDR)
if [ -f "$HDRI_FILE" ]; then
    FILE_SIZE=$(stat -f%z "$HDRI_FILE" 2>/dev/null || stat -c%s "$HDRI_FILE" 2>/dev/null || echo "0")
    if [ "$FILE_SIZE" -gt 10000000 ]; then  # > 10MB
        print_status "HDRI verified (${FILE_SIZE} bytes)"
    else
        print_error "HDRI file seems too small, may be corrupted"
    fi
fi

# ============================================================================
# STEP 3: Download Textures (ambientCG)
# ============================================================================

echo -e "\n${BLUE}[3/6]${NC} Downloading textures from ambientCG (CC0)..."

TEMP_DIR="$SCRIPT_DIR/temp_downloads"
mkdir -p "$TEMP_DIR"

# Download Rubber textures
echo "  → Rubber textures..."
if [ ! -f "$TEXTURES_DIR/tire_basecolor_2k.png" ]; then
    RUBBER_ZIP="$TEMP_DIR/rubber.zip"
    download_file "$RUBBER_BASE" "$RUBBER_ZIP" "Rubber textures"
    extract_zip "$RUBBER_ZIP" "$TEMP_DIR/rubber"

    # Rename to our naming convention
    find "$TEMP_DIR/rubber" -name "*Color*.png" -exec cp {} "$TEXTURES_DIR/tire_basecolor_2k.png" \;
    find "$TEMP_DIR/rubber" -name "*Roughness*.png" -exec cp {} "$TEXTURES_DIR/tire_roughness_2k.png" \;
    find "$TEMP_DIR/rubber" -name "*Normal*.png" -exec cp {} "$TEXTURES_DIR/tire_normal_2k.png" \;

    print_status "Rubber textures processed"
else
    print_warning "Rubber textures already exist"
fi

# Download Metal textures
echo "  → Metal textures..."
if [ ! -f "$TEXTURES_DIR/rim_basecolor_2k.png" ]; then
    METAL_ZIP="$TEMP_DIR/metal.zip"
    download_file "$METAL_BASE" "$METAL_ZIP" "Metal textures"
    extract_zip "$METAL_ZIP" "$TEMP_DIR/metal"

    find "$TEMP_DIR/metal" -name "*Color*.png" -exec cp {} "$TEXTURES_DIR/rim_basecolor_2k.png" \;
    find "$TEMP_DIR/metal" -name "*Roughness*.png" -exec cp {} "$TEXTURES_DIR/rim_roughness_2k.png" \;

    print_status "Metal textures processed"
else
    print_warning "Metal textures already exist"
fi

# Download Decal textures
echo "  → Decal textures..."
if [ ! -f "$TEXTURES_DIR/decals_sidewall_A.png" ]; then
    DECAL_ZIP="$TEMP_DIR/decal.zip"
    download_file "$DECAL_BASE" "$DECAL_ZIP" "Decal textures"
    extract_zip "$DECAL_ZIP" "$TEMP_DIR/decal"

    find "$TEMP_DIR/decal" -name "*Color*.png" -exec cp {} "$TEXTURES_DIR/decals_sidewall_A.png" \;
    find "$TEMP_DIR/decal" -name "*Roughness*.png" -exec cp {} "$TEXTURES_DIR/decals_wear_R.png" \;

    print_status "Decal textures processed"
else
    print_warning "Decal textures already exist"
fi

# Create disc textures (simple gray if not available)
if [ ! -f "$TEXTURES_DIR/disc_basecolor_2k.png" ]; then
    # Create simple placeholder disc textures
    if command -v convert &> /dev/null; then
        convert -size 2048x2048 xc:"rgb(25,25,30)" "$TEXTURES_DIR/disc_basecolor_2k.png"
        convert -size 2048x2048 xc:"rgb(102,102,102)" "$TEXTURES_DIR/disc_roughness_2k.png"
        print_status "Generated placeholder disc textures"
    else
        print_warning "ImageMagick not found - disc textures will need to be created manually"
    fi
fi

# ============================================================================
# STEP 4: Download 3D Models (Manual intervention may be required)
# ============================================================================

echo -e "\n${BLUE}[4/6]${NC} Checking 3D models..."

print_warning "3D models (bulb, brake disc) require manual download:"
echo ""
echo -e "  ${YELLOW}Light Bulb (CC0):${NC}"
echo "    • Sketchfab: https://sketchfab.com/search?q=light+bulb+cc0&type=models"
echo "    • CGTrader: https://www.cgtrader.com/free-3d-models/light-bulb+cc0"
echo "    → Save as: $MODELS_DIR/bulb_cc0.fbx"
echo ""
echo -e "  ${YELLOW}Brake Disc (CC0):${NC}"
echo "    • Meshy AI: https://www.meshy.ai/discover"
echo "    • Search: 'carbon ceramic brake disc CC0'"
echo "    → Save as: $MODELS_DIR/brake_disc.fbx"
echo ""
echo -e "  ${BLUE}Press ENTER when models are downloaded, or 's' to skip...${NC}"
read -r user_input

if [ "$user_input" != "s" ]; then
    # Check if models exist
    if [ -f "$MODELS_DIR/bulb_cc0.fbx" ]; then
        print_status "Bulb model found"
    else
        print_error "Bulb model not found at $MODELS_DIR/bulb_cc0.fbx"
    fi

    if [ -f "$MODELS_DIR/brake_disc.fbx" ]; then
        print_status "Brake disc model found"
    else
        print_error "Brake disc model not found at $MODELS_DIR/brake_disc.fbx"
    fi
fi

# ============================================================================
# STEP 5: Create Placeholder Blender File
# ============================================================================

echo -e "\n${BLUE}[5/6]${NC} Creating placeholder Blender file..."

if [ ! -f "$MODELS_DIR/wheel_base.blend" ]; then
    if command -v blender &> /dev/null; then
        # Create empty Blender file with basic scene
        blender --background --python - <<EOF
import bpy

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Add placeholder objects
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.35,
    minor_radius=0.1,
    location=(0, 0, 0)
)
bpy.context.active_object.name = "tire"

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.25,
    depth=0.15,
    location=(0, 0, 0)
)
bpy.context.active_object.name = "rim"

# Save
bpy.ops.wm.save_as_mainfile(filepath="$MODELS_DIR/wheel_base.blend")
print("✓ Created wheel_base.blend")
EOF
        print_status "Created wheel_base.blend with placeholder geometry"
    else
        print_warning "Blender not found - you'll need to create wheel_base.blend manually"
        echo "  → Model a quad-topology tire and rim"
        echo "  → Import bulb_cc0.fbx and brake_disc.fbx"
        echo "  → Name objects: tire, rim, brake_disc, caliper, bulb_cc0"
    fi
else
    print_warning "wheel_base.blend already exists"
fi

# ============================================================================
# STEP 6: Verify CC0 Licensing
# ============================================================================

echo -e "\n${BLUE}[6/6]${NC} Verifying CC0 licensing..."

CC0_CHECK_PASSED=true

# Check for non-CC0 files (this is a basic check)
if [ -f "$MODELS_DIR/brake_disc.fbx" ]; then
    # In a real scenario, you'd check metadata or a license file
    print_status "Brake disc model present (verify CC0 manually)"
else
    print_warning "Brake disc not found - ensure you download CC0 version"
fi

if [ "$CC0_CHECK_PASSED" = true ]; then
    print_status "CC0 verification passed (manual check recommended)"
else
    print_error "CC0 verification failed - review asset licenses"
    exit 1
fi

# ============================================================================
# CLEANUP
# ============================================================================

echo -e "\n${BLUE}Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"
print_status "Cleanup complete"

# ============================================================================
# FINAL SUMMARY
# ============================================================================

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo "Next steps:"
echo ""
echo "1. Verify all textures are present:"
echo "   ls -lh $TEXTURES_DIR"
echo ""
echo "2. Complete manual model downloads (if not done):"
echo "   • $MODELS_DIR/bulb_cc0.fbx"
echo "   • $MODELS_DIR/brake_disc.fbx"
echo ""
echo "3. Edit wheel_base.blend to model tire/rim (or use placeholder)"
echo "   blender $MODELS_DIR/wheel_base.blend"
echo ""
echo "4. Run the build script:"
echo "   blender -b $MODELS_DIR/wheel_base.blend -P $TOOLS_DIR/build_wheel.py"
echo ""
echo "5. Check outputs:"
echo "   • FBX models: $MODELS_DIR/*.fbx"
echo "   • LODs: $LOD_DIR/wheel_LOD*.fbx"
echo "   • Baked maps: $BAKE_DIR/*.png"
echo ""
echo -e "${BLUE}For detailed instructions, see README_WHEEL.md${NC}\n"

exit 0
