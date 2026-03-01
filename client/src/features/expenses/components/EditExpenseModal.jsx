import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateExpense } from '../store/expenseSlice';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Save, ShieldAlert } from 'lucide-react';
import CategorySelect from './CategorySelect';

const EditExpenseModal = ({ expense, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
    type: expense.type || 'expense'
  });

  const { title, amount, category, description, type } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const expenseData = {
      id: expense._id,
      title,
      amount: Number(amount),
      category,
      description,
      type
    };
    dispatch(updateExpense(expenseData));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-center z-[150] p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800/50 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative group">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="p-10 relative z-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{t('Modify Core Record')}</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-6">Registry ID: {expense._id.slice(-12).toUpperCase()}</p>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all shadow-lg active:scale-90">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Identifier')}</label>
                    <input 
                        type="text" 
                        name="title"
                        value={title} 
                        onChange={onChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Magnitude')}</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 font-black">₹</span>
                            <input 
                                type="number" 
                                name="amount" 
                                value={amount} 
                                onChange={onChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-black text-lg"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Sector')}</label>
                        <CategorySelect 
                            value={category} 
                            onChange={onChange} 
                            name="category"
                            type={type}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Registry Notes')}</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={onChange}
                        rows="3"
                        placeholder="ADD_SUPPLEMENTARY_DATA..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium resize-none"
                    ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-slate-950 border border-slate-800 text-slate-500 rounded-2xl hover:text-white transition-all font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95"
                    >
                        {t('ABORT')}
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 italic active:scale-95 group"
                    >
                        <Save size={16} className="group-hover:-rotate-12 transition-transform" />
                        {t('COMMIT_UPDATE')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
