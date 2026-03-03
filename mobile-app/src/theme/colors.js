// ─── Light Palette (Premium B&W) ───
const lightPalette = {
  primary: '#000000',
  accent: '#FFFFFF',
  background: '#FFFFFF',
  backgroundDark: '#000000',
  white: '#FFFFFF',
  black: '#000000',

  // Cards & Surfaces
  card: '#F5F5F5',
  cardLight: '#EBEBEB',
  inputBg: '#F5F5F5',

  // Text
  textPrimary: '#111111',
  textSecondary: '#6B6B6B',
  textOnDark: '#FFFFFF',

  // Borders & Shadows
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Semantic
  success: '#1DB954',
  danger: '#E53935',
  warning: '#FB8C00',
};

// ─── Dark Palette ───
const darkPalette = {
  primary: '#FFFFFF',
  accent: '#000000',
  background: '#121212',
  backgroundDark: '#000000',
  white: '#FFFFFF',
  black: '#F0F0F0',

  // Cards & Surfaces
  card: '#1E1E1E',
  cardLight: '#2A2A2A',
  inputBg: '#1E1E1E',

  // Text
  textPrimary: '#F0F0F0',
  textSecondary: '#A0A0A0',
  textOnDark: '#000000',

  // Borders & Shadows
  border: '#333333',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Semantic
  success: '#1DB954',
  danger: '#EF5350',
  warning: '#FFA726',
};

// ─── Mutable current palette ───
let _current = { ...lightPalette };

/**
 * Called by ThemeContext whenever the resolved theme changes.
 * Mutates the COLORS reference in-place so that any module
 * holding `import { COLORS }` sees the updated values on re-mount.
 */
export function setThemePalette(mode) {
  const source = mode === 'dark' ? darkPalette : lightPalette;
  Object.keys(source).forEach((key) => {
    _current[key] = source[key];
  });
}

/**
 * Returns the current palette object.
 * Used by components that call getColors() inside render
 * (e.g. AppNavigator, ThemedApp).
 */
export function getColors() {
  return _current;
}

/**
 * Static reference — works because App.js forces a full re-mount
 * via key={isDark} so StyleSheet.create() re-runs with fresh values.
 */
export const COLORS = _current;
