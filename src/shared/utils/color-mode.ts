export type ColorMode = "light" | "dark";

const COLOR_MODE_STORAGE_KEY = "wordseed:color-mode";

export function readColorMode(): ColorMode {
  return window.localStorage.getItem(COLOR_MODE_STORAGE_KEY) === "dark"
    ? "dark"
    : "light";
}

export function applyColorMode(mode: ColorMode) {
  document.documentElement.dataset.seedColorMode = `${mode}-only`;
  window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
}
