export const COLORS = {
  background: '#0f172a',    // Slate 900
  surface: '#1e293b',       // Slate 800
  surfaceLight: '#334155',  // Slate 700
  surfaceHover: '#475569',  // Slate 600
  
  primary: '#38bdf8',       // Sky 400
  primaryDark: '#0284c7',   // Sky 600
  primaryLight: '#7dd3fc',
  
  accent: '#f59e0b',        // Amber 500
  accentGold: '#eab308',
  
  text: '#f8fafc',          // Slate 50
  textMuted: '#94a3b8',     // Slate 400
  textDim: '#64748b',       // Slate 500
  
  border: '#334155',
  borderHighlight: '#60a5fa',
  
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  
  // Category badge colors
  categories: {
    'Patriarchs': '#f59e0b',       // Amber / Gold
    'Exodus': '#f97316',           // Desert Orange
    'David/Solomon': '#8b5cf6',    // Royal Purple
    'David y Solomon': '#8b5cf6',  // Backward compatibility alias
    'Jesus': '#38bdf8',            // Sky Blue
    'Apostles': '#10b981',         // Emerald Green
    'Other': '#64748b',            // Slate Grey
  } as Record<string, string>,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};
