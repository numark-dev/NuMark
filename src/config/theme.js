/**
 * Theme configuration and management
 */

export const defaultThemeConfig = {
  name: 'default',
  version: '1.0.0',
  description: 'Default SideGen theme',
  
  // Color scheme
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  },
  
  // Dark mode colors
  darkColors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    accent: '#34d399',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    error: '#f87171',
    warning: '#fbbf24',
    success: '#34d399',
    info: '#60a5fa'
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem'
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  
  // Layout
  layout: {
    containerMaxWidth: '1280px',
    contentMaxWidth: '768px',
    sidebarWidth: '256px',
    headerHeight: '64px',
    footerHeight: '80px'
  },
  
  // Components
  components: {
    button: {
      borderRadius: 'md',
      fontWeight: 'medium',
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem'
      }
    },
    card: {
      borderRadius: 'lg',
      padding: '1.5rem',
      shadow: 'md'
    },
    input: {
      borderRadius: 'md',
      padding: '0.75rem 1rem',
      borderWidth: '1px'
    }
  }
}

/**
 * Load theme configuration
 */
export async function loadThemeConfig(themeName = 'default') {
  try {
    // Try to load custom theme config
    const themeConfigPath = `./themes/${themeName}/theme.config.js`
    const themeConfig = await import(themeConfigPath)
    
    return mergeThemeConfig(defaultThemeConfig, themeConfig.default || themeConfig)
  } catch (error) {
    // Fallback to default theme
    console.warn(`Could not load theme config for '${themeName}', using default`)
    return defaultThemeConfig
  }
}

/**
 * Merge theme configurations
 */
function mergeThemeConfig(defaultConfig, userConfig) {
  const merged = { ...defaultConfig }
  
  for (const [key, value] of Object.entries(userConfig)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = { ...merged[key], ...value }
    } else {
      merged[key] = value
    }
  }
  
  return merged
}

/**
 * Generate CSS variables from theme config
 */
export function generateCSSVariables(themeConfig, isDark = false) {
  const colors = isDark ? themeConfig.darkColors : themeConfig.colors
  const variables = {}
  
  // Color variables
  for (const [name, value] of Object.entries(colors)) {
    variables[`--color-${name}`] = value
  }
  
  // Typography variables
  variables['--font-family-sans'] = themeConfig.typography.fontFamily.sans.join(', ')
  variables['--font-family-serif'] = themeConfig.typography.fontFamily.serif.join(', ')
  variables['--font-family-mono'] = themeConfig.typography.fontFamily.mono.join(', ')
  
  // Layout variables
  for (const [name, value] of Object.entries(themeConfig.layout)) {
    variables[`--layout-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value
  }
  
  return variables
}

/**
 * Generate Tailwind CSS config from theme
 */
export function generateTailwindConfig(themeConfig) {
  return {
    theme: {
      extend: {
        colors: {
          primary: themeConfig.colors.primary,
          secondary: themeConfig.colors.secondary,
          accent: themeConfig.colors.accent,
          surface: themeConfig.colors.surface,
          'text-primary': themeConfig.colors.text,
          'text-secondary': themeConfig.colors.textSecondary
        },
        fontFamily: themeConfig.typography.fontFamily,
        fontSize: themeConfig.typography.fontSize,
        fontWeight: themeConfig.typography.fontWeight,
        lineHeight: themeConfig.typography.lineHeight,
        spacing: themeConfig.spacing,
        borderRadius: themeConfig.borderRadius,
        boxShadow: themeConfig.boxShadow,
        maxWidth: {
          container: themeConfig.layout.containerMaxWidth,
          content: themeConfig.layout.contentMaxWidth
        }
      }
    }
  }
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config) {
  const errors = []
  
  // Check required fields
  if (!config.name) {
    errors.push('Theme name is required')
  }
  
  if (!config.colors) {
    errors.push('Theme colors are required')
  } else {
    const requiredColors = ['primary', 'background', 'text']
    for (const color of requiredColors) {
      if (!config.colors[color]) {
        errors.push(`Theme color '${color}' is required`)
      }
    }
  }
  
  if (!config.typography) {
    errors.push('Theme typography configuration is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Create theme preset
 */
export function createThemePreset(name, overrides = {}) {
  return {
    ...defaultThemeConfig,
    name,
    ...overrides
  }
}

// Built-in theme presets
export const themePresets = {
  light: createThemePreset('light', {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280'
    }
  }),
  
  dark: createThemePreset('dark', {
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      accent: '#34d399',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af'
    }
  }),
  
  minimal: createThemePreset('minimal', {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#000000',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666'
    },
    typography: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['monospace']
      }
    }
  }),
  
  colorful: createThemePreset('colorful', {
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b'
    }
  })
}
