import { generateId } from '../utils/index.js'

/**
 * Default theme settings
 */
const defaultThemeSettings = {
  colors: {
    primary: '#3b82f6',
    background: '#111827',
    text: '#d1d5db',
    heading: '#ffffff',
    accent: '#10b981'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Inter, sans-serif',
    baseSize: '16px',
    headingScale: 1.25
  },
  layout: {
    containerWidth: '1280px',
    spacingUnit: 4,
    borderRadius: '0.5rem'
  },
  components: {
    button: {
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem'
    },
    card: {
      borderRadius: '0.75rem',
      shadow: 'lg'
    }
  }
}

/**
 * Theme entity class for managing theme data
 */
export class Theme {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.name = data.name || 'Default Theme'
    this.description = data.description || 'A modern, responsive theme'
    this.settings = data.settings || defaultThemeSettings
    this.isActive = data.isActive || false
    this.created_date = data.created_date || new Date().toISOString()
    this.updated_date = data.updated_date || new Date().toISOString()
    this.version = data.version || '1.0.0'
    this.author = data.author || 'SideGen'
  }

  /**
   * Create a new theme
   */
  static async create(themeData) {
    const theme = new Theme({
      ...themeData,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    })
    
    // Save to localStorage for now (will be replaced with proper storage)
    const themes = await this.list()
    themes.push(theme)
    localStorage.setItem('sidegen_themes', JSON.stringify(themes))
    
    return theme
  }

  /**
   * Update an existing theme
   */
  static async update(id, themeData) {
    const themes = await this.list()
    const index = themes.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error(`Theme with id ${id} not found`)
    }
    
    themes[index] = {
      ...themes[index],
      ...themeData,
      updated_date: new Date().toISOString()
    }
    
    localStorage.setItem('sidegen_themes', JSON.stringify(themes))
    return themes[index]
  }

  /**
   * Delete a theme
   */
  static async delete(id) {
    const themes = await this.list()
    const theme = themes.find(t => t.id === id)
    
    if (theme && theme.isActive) {
      throw new Error('Cannot delete the active theme')
    }
    
    const filteredThemes = themes.filter(t => t.id !== id)
    localStorage.setItem('sidegen_themes', JSON.stringify(filteredThemes))
    return true
  }

  /**
   * Get a theme by ID
   */
  static async findById(id) {
    const themes = await this.list()
    return themes.find(t => t.id === id) || null
  }

  /**
   * List all themes
   */
  static async list() {
    try {
      const stored = localStorage.getItem('sidegen_themes')
      let themes = stored ? JSON.parse(stored) : []
      
      // If no themes exist, create a default one
      if (themes.length === 0) {
        const defaultTheme = new Theme({
          name: 'Default Dark',
          description: 'A modern dark theme with blue accents',
          isActive: true,
          settings: defaultThemeSettings
        })
        themes = [defaultTheme]
        localStorage.setItem('sidegen_themes', JSON.stringify(themes))
      }
      
      // Ensure all themes have required fields
      themes = themes.map(theme => new Theme(theme))
      
      return themes
    } catch (error) {
      console.error('Error loading themes:', error)
      return []
    }
  }

  /**
   * Get the active theme
   */
  static async getActive() {
    const themes = await this.list()
    return themes.find(theme => theme.isActive) || themes[0]
  }

  /**
   * Set a theme as active
   */
  static async setActive(id) {
    const themes = await this.list()
    
    // Deactivate all themes
    themes.forEach(theme => {
      theme.isActive = false
    })
    
    // Activate the selected theme
    const selectedTheme = themes.find(theme => theme.id === id)
    if (selectedTheme) {
      selectedTheme.isActive = true
      selectedTheme.updated_date = new Date().toISOString()
    }
    
    localStorage.setItem('sidegen_themes', JSON.stringify(themes))
    return selectedTheme
  }

  /**
   * Clone a theme
   */
  static async clone(id, newName) {
    const theme = await this.findById(id)
    if (!theme) {
      throw new Error(`Theme with id ${id} not found`)
    }
    
    const clonedTheme = new Theme({
      ...theme.toJSON(),
      id: generateId(),
      name: newName || `${theme.name} (Copy)`,
      isActive: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    })
    
    const themes = await this.list()
    themes.push(clonedTheme)
    localStorage.setItem('sidegen_themes', JSON.stringify(themes))
    
    return clonedTheme
  }

  /**
   * Get theme presets
   */
  static getPresets() {
    return {
      'Dark Blue': {
        colors: { primary: '#3b82f6', background: '#111827', text: '#d1d5db', heading: '#ffffff', accent: '#10b981' }
      },
      'Purple': {
        colors: { primary: '#8b5cf6', background: '#1e1b4b', text: '#c4b5fd', heading: '#ffffff', accent: '#f59e0b' }
      },
      'Green': {
        colors: { primary: '#10b981', background: '#064e3b', text: '#d1fae5', heading: '#ffffff', accent: '#3b82f6' }
      },
      'Red': {
        colors: { primary: '#ef4444', background: '#7f1d1d', text: '#fecaca', heading: '#ffffff', accent: '#f97316' }
      },
      'Light': {
        colors: { primary: '#3b82f6', background: '#ffffff', text: '#374151', heading: '#111827', accent: '#10b981' }
      }
    }
  }

  /**
   * Apply a preset to theme settings
   */
  applyPreset(presetName) {
    const presets = Theme.getPresets()
    const preset = presets[presetName]
    
    if (preset) {
      this.settings = {
        ...this.settings,
        ...preset
      }
      this.updated_date = new Date().toISOString()
    }
  }

  /**
   * Validate theme data
   */
  static validate(themeData) {
    const errors = []
    
    if (!themeData.name || themeData.name.trim() === '') {
      errors.push('Theme name is required')
    }
    
    if (!themeData.settings) {
      errors.push('Theme settings are required')
    } else {
      if (!themeData.settings.colors) {
        errors.push('Color settings are required')
      }
      if (!themeData.settings.typography) {
        errors.push('Typography settings are required')
      }
      if (!themeData.settings.layout) {
        errors.push('Layout settings are required')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Export theme data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      settings: this.settings,
      isActive: this.isActive,
      created_date: this.created_date,
      updated_date: this.updated_date,
      version: this.version,
      author: this.author
    }
  }

  /**
   * Generate CSS variables from theme settings
   */
  toCSSVariables() {
    const { colors, typography, layout } = this.settings
    
    return {
      '--color-primary': colors.primary,
      '--color-background': colors.background,
      '--color-text': colors.text,
      '--color-heading': colors.heading,
      '--color-accent': colors.accent,
      '--font-family': typography.fontFamily,
      '--heading-font-family': typography.headingFontFamily,
      '--base-font-size': typography.baseSize,
      '--container-width': layout.containerWidth,
      '--border-radius': layout.borderRadius
    }
  }
}
