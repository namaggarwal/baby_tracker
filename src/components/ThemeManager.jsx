import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

export default function ThemeManager() {
  const { settings } = useSettings();

  useEffect(() => {
    // If settings are loaded, apply the theme
    // We expect settings.theme to be 'light', 'dark', or 'system' (default)
    const theme = settings?.theme || 'system';
    
    const applyTheme = (themeName) => {
      if (themeName === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (themeName === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        // System preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    };

    applyTheme(theme);

    // Listen for system theme changes if set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings?.theme]);

  // This component doesn't render anything
  return null;
}
