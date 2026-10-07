import * as THREE from "three";

import { Wheel } from "./components/Wheel.js";
import { APP_CONFIG } from "./config/appConfig.js";
import { SpinController } from "./controllers/SpinController.js";
import { ConfettiSystem } from "./effects/ConfettiSystem.js";
import {
  pushSpinHistory,
  saveSegments,
  exportPreset,
  importPreset,
  MIN_SEGMENTS,
} from "./utils/segmentStore.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(APP_CONFIG.scene.backgroundColor);

scene.add(
  new THREE.AmbientLight(0x404040, APP_CONFIG.scene.ambientLightIntensity),
);
const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  APP_CONFIG.scene.directionalLightIntensity,
);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  APP_CONFIG.scene.cameraFov,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(
  APP_CONFIG.scene.cameraPosition.x,
  APP_CONFIG.scene.cameraPosition.y,
  APP_CONFIG.scene.cameraPosition.z,
);

const canvas = document.querySelector("#c");
if (!canvas) {
  throw new Error('Canvas element with id "c" not found');
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (error) {
  const fallback = document.getElementById("webglFallback");
  if (fallback) fallback.dataset.visible = "true";
  throw error;
}
if (!renderer.getContext()) {
  const fallback = document.getElementById("webglFallback");
  if (fallback) fallback.dataset.visible = "true";
  throw new Error("WebGL context unavailable");
}
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const wheel = new Wheel(scene);
const spinController = new SpinController();
const confettiSystem = new ConfettiSystem(scene);
confettiSystem.setCamera(camera);

const spinButton = document.getElementById("spinButton");
if (!spinButton) {
  throw new Error("Spin button element not found");
}

const winnerOverlay = document.getElementById("winnerOverlay");
const winnerSegmentName = document.getElementById("winnerSegmentName");
const spinAgainButton = document.getElementById("spinAgainButton");
if (!winnerOverlay || !winnerSegmentName || !spinAgainButton) {
  throw new Error("Winner modal elements not found");
}

/** Shareable spin result via URL hash (#26). Format: #spin=<b64url(json)> */
function encodeSpinShare(payload) {
  const json = JSON.stringify(payload);
  let b64 = btoa(unescape(encodeURIComponent(json)))
    .replaceAll('+', '-')
    .replaceAll('/', '_');
  while (b64.endsWith('=')) b64 = b64.slice(0, -1);
  return `#spin=${b64}`;
}

function decodeSpinShare(hash) {
  const m = (hash || '').match(/[#&?]spin=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    let b64 = m[1].replaceAll('-', '+').replaceAll('_', '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}

function currentSegmentLabels() {
  return (APP_CONFIG.segments || []).map((s) => s.label || s.name || String(s));
}

function applySharedResult(data) {
  if (!data || !data.winner) return false;
  showWinnerModal(data.winner);
  const status = document.getElementById('spinStatus');
  if (status) status.textContent = `Shared result: ${data.winner}`;
  return true;
}

async function copyShareLink(winnerLabel) {
  const payload = {
    v: 1,
    winner: winnerLabel,
    segments: currentSegmentLabels(),
  };
  const url = `${location.origin}${location.pathname}${location.search}${encodeSpinShare(payload)}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.append(ta);
    ta.select();
    try {
      return document.execCommand('copy');
    } finally {
      ta.remove();
    }
  }
}

let previouslyFocusedElement = null;
let lastWinnerLabel = null;

function showWinnerModal(segmentLabel) {
  lastWinnerLabel = segmentLabel;
  try {
    pushSpinHistory(segmentLabel);
  } catch {
    /* ignore quota / private mode */
  }

  // Store the previously focused element
  previouslyFocusedElement = document.activeElement;

  // Update the modal with the winning segment
  winnerSegmentName.textContent = segmentLabel;

  // Show the modal
  winnerOverlay.classList.add("show");
  winnerOverlay.setAttribute("aria-hidden", "false");

  // Move focus to the "Spin Again" button for keyboard navigation
  spinAgainButton.focus();
}

function closeWinnerModal() {
  // Hide the modal
  winnerOverlay.classList.remove("show");
  winnerOverlay.setAttribute("aria-hidden", "true");

  // Restore focus to the previously focused element (or the spin button)
  if (previouslyFocusedElement && previouslyFocusedElement !== document.body) {
    previouslyFocusedElement.focus();
  } else {
    spinButton.focus();
  }
}

function handleSpinClick() {
  if (spinController.isSpinning || spinButton.disabled) {
    return;
  }

  spinButton.disabled = true;
  spinButton.setAttribute("aria-busy", "true");
  spinButton.setAttribute("aria-label", "Spinning");
  spinButton.textContent = APP_CONFIG.ui.buttonDisabledText;
  const status = document.getElementById("spinStatus");
  if (status) status.textContent = "Spin started";

  spinController.startSpin((_finalAngle) => {
    const winningSegment = wheel.getCurrentSegment();
    const reduceMotion = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduceMotion) {
      confettiSystem.createConfetti();
    }

    // Show the winner announcement modal
    showWinnerModal(winningSegment.label);

    setTimeout(() => {
      spinButton.disabled = false;
      spinButton.setAttribute("aria-busy", "false");
      spinButton.removeAttribute("aria-label");
      spinButton.textContent = APP_CONFIG.ui.buttonText;
      if (status)
        status.textContent = `Result: ${winnerSegmentName?.textContent || "done"}`;
    }, APP_CONFIG.ui.buttonCooldown);
  });
}

spinButton.addEventListener("click", handleSpinClick);
canvas.addEventListener("click", handleSpinClick);
canvas.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleSpinClick();
  }
});
spinAgainButton.addEventListener("click", closeWinnerModal);

const shareResultButton = document.getElementById('shareResultButton');
if (shareResultButton) {
  shareResultButton.addEventListener('click', async () => {
    const label = lastWinnerLabel || winnerSegmentName.textContent;
    const ok = await copyShareLink(label);
    shareResultButton.textContent = ok ? 'Link copied' : 'Copy failed';
    setTimeout(() => {
      shareResultButton.textContent = 'Copy share link';
    }, 1500);
  });
}

const shared = decodeSpinShare(location.hash);
if (shared) applySharedResult(shared);

// Handle Escape key to close the modal
globalThis.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && winnerOverlay.classList.contains("show")) {
    closeWinnerModal();
  }
});

let animationTime = 0;

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    return;
  }

  animationTime += APP_CONFIG.animation.frameDelta;

  const angle = spinController.update();
  wheel.updateRotation(angle);
  wheel.updateLEDs(animationTime);
  confettiSystem.update();
  renderer.render(scene, camera);
}

animate();

let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, APP_CONFIG.animation.resizeDebounceMs);
}

window.addEventListener("resize", handleResize);

function cleanup() {
  window.removeEventListener("resize", handleResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  renderer.dispose();
  scene.clear();
}

window.addEventListener("beforeunload", cleanup);

function setupSegmentEditor(appConfig, rebuildWheel) {
  const ta = document.getElementById("segmentPresetJson");
  const status = document.getElementById("segmentEditorStatus");
  const saveBtn = document.getElementById("segmentSaveBtn");
  const exportBtn = document.getElementById("segmentExportBtn");
  const importBtn = document.getElementById("segmentImportBtn");
  const fileInput = document.getElementById("segmentImportFile");
  if (!ta || !saveBtn) return;

  const syncTa = () => {
    ta.value = exportPreset(appConfig.segments);
  };
  syncTa();

  saveBtn.addEventListener("click", () => {
    try {
      const next = importPreset(ta.value);
      if (next.length < MIN_SEGMENTS)
        throw new Error(`need at least ${MIN_SEGMENTS}`);
      saveSegments(next);
      appConfig.segments = next;
      status.textContent = "Saved. Reload to rebuild wheel meshes.";
      if (typeof rebuildWheel === "function") rebuildWheel();
      else location.reload();
    } catch (error) {
      status.textContent = String(error.message || error);
    }
  });
  exportBtn?.addEventListener("click", () => {
    const blob = new Blob([exportPreset(appConfig.segments)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wheel-segments.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  importBtn?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    try {
      ta.value = await f.text();
      status.textContent = "Imported into editor — click Save segments.";
    } catch (error) {
      status.textContent = String(error.message || error);
    }
  });
}

setupSegmentEditor(APP_CONFIG.wheel);
