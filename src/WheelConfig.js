/**
 * WheelConfig - Configuration for customizable wheel layers
 */

export const DEFAULT_CONFIG = {
    layers: [
        {
            name: 'Inner',
            segments: 8,
            innerRadius: 0.3,
            outerRadius: 2.5,
            options: ['Dance', 'Sing', 'Act', 'Draw', 'Jump', 'Spin', 'Laugh', 'Clap'],
            colors: [0xff6347, 0x4682b4, 0x3cb371, 0xffd700, 0x9370db, 0xfa8072, 0x00ced1, 0xff4500]
        },
        {
            name: 'Outer',
            segments: 12,
            innerRadius: 2.5,
            outerRadius: 4,
            options: ['Movie', 'Music', 'Sports', 'Food', 'Travel', 'Games', 'Books', 'Art', 'Science', 'History', 'Nature', 'Tech'],
            colors: [0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x46f0f0, 0xf032e6, 0xbcf60c, 0xfabebe, 0x008080, 0xe6beff]
        }
    ],
    wheelDepth: 0.3,
    ledCount: 48,
    ledColors: [0xff9900, 0xff00ff]
};

export class WheelConfig {
    constructor(config = DEFAULT_CONFIG) {
        this.layers = config.layers.map(layer => ({...layer}));
        this.wheelDepth = config.wheelDepth || 0.3;
        this.ledCount = config.ledCount || 48;
        this.ledColors = config.ledColors || [0xff9900, 0xff00ff];
    }

    /**
     * Add a new layer
     */
    addLayer(name, segments, innerRadius, outerRadius, options, colors) {
        this.layers.push({
            name,
            segments,
            innerRadius,
            outerRadius,
            options: options || this.generateDefaultOptions(segments),
            colors: colors || this.generateRandomColors(segments)
        });
    }

    /**
     * Remove a layer by index
     */
    removeLayer(index) {
        if (this.layers.length > 1) {
            this.layers.splice(index, 1);
        }
    }

    /**
     * Update layer configuration
     */
    updateLayer(index, updates) {
        if (this.layers[index]) {
            Object.assign(this.layers[index], updates);
        }
    }

    /**
     * Generate default option labels
     */
    generateDefaultOptions(count) {
        return Array.from({ length: count }, (_, i) => `Option ${i + 1}`);
    }

    /**
     * Generate random vibrant colors
     */
    generateRandomColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i / count) * 360;
            const color = this.hslToRgb(hue, 0.8, 0.6);
            colors.push(color);
        }
        return colors;
    }

    /**
     * HSL to RGB color conversion
     */
    hslToRgb(h, s, l) {
        h = h / 360;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
        const m = l - c / 2;

        let r, g, b;
        if (h < 1/6) [r, g, b] = [c, x, 0];
        else if (h < 2/6) [r, g, b] = [x, c, 0];
        else if (h < 3/6) [r, g, b] = [0, c, x];
        else if (h < 4/6) [r, g, b] = [0, x, c];
        else if (h < 5/6) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];

        return ((Math.round((r + m) * 255) << 16) |
                (Math.round((g + m) * 255) << 8) |
                Math.round((b + m) * 255));
    }

    /**
     * Validate configuration
     */
    validate() {
        // Check that layers don't overlap
        for (let i = 0; i < this.layers.length - 1; i++) {
            if (this.layers[i].outerRadius > this.layers[i + 1].innerRadius) {
                console.warn(`Layer ${i} overlaps with layer ${i + 1}`);
            }
        }

        // Check that all layers have matching segments and options
        for (const layer of this.layers) {
            if (layer.options.length !== layer.segments) {
                console.warn(`Layer "${layer.name}" has ${layer.segments} segments but ${layer.options.length} options`);
            }
            if (layer.colors.length !== layer.segments) {
                console.warn(`Layer "${layer.name}" has ${layer.segments} segments but ${layer.colors.length} colors`);
            }
        }

        return true;
    }

    /**
     * Export configuration as JSON
     */
    toJSON() {
        return {
            layers: this.layers,
            wheelDepth: this.wheelDepth,
            ledCount: this.ledCount,
            ledColors: this.ledColors
        };
    }

    /**
     * Load configuration from JSON
     */
    static fromJSON(json) {
        return new WheelConfig(json);
    }
}
