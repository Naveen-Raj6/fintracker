import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses, createExpense, deleteExpense, reset } from '../features/expenses/expenseSlice';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import SummaryCard from './SummaryCard';
import EditExpenseModal from './EditExpenseModal';
import CategorySelect from './CategorySelect';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    RadialBarChart, RadialBar, PolarAngleAxis 
} from 'recharts';
import { Plus, Trash2, Download, Edit2, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import { 
    Utensils, Home, Car, Zap, Clapperboard, 
    Stethoscope, User, HelpCircle, 
    TrendingUp, Landmark // New icons
} from 'lucide-react'; // Import icons

// ... (keep includes)

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
    date: new Date().toISOString().split('T')[0]
  });
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [timeRange, setTimeRange] = useState('3m'); // 1m, 3m, 6m
  
  // Transaction Filter & Pagination States
  const [filterType, setFilterType] = useState('all'); // 'all', 'month', 'date'
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { title, amount, category, date } = formData;

  const MONTHLY_BUDGET = user?.monthlyBudget || 200000; // Updated budget mock for INR

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#FF4D4D', '#4D4DFF', '#FFA319'];

    const CATEGORY_ICONS = {
        'Food': <Utensils size={18} />,
        'Housing': <Home size={18} />,
        'Transportation': <Car size={18} />,
        'Utilities': <Zap size={18} />,
        'Entertainment': <Clapperboard size={18} />,
        'Healthcare': <Stethoscope size={18} />,
        'Personal': <User size={18} />,
        'Investment': <TrendingUp size={18} />, // New
        'Loan/EMI': <Landmark size={18} />, // New
        'Other': <HelpCircle size={18} />,
  };

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
    dispatch(createExpense({ title, amount: Number(amount), category, date }));
    setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
  };

  // Calculations
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const income = 150000; // Mock income in INR
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

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Daily Expense Trend (Line Graph) - Last 30 Days
  const getDailyTrendData = () => {
    const today = new Date();
    const last30Days = new Date(today.setDate(today.getDate() - 30));
    
    // Create map of last 30 days initialized to 0
    const dayMap = {};
    for (let i = 0; i <= 30; i++) {
        const d = new Date(last30Days);
        d.setDate(last30Days.getDate() + i);
        dayMap[d.toLocaleDateString()] = 0;
    }

    expenses.forEach(expense => {
        const expDate = new Date(expense.date);
        if (expDate >= last30Days) {
            const dateStr = expDate.toLocaleDateString();
            if (dayMap[dateStr] !== undefined) {
                dayMap[dateStr] += expense.amount;
            }
        }
    });

    return Object.keys(dayMap).map(date => ({
        date,
        amount: dayMap[date]
    }));
  };

  const dailyTrendData = getDailyTrendData();

  // Daily Category Breakdown (for selectedDate)
  const getDailyCategoryData = () => {
    const targetDate = new Date(selectedDate).toLocaleDateString();
    const filtered = expenses.filter(e => new Date(e.date).toLocaleDateString() === targetDate);
    
    const catMap = filtered.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    return Object.keys(catMap).map(key => ({
        name: key,
        value: catMap[key]
    }));
  };

  const dailyCategoryData = getDailyCategoryData();

  const getFilteredData = () => {
      // ... (existing monthly logic refactored to just Line chart)
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '1m') {
          startDate.setMonth(now.getMonth() - 1);
      } else if (timeRange === '3m') {
          startDate.setMonth(now.getMonth() - 3);
      } else if (timeRange === '6m') {
          startDate.setMonth(now.getMonth() - 6);
      }

      const filteredExpenses = expenses.filter(exp => new Date(exp.date) >= startDate);
      
      const grouped = filteredExpenses.reduce((acc, curr) => {
          const date = new Date(curr.date).toLocaleDateString();
          if (!acc[date]) acc[date] = 0;
          acc[date] += curr.amount;
          return acc;
      }, {});

      return Object.keys(grouped).map(date => ({
          date,
          amount: grouped[date],
          // Add dummy high/low for Line chart "area" effect if desired, or just use simple line
          low: grouped[date] * 0.9,
          high: grouped[date] * 1.1
      }));
  };
  
  const chartData = getFilteredData();


  // Budget Alert Logic
  useEffect(() => {
      if (totalExpenses > MONTHLY_BUDGET * 0.8) {
          setShowBudgetAlert(true);
      } else {
          setShowBudgetAlert(false);
      }
  }, [totalExpenses, MONTHLY_BUDGET]);

  // PDF Export with AutoTable
  const exportPDF = () => {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Expense Tracker Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      const tableColumn = ["Date", "Description", "Category", "Amount (INR)"];
      const tableRows = [];

      expenses.forEach(expense => {
          const expenseData = [
              new Date(expense.date).toLocaleDateString(),
              expense.title,
              expense.category,
              expense.amount.toFixed(2)
          ];
          tableRows.push(expenseData);
      });

      autoTable(doc, { 
          head: [tableColumn],
          body: tableRows,
          startY: 40 
      });
      doc.save("expenses_report.pdf");
  };

  // Budget Health Data (Radial Bar)
  const budgetHealthData = [{
    name: 'Budget Used',
    value: Math.min((totalExpenses / MONTHLY_BUDGET) * 100, 100),
    fill: totalExpenses > MONTHLY_BUDGET ? '#ef4444' : '#10b981'
  }];

  // Filtered & Paginated Transactions
  const getFilteredTransactions = () => {
      let filtered = [...expenses];

      // 1. Sort by Date (Newest First) - Default
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      // 2. Apply Filters
      if (filterType === 'month') {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          filtered = filtered.filter(exp => {
              const d = new Date(exp.date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });
      } else if (filterType === 'date') {
          filtered = filtered.filter(exp => new Date(exp.date).toISOString().split('T')[0] === filterDate);
      }

      return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // CSV Data (use filtered data for export)
  const csvData = filteredTransactions.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString(),
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

        {/* Charts Section */}
            {/* Daily Expense Trend */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 lg:col-span-1">
                <h3 className="text-lg font-bold text-white mb-4">{t('Daily Expenses')} (30 Days)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Category Breakdown with Date Picker */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 lg:col-span-1">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white">{t('Category Breakdown')}</h3>
                     <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-700 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-accent"
                     />
                </div>
                <div className="h-64">
                {dailyCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCategoryData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fill: '#94a3b8', fontSize: 12}} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {dailyCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        {t('No expenses for this date')}
                    </div>
                )}
                </div>
            </div>

             {/* Budget Health (vs Global Category) */}
             <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 lg:col-span-1 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-white mb-2 self-start w-full">{t('Budget Health')}</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="80%" 
                            outerRadius="100%" 
                            barSize={20} 
                            data={budgetHealthData} 
                            startAngle={180} 
                            endAngle={0}
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar
                                background
                                clockWise
                                dataKey="value"
                                cornerRadius={10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '8px' }}
                                cursor={false}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
                        <p className="text-3xl font-bold text-white">{Math.round((totalExpenses / MONTHLY_BUDGET) * 100)}%</p>
                        <p className="text-xs text-slate-400">of Monthly Budget</p>
                    </div>
                </div>
                <div className="text-center mt-[-20px]">
                    <p className="text-sm text-slate-400">Spent: ₹{totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Limit: ₹{MONTHLY_BUDGET.toLocaleString()}</p>
                </div>
            </div>

            {/* Monthly Trend (Line Only) */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 lg:col-span-3">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white mb-4">{t('Expense Trends')}</h3>
                     <div className="flex bg-slate-700 rounded-md p-1">
                        {['1m', '3m', '6m'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                                    timeRange === range ? 'bg-accent text-white' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={3} dot={false} name="Expense" />
                            <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="High" />
                            <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Low" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        {/* Add Expense Form */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">{t('Add Expense')}</h3>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1">
                    <input 
                        type="text" 
                        name="title" 
                        value={title} 
                        onChange={onChange}
                        placeholder={t('Description')}
                        className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <input 
                        type="number" 
                        name="amount" 
                        value={amount} 
                        onChange={onChange}
                        placeholder={t('Amount')}
                        className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <CategorySelect 
                        value={category} 
                        onChange={onChange} 
                        name="category"
                    />
                </div>
                <div className="md:col-span-1">
                    <input 
                        type="date" 
                        name="date" 
                        value={date} 
                        onChange={onChange}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]}
                        className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <button type="submit" className="w-full h-full bg-accent hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Plus size={20} />
                        {t('Add Expense')}
                    </button>
                </div>
            </form>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-white">{t('Transactions')}</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <select 
                        value={filterType} 
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1 border-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="date">Specific Date</option>
                    </select>

                    {filterType === 'date' && (
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                            className="bg-slate-700 text-white text-sm rounded-lg px-2 py-1 border-none focus:ring-1 focus:ring-accent"
                        />
                    )}

                    <div className="flex gap-2 ml-2">
                        <button onClick={exportPDF} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors">
                            <Download size={16} /> PDF
                        </button>
                        <CSVLink data={csvData} filename={"expenses.csv"} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors">
                            <Download size={16} /> CSV
                        </CSVLink>
                    </div>
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
                        {paginatedTransactions.length > 0 ? paginatedTransactions.map((expense) => (
                            <tr key={expense._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {expense.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600 w-fit">
                                        {CATEGORY_ICONS[expense.category] || <HelpCircle size={14} />}
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">
                                    ₹{expense.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                                     <button 
                                        onClick={() => setEditingExpense(expense)}
                                        className="text-slate-400 hover:text-accent transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 text-white">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-800 rounded-md disabled:opacity-50 hover:bg-slate-700 transition-colors"
                >
                    Previous
                </button>
                <span className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-800 rounded-md disabled:opacity-50 hover:bg-slate-700 transition-colors"
                >
                    Next
                </button>
            </div>
        )}
      </div>

      {editingExpense && (
        <EditExpenseModal 
            expense={editingExpense} 
            onClose={() => setEditingExpense(null)} 
        />
      )}

    </div>
  );
};

export default Dashboard;
