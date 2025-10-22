/**
 * FullscreenLauncher - Handles fullscreen API and kiosk mode
 */
export class FullscreenLauncher {
    constructor() {
        this.isFullscreen = false;
        this._setupListeners();
    }

    /**
     * Setup fullscreen change listeners
     * @private
     */
    _setupListeners() {
        document.addEventListener('fullscreenchange', () => this._onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this._onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this._onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this._onFullscreenChange());
    }

    /**
     * Handle fullscreen state changes
     * @private
     */
    _onFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        console.log(`Fullscreen: ${this.isFullscreen}`);

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('fullscreenchange', {
            detail: { isFullscreen: this.isFullscreen }
        }));
    }

    /**
     * Request fullscreen mode
     * Must be called from a user gesture (click, touch, etc.)
     */
    enterFullscreen() {
        const element = document.documentElement;

        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            // Safari/Arc compatibility
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            // Firefox
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            // IE/Edge
            element.msRequestFullscreen();
        }
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    /**
     * Enter kiosk mode (fullscreen + hide cursor on idle)
     */
    enterKioskMode() {
        this.enterFullscreen();

        // Optional: Hide cursor after inactivity
        let cursorTimeout;
        const hideCursor = () => {
            document.body.style.cursor = 'none';
        };

        const showCursor = () => {
            document.body.style.cursor = 'default';
            clearTimeout(cursorTimeout);
            cursorTimeout = setTimeout(hideCursor, 3000);
        };

        document.addEventListener('mousemove', showCursor);
        showCursor();
    }
}
