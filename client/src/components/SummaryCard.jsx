import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

const SummaryCard = ({ title, amount, icon, type }) => {
  const { t } = useTranslation();

  const getColor = () => {
    switch (type) {
      case 'balance': return 'text-accent';
      case 'income': return 'text-success';
      case 'expense': return 'text-danger';
      default: return 'text-white';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'balance': return 'bg-sky-500/10';
      case 'income': return 'bg-emerald-500/10';
      case 'expense': return 'bg-red-500/10';
      default: return 'bg-slate-700';
    }
  };

  const renderIcon = () => {
      if (type === 'balance') return <IndianRupee className={getColor()} size={24} />;
      if (type === 'income') return <TrendingUp className={getColor()} size={24} />;
      if (type === 'expense') return <TrendingDown className={getColor()} size={24} />;
      return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t(title)}</p>
          <div className="flex items-center mt-1">
             <IndianRupee className={getColor()} size={20} />
             <h3 className={`text-2xl font-bold ${getColor()}`}>
                {amount.toFixed(2)}
            </h3>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${getBgColor()}`}>
            {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
