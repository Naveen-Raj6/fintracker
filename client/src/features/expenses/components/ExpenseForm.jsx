import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createExpense } from '../store/expenseSlice';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowDownToLine, ArrowUpFromLine, Sparkles } from 'lucide-react';
import CategorySelect from './CategorySelect';

const ExpenseForm = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
    });

    const { title, amount, category, date, type } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(createExpense({ title, amount: Number(amount), category, date, type }));
        setFormData({ 
            title: '', 
            amount: '', 
            category: type === 'expense' ? 'Food' : 'Salary', 
            date: new Date().toISOString().split('T')[0],
            type 
        });
    };

    return (
        <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl shadow-2xl relative group z-[60]">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full transition-all duration-700 opacity-20 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            
            <div className="relative z-[70]">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className={`w-4 h-4 animate-pulse ${type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`} />
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{t('Inject Transaction')}</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-6">Registry entry protocols</p>
                    </div>

                    <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner w-full md:w-64">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: 'Food' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all duration-300 uppercase ${
                                type === 'expense' 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {t('Expense')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: 'Salary' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all duration-300 uppercase ${
                                type === 'income' 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {t('Income')}
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Identifier')}</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={title} 
                                onChange={onChange}
                                placeholder="E.g. SYSTEM_UPGRADE"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Magnitude')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-black text-xs">₹</span>
                                <input 
                                    type="number" 
                                    name="amount" 
                                    value={amount} 
                                    onChange={onChange}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-4 text-xs text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-black"
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('Sync Date')}</label>
                            <input 
                                type="date" 
                                name="date" 
                                value={date} 
                                onChange={onChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all color-scheme-dark"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1">
                            <button 
                                type="submit" 
                                className={`w-full font-black py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-widest italic shadow-xl relative overflow-hidden active:scale-95 ${
                                    type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                                } text-white h-[58px]`}
                            >
                                <Plus size={18} className="relative z-10" />
                                <span className="relative z-10">{type === 'income' ? t('Add Income') : t('Add Expense')}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
