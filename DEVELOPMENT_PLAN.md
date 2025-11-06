# Spinning Wheel Development Plan

> A phase-by-phase roadmap for building a bulletproof spinning wheel from the ground up.
> Prioritizes infrastructure first, then layers on the cool visual features.

---

## Overview

This plan takes the current Halloween-themed spinning wheel and transforms it into a production-ready, visually stunning experience through 4 distinct phases:

1. **Phase 1**: Critical Infrastructure (Make it Actually Work)
2. **Phase 2**: Solid Foundations (Testing & Quality)
3. **Phase 3**: Visual Excellence (Cool & Fun Features)
4. **Phase 4**: Advanced Features (Polish & Extras)

---

## Phase 1: Critical Infrastructure 🔧

**Goal**: Make the app functional and fix blocking issues.

### 1.1 Dependencies & Environment
- [ ] Run `npm install` to restore all dependencies
- [ ] Verify Three.js and postprocessing are correctly installed
- [ ] Test development server starts without errors
- [ ] Confirm all build scripts work

### 1.2 Fix Broken Functionality
- [ ] **CRITICAL**: Fix segment result display
  - Currently `wheel.getCurrentSegment()` is called but result is ignored (main.js:59)
  - Add result capture: `const winner = wheel.getCurrentSegment();`
  - Display winner in UI (console.log → DOM element)

- [ ] Create result display UI element
  - Add styled div for showing winning segment
  - Animate result appearance (fade in, scale up)
  - Show segment color alongside text

- [ ] Add spin cooldown visual feedback
  - Currently 2-second cooldown exists but no user indication
  - Disable button styling during cooldown
  - Show countdown timer or spinner

### 1.3 Documentation Accuracy
- [ ] Update README.md to reflect Halloween theme
  - Change "Tech-Themed Segments" → "Halloween Adventure Wheel"
  - Update segment examples (JavaScript → Haunted House, etc.)
  - Fix customization instructions to point to `src/config/appConfig.js`

- [ ] Fix script discrepancy
  - Add `"dev": "npm start"` to package.json
  - Or update README to only reference `npm start`

### 1.4 Configuration Validation
- [ ] Add input validation to `src/config/appConfig.js`
  - Validate `outerRadius > innerRadius > 0`
  - Ensure segment count > 0
  - Validate LED count > 0 and colors array not empty
  - Check physics values are positive numbers

- [ ] Add JSDoc type hints to config objects
  - Document expected types for each property
  - Add inline comments for complex values

**Phase 1 Success Criteria**:
✓ App runs without dependencies errors
✓ Winning segment is displayed to user
✓ Documentation matches actual code
✓ Configuration has basic validation

---

## Phase 2: Solid Foundations 🏗️

**Goal**: Build robust testing and improve code quality.

### 2.1 Component Testing
- [ ] Add comprehensive tests for Wheel component
  - Test segment creation with various configs
  - Test rotation updates
  - Test LED animation logic
  - Test segment detection accuracy at edge cases (0°, 360°, wraparound)

- [ ] Add tests for ConfettiSystem
  - Test particle lifecycle (create → update → remove)
  - Test physics calculations (gravity, drag, wind)
  - Verify cleanup on particle expiration

- [ ] Add integration tests for main.js
  - Test complete spin cycle (start → rotate → stop → display result)
  - Test button state management
  - Test window resize handling

### 2.2 Code Quality Improvements
- [ ] Document magic numbers with constants
  - Extract `0.8` label radius multiplier → `LABEL_RADIUS_RATIO`
  - Extract `0.3` LED scale → `LED_SCALE_FACTOR`
  - Extract `32` segment resolution → `SEGMENT_POLYGON_SIDES`

- [ ] Add explanatory comments to complex logic
  - Document angle normalization in `getCurrentSegment()` (Wheel.js:205-241)
  - Explain sprite rotation calculation: `midAngle + Math.PI / 2`
  - Document confetti physics constant choices (why gravity=0.0008?)

- [ ] Refactor segment detection logic
  - Extract to helper function: `isAngleInSegment(angle, segmentIndex)`
  - Add visual diagram comment showing angle calculation
  - Simplify wraparound handling

### 2.3 Performance Optimization
- [ ] Optimize canvas texture creation
  - Consider texture atlasing for segment labels
  - Cache rendered textures instead of recreating on resize
  - Batch canvas operations

- [ ] Throttle mouse movement listener
  - Currently fires on every pixel move
  - Use requestAnimationFrame for batching
  - Add dead zone threshold

- [ ] Audit confetti particle updates
  - Currently 50 particles × many updates per frame
  - Consider object pooling for particles
  - Profile rendering bottlenecks

**Phase 2 Success Criteria**:
✓ >80% code coverage on all components
✓ All magic numbers documented
✓ Performance profile shows 60fps stable
✓ No linting warnings or errors

---

## Phase 3: Visual Excellence ✨

**Goal**: Make it cool, fun, and visually stunning.

### 3.1 Enhanced Spin Animations
- [ ] **Add easing to spin physics**
  - Replace linear friction with easing curves (ease-out-cubic)
  - Add anticipation: slight reverse rotation before spin starts
  - Add overshoot: wheel bounces slightly past final position

- [ ] **Spinning visual effects**
  - Add motion blur during high-speed rotation
  - Add bloom/glow effect to LEDs during spin
  - Pulse wheel scale during acceleration (scale: 1.0 → 1.05 → 1.0)

- [ ] **LED enhancement during spin**
  - LEDs rotate around perimeter during spin (chase effect)
  - Increase LED intensity during high velocity
  - Add rainbow gradient that travels around rim

### 3.2 Result Display Animations
- [ ] **Winner announcement sequence**
  - Dramatic reveal: screen darkens, spotlight on winning segment
  - Winning segment pulses/glows brighter
  - Segment label zooms in to center of screen
  - Add particle burst from winning segment position

- [ ] **Result card animation**
  - Slide in from bottom with bounce
  - Show segment icon/emoji at large scale
  - Animate segment color as card background
  - Add "WINNER!" text with sparkle effect

- [ ] **Confetti enhancements**
  - Use winning segment's color for confetti
  - Add confetti trails/ribbons (not just squares)
  - Confetti bursts from multiple points around wheel
  - Add floating emoji/icons matching segment theme

### 3.3 Interactive Enhancements
- [ ] **Segment hover effects** (before spin)
  - Highlight segment on hover
  - Scale up slightly
  - Show tooltip with segment description
  - Add glow effect to hovered segment

- [ ] **Button animations**
  - Pulse effect when idle and ready to spin
  - Add particle effect around button
  - Haptic feedback on mobile (vibration API)
  - Satisfying click animation (scale down → spring back)

- [ ] **Ambient effects**
  - Add subtle background gradient animation
  - Floating particles in background
  - Dynamic shadows under wheel
  - Ambient occlusion for depth

### 3.4 Theme Variations
- [ ] **Create theme system**
  - Extract Halloween theme to config
  - Create alternate themes: Neon, Cyberpunk, Pastel, Minimal
  - Theme affects colors, effects intensity, fonts

- [ ] **Add theme selector UI**
  - Dropdown or button group for theme selection
  - Preview themes before applying
  - Persist theme choice in localStorage
  - Smooth transition between themes

### 3.5 Camera & Perspective Effects
- [ ] **Dynamic camera movements**
  - Zoom in slightly as wheel spins faster
  - Camera shake effect at high speeds
  - Tilt perspective during acceleration
  - Pull back for "10,000 feet high" overview mode

- [ ] **Depth and 3D effects**
  - Add perspective tilt (wheel at slight angle, not perfectly flat)
  - Add depth to segments (extrude into 3D)
  - Parallax effect on background
  - Shadow under wheel that reacts to lighting

**Phase 3 Success Criteria**:
✓ Users say "wow that's cool!" when seeing it
✓ Smooth 60fps maintained during all animations
✓ Multiple themes implemented and switchable
✓ Result display is dramatic and satisfying

---

## Phase 4: Advanced Features 🚀

**Goal**: Polish and add professional-grade features.

### 4.1 Sound Design
- [ ] **Add audio feedback system**
  - Install/create audio manager utility
  - Button click sound (satisfying thunk)
  - Spin start sound (whoosh)
  - Ticking sound as wheel slows (increases frequency near stop)
  - Winner announcement sound (fanfare/chime)
  - Confetti pop sounds

- [ ] **Background music (optional)**
  - Subtle ambient music during idle
  - Increase intensity during spin
  - Triumphant music on result reveal
  - Volume controls and mute toggle

### 4.2 Mobile Optimization
- [ ] **Touch gesture support**
  - Swipe gesture to spin wheel (natural interaction)
  - Pinch to zoom (if camera controls added)
  - Touch feedback on button press
  - Optimize confetti count for mobile (reduce to 25 particles)

- [ ] **Responsive adjustments**
  - Adjust wheel size for mobile viewports
  - Simplify particle effects on low-end devices
  - Reduce LED count on mobile (16 → 8)
  - Test on various screen sizes and orientations

- [ ] **Performance mode toggle**
  - Auto-detect device performance
  - Reduce effects on slower devices
  - Option to manually toggle high/low quality

### 4.3 Accessibility
- [ ] **Screen reader support**
  - Add ARIA labels to all interactive elements
  - Announce spin result to screen readers
  - Describe wheel state (spinning, stopped, result)
  - Label all segments with accessible text

- [ ] **Keyboard controls**
  - Space bar to spin wheel
  - Tab navigation to button
  - Escape to cancel/reset (if applicable)
  - Arrow keys to preview segments (before spin)

- [ ] **Reduced motion support**
  - Detect `prefers-reduced-motion` media query
  - Disable or simplify animations
  - Still show results without spin
  - Provide instant result option

### 4.4 Advanced Features
- [ ] **Spin history tracking**
  - Store last 10 spin results in state
  - Display history panel showing previous winners
  - Statistics: most landed segment, least landed
  - Export history as JSON/CSV

- [ ] **Custom segment configuration UI**
  - In-app editor for segments (no code rebuild needed)
  - Add/remove segments dynamically
  - Color picker for segments
  - Upload images for segment icons
  - Save custom configs to localStorage

- [ ] **Multiplayer/Social features**
  - Share result as image (canvas to PNG)
  - Social media share buttons
  - QR code for sharing wheel configuration
  - Embed code for websites

- [ ] **Advanced physics options**
  - User-adjustable friction slider
  - Min/max spin duration settings
  - Weighted segments (some more likely than others)
  - "Lucky mode" (bias towards specific segments)

### 4.5 Production Readiness
- [ ] **Build optimization**
  - Add Vite or Webpack for production builds
  - Code splitting for faster initial load
  - Tree shaking to remove unused Three.js modules
  - Minification and compression

- [ ] **Error handling & logging**
  - Graceful fallbacks for WebGL unsupported browsers
  - Error boundary component
  - Sentry or error tracking integration
  - User-friendly error messages

- [ ] **Analytics (optional)**
  - Track spin counts
  - Track segment win rates
  - Track user engagement metrics
  - A/B test different animations

**Phase 4 Success Criteria**:
✓ Accessible to users with disabilities
✓ Works flawlessly on mobile devices
✓ Production build is optimized and fast
✓ Audio enhances experience without being annoying
✓ Users can customize and share their wheels

---

## Implementation Priority Summary

```
MUST HAVE (Phase 1):     Fix result display, install deps, validate config
SHOULD HAVE (Phase 2):   Testing, refactoring, performance optimization
NICE TO HAVE (Phase 3):  Cool animations, themes, visual polish
OPTIONAL (Phase 4):      Sound, mobile gestures, accessibility, social features
```

---

## Development Guidelines

### Before Starting Each Phase
1. Create a git branch: `feature/phase-{N}-{description}`
2. Review phase checklist
3. Estimate time for each task
4. Identify dependencies between tasks

### During Phase Development
1. Complete tasks in order (top to bottom)
2. Write tests before implementing features (TDD when possible)
3. Commit frequently with descriptive messages
4. Run quality checks: `npm run check:quality`
5. Update this plan if tasks change or new ones are discovered

### Phase Completion
1. All checklist items marked complete
2. All tests passing
3. No linting errors or warnings
4. Documentation updated
5. Merge branch to main
6. Tag release: `v{phase}.0.0`

---

## Notes

- **Don't skip phases**: Each phase builds on the previous
- **Phase 1 is blocking**: Cannot proceed without dependencies and functional result display
- **Phase 3 is the fun phase**: This is where it gets cool and satisfying
- **Phase 4 is optional**: Pick and choose features based on project goals

---

## Current Status

**Starting Point**: Phase 1, Task 1.1 (Need to install dependencies)

**Estimated Timeline**:
- Phase 1: 1-2 days
- Phase 2: 3-5 days
- Phase 3: 5-7 days
- Phase 4: 7-10 days (optional features can be deferred)

**Total**: 2-3 weeks for all phases

---

## Questions to Consider

1. **Target Audience**: Is this for personal use, portfolio, or production app?
2. **Theme Focus**: Stick with Halloween or make it a general-purpose wheel?
3. **Customization Level**: How much control should users have over configuration?
4. **Platform Priority**: Desktop-first or mobile-first approach?
5. **Feature Scope**: Complete all phases or stop after Phase 3?

---

**Last Updated**: November 6, 2025
**Status**: Ready to begin Phase 1
