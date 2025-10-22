const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/03/14/audio_362929.mp3';
const DING_URL = 'https://cdn.freesound.org/previews/512/512123_1634904-lq.mp3'; // CC0 Ding by unfa

const IDLE_VOLUME = 0.25;
const SPIN_VOLUME = 0.8;
const FADE_DURATION = 1.0; // seconds

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicSource = null;
        this.musicGainNode = null;
        this.musicBuffer = null;
        this.dingBuffer = null;
        this.isUnlocked = false;
        this.isMusicPlaying = false;

        this._loadAllAudio();
    }

    /**
     * Initializes the AudioContext and GainNode.
     * This must be called from a user gesture to comply with autoplay policies.
     * @private
     */
    _initContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.gain.setValueAtTime(IDLE_VOLUME, this.audioContext.currentTime);
        this.musicGainNode.connect(this.audioContext.destination);
    }

    /**
     * Fetches an audio file and decodes it into an AudioBuffer.
     * @private
     */
    async _loadAudio(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            // Wait for context to be initialized before decoding
            if (!this.audioContext) {
                // This is a fallback if loading finishes before first user gesture.
                // We will decode later.
                return arrayBuffer; 
            }
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error(`Failed to load audio from ${url}`, error);
            return null;
        }
    }

    /**
     * Loads all required audio files.
     * @private
     */
    async _loadAllAudio() {
        // We fetch as ArrayBuffer first, as AudioContext may not be available yet.
        const [musicData, dingData] = await Promise.all([
            this._loadAudio(MUSIC_URL),
            this._loadAudio(DING_URL)
        ]);
        this.musicBuffer = musicData;
        this.dingBuffer = dingData;
        console.log('Audio assets pre-loaded.');
    }

    /**
     * Unlocks and resumes the AudioContext, and starts the music loop.
     * This is the primary method to call on the first user interaction.
     */
    unlockAudio() {
        if (this.isUnlocked) return;
        
        this._initContext();

        this.audioContext.resume().then(async () => {
            this.isUnlocked = true;
            console.log('AudioContext unlocked.');

            // If buffers were loaded as ArrayBuffer, decode them now.
            if (this.musicBuffer instanceof ArrayBuffer) {
                this.musicBuffer = await this.audioContext.decodeAudioData(this.musicBuffer);
            }
            if (this.dingBuffer instanceof ArrayBuffer) {
                this.dingBuffer = await this.audioContext.decodeAudioData(this.dingBuffer);
            }

            this._playMusicLoop();
        });
    }

    /**
     * Starts the main music loop if it's not already playing.
     * @private
     */
    _playMusicLoop() {
        if (this.isMusicPlaying || !this.musicBuffer) return;

        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.musicBuffer;
        this.musicSource.loop = true;
        this.musicSource.connect(this.musicGainNode);
        this.musicSource.start(0);
        this.isMusicPlaying = true;
    }

    /**
     * Fades the music volume to idle level.
     */
    playIdle() {
        if (!this.isUnlocked) return;
        this.musicGainNode.gain.linearRampToValueAtTime(IDLE_VOLUME, this.audioContext.currentTime + FADE_DURATION);
    }

    /**
     * Unlocks audio if needed and fades the music volume to spin level.
     */
    playSpin() {
        if (!this.isUnlocked) {
            this.unlockAudio();
        }
        this.musicGainNode.gain.linearRampToValueAtTime(SPIN_VOLUME, this.audioContext.currentTime + FADE_DURATION);
    }

    /**
     * Plays the "ding" sound effect once.
     */
    playDing() {
        if (!this.isUnlocked || !this.dingBuffer) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.dingBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
    }
}
