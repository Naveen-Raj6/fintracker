import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, IndianRupee, Wallet, Calendar } from 'lucide-react';

const SummaryCard = ({ title, amount, type }) => {
  const { t } = useTranslation();

  const getStyle = () => {
    switch (type) {
      case 'balance': return { 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/20', 
        glow: 'shadow-blue-500/20',
        icon: <IndianRupee size={22} />
      };
      case 'income': return { 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20', 
        glow: 'shadow-emerald-500/10',
        icon: <TrendingUp size={22} />
      };
      case 'expense': return { 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20', 
        glow: 'shadow-rose-500/10',
        icon: <TrendingDown size={22} />
      };
      case 'month-income': return { 
        color: 'text-teal-400', 
        bg: 'bg-teal-500/10', 
        border: 'border-teal-500/20', 
        glow: 'shadow-teal-500/10',
        icon: <Calendar size={22} />
      };
      case 'month-expense': return { 
        color: 'text-orange-400', 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500/20', 
        glow: 'shadow-orange-500/10',
        icon: <TrendingDown size={22} />
      };
      default: return { 
        color: 'text-white', 
        bg: 'bg-slate-800', 
        border: 'border-slate-700',
        glow: '',
        icon: <Wallet size={22} />
      };
    }
  };

  const style = getStyle();

  return (
    <div className={`group relative bg-slate-900/40 backdrop-blur-xl border ${style.border} rounded-3xl p-6 transition-all duration-300 hover:bg-slate-900/60 hover:${style.glow} hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.color} shadow-lg`}>
          {style.icon}
        </div>
        <div className="h-1 w-1 bg-slate-800 rounded-full group-hover:bg-blue-500 transition-colors" />
      </div>

      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t(title)}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-black ${style.color} opacity-70`}>₹</span>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">
            {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
      </div>
      
      {/* Decorative pulse on hover */}
      <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity`}>
        {style.icon}
      </div>
    </div>
  );
};

export default SummaryCard;
