import { useTheme } from '../lib/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="ml-2 p-2 rounded transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'dark' ? (
        <SunIcon className="h-6 w-6 text-yellow-400 transition-transform duration-300" />
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-700 dark:text-gray-300 transition-transform duration-300" />
      )}
    </button>
  );
}