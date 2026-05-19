export const colors = {
  primary: {
    main: '#08172d',    // Navy Profundo
    light: '#162b46',   // Navy más claro (no neón)
    dark: '#020a16',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff914d',    // Naranja Coral
    light: '#ffb385',
    dark: '#e67635',
    contrastText: '#ffffff',
  },
  success: {
    main: '#7ed957',
    light: '#98e379',
    dark: '#5eb23a',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffde59',
    light: '#ffe785',
    dark: '#e6c750',
    contrastText: '#1a1a1a',
  },
  info: {
    main: '#00b0ff',
    light: '#33c0ff',
    dark: '#007bb2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ff3d00',
    light: '#ff6333',
    dark: '#b22a00',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f0f2f5',
    paper: '#ffffff',
    alt: '#e0e5eb',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    disabled: '#9e9e9e',
  },
};

// Mapeo para nombres antiguos o específicos de CSS si se requieren
export const cssVariables = {
  '--primary-color': colors.primary.main,
  '--primary-light': colors.primary.light,
  '--primary-dark': colors.primary.dark,
  '--secondary-color': colors.secondary.main,
  '--secondary-light': colors.secondary.light,
  '--secondary-dark': colors.secondary.dark,
  '--success-color': colors.success.main,
  '--success-light': colors.success.light,
  '--success-dark': colors.success.dark,
  '--warning-color': colors.warning.main,
  '--info-color': colors.info.main,
  '--error-color': colors.error.main,
  '--tercero-color': colors.warning.main,
  '--cuarto-color': colors.success.main,
  '--bg-color': colors.background.default,
  '--bg-color2': colors.background.alt,
  '--text-color': colors.text.primary,
  '--text-secondary': colors.text.secondary,
};
