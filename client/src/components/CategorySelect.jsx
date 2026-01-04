import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Utensils, Home, Car, Zap, Clapperboard, 
    Stethoscope, User, TrendingUp, Landmark, HelpCircle, ChevronDown,
    Wallet, Banknote, Gem, Briefcase // New icons for Income
} from 'lucide-react';

const EXPENSE_ICONS = {
    'Food': <Utensils size={18} />,
    'Housing': <Home size={18} />,
    'Transportation': <Car size={18} />,
    'Utilities': <Zap size={18} />,
    'Entertainment': <Clapperboard size={18} />,
    'Healthcare': <Stethoscope size={18} />,
    'Personal': <User size={18} />,
    'Investment': <TrendingUp size={18} />,
    'Loan/EMI': <Landmark size={18} />,
    'Other': <HelpCircle size={18} />,
};

const INCOME_ICONS = {
    'Salary': <Wallet size={18} />,
    'SIP': <TrendingUp size={18} />,
    'Mutual Fund': <Banknote size={18} />,
    'Gold/Silver': <Gem size={18} />,
    'Business': <Briefcase size={18} />,
    'Other': <HelpCircle size={18} />,
};

const CategorySelect = ({ value, onChange, name = "category", type = "expense" }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const ICONS = type === 'income' ? INCOME_ICONS : EXPENSE_ICONS;
    const categories = Object.keys(ICONS);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (category) => {
        // Create a fake event object to mimic select behavior for generic handlers
        const event = {
            target: {
                name: name,
                value: category
            }
        };
        onChange(event);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white flex items-center justify-between focus:ring-2 focus:ring-accent"
            >
                <div className="flex items-center gap-2">
                    {ICONS[value] || <HelpCircle size={18} />}
                    <span>{value || t('Category')}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {categories.map((cat) => (
                        <div
                            key={cat}
                            onClick={() => handleSelect(cat)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-200 hover:text-white transition-colors border-b border-slate-700/50 last:border-none"
                        >
                            <span className="text-slate-400">{ICONS[cat]}</span>
                            <span>{cat}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategorySelect;
