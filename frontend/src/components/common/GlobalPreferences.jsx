import { useTranslation } from 'react-i18next';
import useTheme from '../../hooks/useTheme';

const LANGUAGE_OPTIONS = ['ko', 'en', 'ja'];

function GlobalPreferences() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const currentLanguage = LANGUAGE_OPTIONS.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'en';

  return (
    <div className="global-preferences">
      <select
        value={currentLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label="Language"
        className="pref-select"
      >
        <option value="ko">KO</option>
        <option value="en">EN</option>
        <option value="ja">JA</option>
      </select>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="pref-theme-btn"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </div>
  );
}

export default GlobalPreferences;
