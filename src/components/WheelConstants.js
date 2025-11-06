/**
 * Constants for the Wheel component
 * Extracted magic numbers for better maintainability and documentation
 */

/**
 * Geometry constants
 */
export const SEGMENT_RESOLUTION = 32; // Number of points used to draw each segment arc (higher = smoother)
export const LABEL_RADIUS_RATIO = 0.8; // Label position as ratio of outer radius (0.8 = 80% from center)
export const SPRITE_SCALE_X = 1.0; // Horizontal scale of text sprite
export const SPRITE_SCALE_Y = 0.3; // Vertical scale of text sprite (compressed for better appearance)
export const SPRITE_SCALE_Z = 1.0; // Depth scale of text sprite

/**
 * Canvas rendering constants
 */
export const LABEL_CANVAS_WIDTH = 256; // Canvas width for rendering segment labels
export const LABEL_CANVAS_HEIGHT = 64; // Canvas height for rendering segment labels
export const LABEL_LINE_WIDTH = 3; // Stroke width for text outline

/**
 * Material constants
 */
export const EMISSIVE_MULTIPLIER = 0.1; // Emissive intensity for segment glow effect
export const MATERIAL_ALPHA_TEST = 0.1; // Alpha threshold for transparency cutoff
export const MATERIAL_DEPTH_TEST_OFFSET = 0.1; // Z-offset to prevent z-fighting
export const POINTER_EMISSIVE_MULTIPLIER = 0.2; // Emissive intensity for pointer glow
export const POINTER_Z_OFFSET = 0.1; // Z-offset to position pointer above wheel

/**
 * LED constants
 */
export const LED_SPHERE_SEGMENTS_HORIZONTAL = 12; // Horizontal segments for LED sphere geometry
export const LED_SPHERE_SEGMENTS_VERTICAL = 12; // Vertical segments for LED sphere geometry
export const LED_BASE_INTENSITY = 0.8; // Base emissive intensity for LEDs
export const LED_PULSE_AMOUNT = 0.3; // Amplitude of LED pulsing effect (±30%)
export const LED_PULSE_SPEED_MULTIPLIER = 2; // Multiplier for LED animation speed

/**
 * Edge styling constants
 */
export const EDGE_COLOR = 0xff6600; // Halloween orange color for segment borders
export const EDGE_LINE_WIDTH = 5; // Width of segment border lines

/**
 * Pointer angle constants
 * The pointer is positioned at the top of the wheel (-Math.PI/2 = 270° = top)
 * Angle 0 is at 3 o'clock, increases counter-clockwise:
 * - 0° (0 rad) = Right (3 o'clock)
 * - 90° (π/2 rad) = Top (12 o'clock)
 * - 180° (π rad) = Left (9 o'clock)
 * - 270° (-π/2 rad) = Bottom (6 o'clock)
 * We use -π/2 because we want the pointer at the TOP, which is 90° clockwise from 0°
 */
export const POINTER_ANGLE_RAD = -Math.PI / 2; // Pointer position at top of wheel

/**
 * Fallback segment angle for edge cases
 */
export const FALLBACK_SEGMENT_ANGLE = Math.PI / 4; // 45° default segment span
