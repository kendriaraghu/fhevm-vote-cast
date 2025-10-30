import crypto from 'crypto';

// Calculate deterministic seed
const projectName = "FHEVoteCast";
const network = "sepolia";
const yearMonth = "202501";
const contractName = "FHEVoteCast.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');

// Select design dimensions based on seed
const seedNum = parseInt(seed.substring(0, 8), 16);
const designSystem = ['Material', 'Fluent', 'Neumorphism', 'Glassmorphism', 'Minimal'][seedNum % 5];
const colorScheme = seedNum % 8; // 0-7 corresponding to A-H

export const designTokens = {
  system: designSystem,
  seed: seed,
  
  colors: {
    light: {
      primary: '#A855F7',        // Purple
      secondary: '#7C3AED',      // Deep Purple  
      accent: '#6366F1',         // Indigo
      background: '#FFFFFF',     // White background
      surface: '#F8FAFC',        // Light gray surface
      text: '#0F172A',           // Dark text
      textSecondary: '#64748B',  // Secondary text
      border: '#E2E8F0',         // Light border
      success: '#10B981',        // Green
      warning: '#F59E0B',        // Amber
      error: '#EF4444',          // Red
    },
    dark: {
      primary: '#C084FC',        // Light Purple
      secondary: '#A855F7',      // Purple
      accent: '#818CF8',         // Light Indigo
      background: '#0F172A',     // Dark background
      surface: '#1E293B',        // Dark surface
      text: '#F8FAFC',           // Light text
      textSecondary: '#94A3B8',  // Light secondary text
      border: '#334155',         // Dark border
      success: '#34D399',        // Light Green
      warning: '#FBBF24',        // Light Amber
      error: '#F87171',          // Light Red
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    scale: 1.25,
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.25rem',    // 20px
      xl: '1.563rem',   // 25px
      '2xl': '1.953rem', // 31px
      '3xl': '2.441rem', // 39px
      '4xl': '3.052rem', // 49px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit 8px
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
    xl: '0 20px 25px rgba(0,0,0,0.2)',
    '2xl': '0 25px 50px rgba(0,0,0,0.25)',
  },
  
  transitions: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  layout: 'sidebar', // 'sidebar' | 'masonry' | 'tabs' | 'grid' | 'wizard'
  
  density: {
    compact: {
      padding: { sm: '4px 8px', md: '8px 16px', lg: '12px 24px' },
      gap: '8px',
    },
    comfortable: {
      padding: { sm: '8px 16px', md: '16px 24px', lg: '20px 32px' },
      gap: '16px',
    },
  },
  
  breakpoints: {
    mobile: '0px',      // < 768px
    tablet: '768px',    // 768px - 1024px
    desktop: '1024px',  // > 1024px
  },
  
  glassmorphism: {
    backdrop: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
};

