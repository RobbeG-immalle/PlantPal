/** Light and dark pastel color palettes for PlantPal. */

export const lightColors = {
  primary: '#6BCB77',       // Soft green
  secondary: '#4D96FF',     // Sky blue
  accent: '#FFD93D',        // Warm yellow
  danger: '#FF6B6B',        // Soft red
  background: '#F8F9FA',    // Off-white
  surface: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#E9ECEF',
  happy: '#6BCB77',
  thirsty: '#FFD93D',
  dying: '#FF6B6B',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: '#FFFFFF',
  tabBarActive: '#6BCB77',
  tabBarInactive: '#B2BEC3',
};

export const darkColors = {
  primary: '#6BCB77',
  secondary: '#4D96FF',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  background: '#1A1A2E',
  surface: '#16213E',
  text: '#EAEAEA',
  textSecondary: '#A0A0A0',
  border: '#2A2A4A',
  happy: '#6BCB77',
  thirsty: '#FFD93D',
  dying: '#FF6B6B',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.7)',
  tabBar: '#16213E',
  tabBarActive: '#6BCB77',
  tabBarInactive: '#636E72',
};

export type ColorScheme = typeof lightColors;

export const colors = lightColors;
