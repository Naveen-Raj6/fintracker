import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses, createExpense, deleteExpense, reset } from '../features/expenses/expenseSlice';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import SummaryCard from './SummaryCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { CSVLink } from 'react-csv';

const COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { expenses, isLoading, isError, message } = useSelector(
    (state) => state.expenses
  );

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
  });
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);

  const { title, amount, category } = formData;

  // Monthly Budget (Hardcoded for demo, could be in User model)
  const MONTHLY_BUDGET = user?.monthlyBudget || 2000;

  useEffect(() => {
    if (isError) {
      console.log(message);
    }

    if (!user) {
      navigate('/login');
    }

    dispatch(getExpenses());

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createExpense({ title, amount: Number(amount), category }));
    setFormData({ title: '', amount: '', category: 'Food' });
  };

  // Calculations
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const income = 5000; // Mock income
  const balance = income - totalExpenses;

  // Pie Chart Data
  const expensesByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expensesByCategory).map((key) => ({
    name: key,
    value: expensesByCategory[key],
  }));

  // Area Chart Data (Monthly Trend - grouped by Date)
  // Simplified for demo: Just showing individual transactions as trend points
  const areaData = expenses.slice().reverse().map(item => ({
      name: new Date(item.date).toLocaleDateString(),
      amount: item.amount
  }));


  // Budget Alert Logic
  useEffect(() => {
      if (totalExpenses > MONTHLY_BUDGET * 0.8) {
          setShowBudgetAlert(true);
      } else {
          setShowBudgetAlert(false);
      }
  }, [totalExpenses, MONTHLY_BUDGET]);


  // PDF Export
  const exportPDF = () => {
      const doc = new jsPDF();
      doc.text("Expense Report", 20, 10);
      let y = 20;
      expenses.forEach((exp, index) => {
        doc.text(`${exp.date.split('T')[0]} - ${exp.title}: $${exp.amount}`, 20, y);
        y += 10;
      });
      doc.save("expenses.pdf");
  };

  // CSV Data
  const csvData = expenses.map(exp => ({
      Date: exp.date,
      Title: exp.title,
      Amount: exp.amount,
      Category: exp.category
  }));

  if (isLoading) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-10">
      <Navbar />

      {showBudgetAlert && (
          <div className="bg-red-500 text-white px-6 py-4 text-center font-bold animate-pulse">
              {t('Budget Alert')}
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Total Balance" amount={balance} type="balance" />
          <SummaryCard title="Income" amount={income} type="income" />
          <SummaryCard title="Expenses" amount={totalExpenses} type="expense" />
        </div>

        {/* Charts & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pie Chart */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Spending by Category</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Add Expense Form */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">{t('Add Expense')}</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            name="title" 
                            value={title} 
                            onChange={onChange}
                            placeholder="Expense Title"
                            className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number" 
                            name="amount" 
                            value={amount} 
                            onChange={onChange}
                            placeholder="Amount"
                            className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        />
                        <select 
                            name="category" 
                            value={category} 
                            onChange={onChange}
                            className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        >
                            <option value="Food">Food</option>
                            <option value="Housing">Housing</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Personal">Personal</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-accent hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Plus size={20} />
                        {t('Add Expense')}
                    </button>
                </form>
            </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">{t('Transactions')}</h3>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors">
                        PDF
                    </button>
                    <CSVLink data={csvData} filename={"expenses.csv"} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors">
                        CSV
                    </CSVLink>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400">{t('Date')}</th>
                            <th className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400">{t('Description')}</th>
                            <th className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400">{t('Category')}</th>
                            <th className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 text-right">{t('Amount')}</th>
                            <th className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 text-center">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {expenses.length > 0 ? expenses.map((expense) => (
                            <tr key={expense._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {expense.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">
                                    ${expense.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button 
                                        onClick={() => dispatch(deleteExpense(expense._id))}
                                        className="text-slate-400 hover:text-danger transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                                    No transactions found. Start adding some expenses!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
