/**
 * BARRELS Official Design System
 * 
 * Core Philosophy:
 * - Backgrounds: black / very dark
 * - Main accents: gold (scores, highlights, icons)
 * - Actions (buttons/links): blue
 * - Text: mostly white, with muted gray for secondary
 * 
 * Color Anchors:
 * - Black, white, and yellow-gold gradient from logo
 * - Avoid random new colors (browns, off-brand shades)
 * - Stick to black, white, gold, and blue
 */

export const barrelsTheme = {
  colors: {
    // Background System
    bg: {
      DEFAULT: '#05070B',  // Midnight black - true background
      surface: '#0B0F17',   // Slightly lighter - cards/tiles
      border: '#1F2933',    // Dark gray - borders/outlines
    },
    
    // Brand Gold (Primary Accent)
    gold: {
      DEFAULT: '#FFC93C',  // Electric gold - main accent
      soft: '#F8E16A',     // Softer gold - gradient end
      light: '#FFD666',    // Light variant
      dark: '#E6B030',     // Dark variant
    },
    
    // Action Blue
    blue: {
      DEFAULT: '#2979FF',  // Action/link color
      light: '#5B9FFF',    // Light variant
      dark: '#1E5ECC',     // Dark variant
    },
    
    // Coach/Admin Purple (distinct from player gold theme)
    purple: {
      DEFAULT: '#9D6FDB',  // Primary coach accent - softer purple
      light: '#B88EE8',    // Light variant for gradients
      dark: '#7C4FC9',     // Dark variant for hover states
      muted: '#6B4A9E',    // Muted purple for borders/subtle backgrounds
    },
    
    // Text System
    text: {
      DEFAULT: '#FFFFFF',  // Primary text (white)
      muted: '#B0B6C3',    // Secondary text (muted gray)
    },
    
    // Support Colors
    support: {
      danger: '#EF4444',   // Errors/warnings
      success: '#10B981',  // Success states
    },
  },
  
  // Semantic color mappings
  semantic: {
    background: '#05070B',
    surface: '#0B0F17',
    border: '#1F2933',
    
    primary: '#FFC93C',     // Gold
    primarySoft: '#F8E16A',
    
    action: '#2979FF',      // Blue
    actionHover: '#5B9FFF',
    actionActive: '#1E5ECC',
    
    text: '#FFFFFF',
    textMuted: '#B0B6C3',
    
    danger: '#EF4444',
    success: '#10B981',
  },
  
  // Gradient combinations
  gradients: {
    gold: 'bg-gradient-to-r from-[#FFC93C] to-[#F8E16A]',
    goldVertical: 'bg-gradient-to-b from-[#FFC93C] to-[#E6B030]',
    blue: 'bg-gradient-to-r from-[#2979FF] to-[#5B9FFF]',
    surface: 'bg-gradient-to-r from-[#0B0F17] to-[#05070B]',
    hero: 'bg-gradient-to-br from-[#FFC93C] via-[#F8E16A] to-[#2979FF]',
  },
} as const;

// Export individual color values for use in Tailwind config
export const barrelsColors = {
  // Background & Surfaces
  'barrels-bg': barrelsTheme.colors.bg.DEFAULT,
  'barrels-surface': barrelsTheme.colors.bg.surface,
  'barrels-border': barrelsTheme.colors.bg.border,
  
  // Gold System
  'barrels-gold': barrelsTheme.colors.gold.DEFAULT,
  'barrels-gold-soft': barrelsTheme.colors.gold.soft,
  'barrels-gold-light': barrelsTheme.colors.gold.light,
  'barrels-gold-dark': barrelsTheme.colors.gold.dark,
  
  // Blue System
  'barrels-blue': barrelsTheme.colors.blue.DEFAULT,
  'barrels-blue-light': barrelsTheme.colors.blue.light,
  'barrels-blue-dark': barrelsTheme.colors.blue.dark,
  
  // Purple System (Coach/Admin Theme)
  'barrels-purple': barrelsTheme.colors.purple.DEFAULT,
  'barrels-purple-light': barrelsTheme.colors.purple.light,
  'barrels-purple-dark': barrelsTheme.colors.purple.dark,
  'barrels-purple-muted': barrelsTheme.colors.purple.muted,
  
  // Text System
  'barrels-text': barrelsTheme.colors.text.DEFAULT,
  'barrels-muted': barrelsTheme.colors.text.muted,
  
  // Support Colors
  'barrels-danger': barrelsTheme.colors.support.danger,
  'barrels-success': barrelsTheme.colors.support.success,
  
  // Legacy Aliases (for backward compatibility)
  'barrels-black': barrelsTheme.colors.bg.DEFAULT,
  'barrels-black-light': barrelsTheme.colors.bg.surface,
  'barrels-black-lighter': barrelsTheme.colors.bg.border,
  'barrels-neutral': barrelsTheme.colors.text.DEFAULT,
  'barrels-neutral-gray': barrelsTheme.colors.text.muted,
};
