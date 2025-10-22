
# 🎡 3D Carnival Spinning Wheel 🎡

> A vibrant, customizable, and feature-rich 3D spinning wheel built with Three.js and a physics-based spin controller. Designed to bring a fun, cartoonish, and high-quality interactive experience to the web.

![Spinning Wheel Demo](https://i.imgur.com/your-demo-gif.gif)

---

## ✨ Features

*   **Dual-Ring Design**: Two independent rings for combined outcomes (e.g., "Sing" + "a Pop Song").
*   **Physics-Based Spinning**: Uses a custom spin controller for a realistic and satisfying spinning motion.
*   **PBR Materials**: Physically Based Rendering for high-quality, realistic materials with reflections and lighting.
*   **Dynamic Effects**:
    *   🎉 **Confetti Burst** on spin start.
    *   💨 **Motion Lines** and **Camera Shake** as the wheel slows down.
    *   💡 **Flashing Corner Lights** when the wheel stops.
    *   ✨ **Animated LED Rim** with pulsing lights.
*   **Audio Management**:
    *   🎵 Background music that fades between idle and spinning states.
    *   🔊 Sound effects for spin start and winning.
*   **Customizable**: Easily change the outcomes, colors, and number of segments on each wheel.
*   **Fullscreen Mode**: Kiosk mode support for an immersive experience.
*   **Outcome Display**: A clean, animated display shows the winning combination.

---

## 🛠️ Technologies Used

*   **Graphics**: [Three.js](https://threejs.org/)
*   **Particle Effects**: [Three.quarks](https://github.com/Alchemist0823/three.quarks)
*   **Post-Processing**: [postprocessing](https://github.com/vanruesc/postprocessing)
*   **Physics**: Custom physics-based controller
*   **Module Bundling**: Native ES Modules with `importmap`

---

## 🚀 Getting Started

### Prerequisites

*   A modern web browser that supports WebGL and ES Modules.
*   A local web server to serve the files. The `live-server` VS Code extension or `npx http-server` are great options.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/wheel-spin.git
    cd wheel-spin
    ```

2.  **Install dependencies:**
    This project uses `npm` to manage the required JavaScript libraries.
    ```bash
    npm install
    ```

### Running the Project

1.  **Start a local server** in the project's root directory. For example:
    ```bash
    npx http-server .
    ```

2.  **Open your browser** and navigate to the local server's address (e.g., `http://localhost:8080`).

---

## 🎨 How to Customize

Customizing the wheel is easy! All the main configuration is located in `src/Wheel.js`.

### Changing Wheel Segments (Outcomes and Colors)

1.  **Open `src/Wheel.js`**.
2.  Find the following constant arrays at the top of the file:

    ```javascript
    // Inner Ring
    const SEGMENTS_INNER = 8;
    const COLORS_INNER = [0xff6347, 0x4682b4, ...];
    const OUTCOMES_INNER = ['Dance', 'Sing', ...];

    // Outer Ring
    const SEGMENTS_OUTER = 12;
    const COLORS_OUTER = [0xe6194b, 0x3cb44b, ...];
    const OUTCOMES_OUTER = ['Movie', 'Music', ...];
    ```

3.  **To change the outcomes**, simply edit the `OUTCOMES_INNER` and `OUTCOMES_OUTER` arrays.
4.  **To change the colors**, edit the `COLORS_INNER` and `COLORS_OUTER` arrays. The colors are hex values.
5.  **To change the number of segments**, update the `SEGMENTS_INNER` or `SEGMENTS_OUTER` constants. Make sure the number of items in the corresponding `COLORS` and `OUTCOMES` arrays matches the segment count!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/wheel-spin/issues).

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
