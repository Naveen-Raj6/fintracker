import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Utensils, Home, Car, Zap, Clapperboard, 
    Stethoscope, User, TrendingUp, Landmark, HelpCircle, ChevronDown,
    Wallet, Banknote, Gem, Briefcase
} from 'lucide-react';

const EXPENSE_ICONS = {
    'Food': <Utensils size={14} />,
    'Housing': <Home size={14} />,
    'Transportation': <Car size={14} />,
    'Utilities': <Zap size={14} />,
    'Entertainment': <Clapperboard size={14} />,
    'Healthcare': <Stethoscope size={14} />,
    'Personal': <User size={14} />,
    'Investment': <TrendingUp size={14} />,
    'Loan/EMI': <Landmark size={14} />,
    'Other': <HelpCircle size={14} />,
};

const INCOME_ICONS = {
    'Salary': <Wallet size={14} />,
    'SIP': <TrendingUp size={14} />,
    'Mutual Fund': <Banknote size={14} />,
    'Gold/Silver': <Gem size={14} />,
    'Business': <Briefcase size={14} />,
    'Other': <HelpCircle size={14} />,
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-black text-[9px] uppercase tracking-widest italic"
            >
                <div className="flex items-center gap-3">
                    <span className="text-blue-500">
                        {ICONS[value] || <HelpCircle size={14} />}
                    </span>
                    <span className="tracking-[0.1em]">{value || t('Select Sector')}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-700 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[200] w-full mt-2 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        {categories.map((cat) => (
                            <div
                                key={cat}
                                onClick={() => handleSelect(cat)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all border border-transparent ${
                                    value === cat 
                                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                                    : 'text-slate-500 hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <span className={`${value === cat ? 'text-blue-400' : 'text-slate-700'} group-hover:text-blue-500 transition-colors`}>
                                    {ICONS[cat]}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySelect;
