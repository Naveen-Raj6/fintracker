import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateExpense } from '../features/expenses/expenseSlice'; // Need to implement this in slice
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import CategorySelect from './CategorySelect';

const EditExpenseModal = ({ expense, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
  });

  const { title, amount, category, description } = formData;

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
      description
    };
    // Dispatch update action
    dispatch(updateExpense(expenseData));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* ... keeping wrapper structure ... */}
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{t('Edit Expense')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('Description')}</label>
            <input 
              type="text" 
              name="title" // Assuming description in UI maps to title field in DB as per user request (User asked for "edit... descriptions and category") - In our code title is the main desc. 
              // Wait, the user said "edit description". In my model I have `title` AND `description`.
              // In the form line 58 of original file, it was mapping to `title`.
              // I will keep `title` as the main short description/name.
              value={title} 
              onChange={onChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t('Amount')}</label>
                <input 
                type="number" 
                name="amount" 
                value={amount} 
                onChange={onChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t('Category')}</label>
                <CategorySelect 
                    value={category} 
                    onChange={onChange} 
                    name="category"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('Description')}</label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              rows="3"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
                {t('Cancel')}
            </button>
            <button 
                type="submit" 
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-sky-500 transition-colors font-medium shadow-lg shadow-sky-500/20"
            >
                {t('Update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
