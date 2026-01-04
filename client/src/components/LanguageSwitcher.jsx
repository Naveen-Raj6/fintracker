import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-md">
      <Globe size={16} className="text-slate-300" />
      <select
        onChange={changeLanguage}
        value={i18n.language}
        className="bg-transparent text-slate-300 text-sm focus:outline-none cursor-pointer"
      >
        <option value="en" className="bg-slate-800">English</option>
        <option value="ta" className="bg-slate-800">தமிழ் (Tamil)</option>
        <option value="kn" className="bg-slate-800">ಕನ್ನಡ (Kannada)</option>
        <option value="hi" className="bg-slate-800">हिंदी (Hindi)</option>
        <option value="es" className="bg-slate-800">Español</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
