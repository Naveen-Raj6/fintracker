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
import { Plus, Trash2, Download, Edit2, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import { 
    Utensils, Home, Car, Zap, Clapperboard, 
    Stethoscope, User, HelpCircle, 
    TrendingUp, Landmark, // New icons
    Wallet, Banknote, Gem, Briefcase // Income icons
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

  // --- STATE DECLARATIONS ---
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [timeRange, setTimeRange] = useState('3m'); 
  
  // Filter & Pagination States
  const [filterType, setFilterType] = useState('all'); 
  const [filterTxType, setFilterTxType] = useState('all'); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('all'); 
  const [categoryTimeRange, setCategoryTimeRange] = useState('date'); // 'date', 'week', 'month'
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const { title, amount, category, date, type } = formData;

  // --- CONSTANTS ---
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#FF4D4D', '#4D4DFF', '#FFA319'];

  const CATEGORY_ICONS = {
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

  // --- CALCULATIONS ---
  const totalExpenses = expenses
      .filter(item => item.type === 'expense' || !item.type)
      .reduce((acc, item) => acc + item.amount, 0);

  const totalIncome = expenses
      .filter(item => item.type === 'income')
      .reduce((acc, item) => acc + item.amount, 0);

  const balance = totalIncome - totalExpenses;
  const budgetLimit = totalIncome > 0 ? totalIncome : (user?.monthlyBudget || 200000);

  const requestSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // --- LOGIC: FILTERED TRANSACTIONS ---
  const getFilteredTransactions = () => {
      let filtered = [...expenses];

      // 1. Filter by Transaction Type
      if (filterTxType !== 'all') {
          filtered = filtered.filter(exp => (exp.type || 'expense') === filterTxType);
      }

      // 2. Time Filters
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

      // 3. Category Filter
      if (filterCategory !== 'all') {
          filtered = filtered.filter(exp => exp.category === filterCategory);
      }

      // 4. Sort by sortConfig
      filtered.sort((a, b) => {
          if (sortConfig.key === 'date') {
              return sortConfig.direction === 'asc' 
                  ? new Date(a.date) - new Date(b.date)
                  : new Date(b.date) - new Date(a.date);
          }
          if (sortConfig.key === 'amount') {
              return sortConfig.direction === 'asc' 
                  ? a.amount - b.amount
                  : b.amount - a.amount;
          }
          if (a[sortConfig.key] < b[sortConfig.key]) {
              return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
              return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
      });

      return filtered;
  };

  // --- CHART DATA PREPARATION ---
  const expenseTransactions = expenses.filter(e => e.type === 'expense' || !e.type);

  // Daily Expense Trend
  const getDailyTrendData = () => {
      const today = new Date();
      const last30Days = new Date(today.setDate(today.getDate() - 30));
      const dayMap = {};
      for (let i = 0; i <= 30; i++) {
          const d = new Date(last30Days);
          d.setDate(last30Days.getDate() + i);
          dayMap[d.toLocaleDateString()] = 0;
      }
      expenseTransactions.forEach(expense => {
          const expDate = new Date(expense.date);
          if (expDate >= last30Days) {
              const dateStr = expDate.toLocaleDateString();
              if (dayMap[dateStr] !== undefined) { 
                  dayMap[dateStr] += expense.amount; 
              }
          }
      });
      return Object.keys(dayMap).map(date => ({ date, amount: dayMap[date] }));
  };
  const dailyTrendData = getDailyTrendData();

  // Category Breakdown Data
  const getCategoryBreakdownData = () => {
      const targetDate = new Date(selectedDate);
      let filtered = expenseTransactions;

      if (categoryTimeRange === 'date') {
          const dateStr = targetDate.toLocaleDateString();
          filtered = expenseTransactions.filter(e => new Date(e.date).toLocaleDateString() === dateStr);
      } else if (categoryTimeRange === 'week') {
          const year = targetDate.getFullYear();
          const month = targetDate.getMonth();
          
          let startDay, endDay;
          if (selectedWeek === 1) { startDay = 1; endDay = 7; }
          else if (selectedWeek === 2) { startDay = 8; endDay = 14; }
          else if (selectedWeek === 3) { startDay = 15; endDay = 21; }
          else if (selectedWeek === 4) { startDay = 22; endDay = 28; }
          else { 
            startDay = 29; 
            endDay = new Date(year, month + 1, 0).getDate(); 
          }

          const startDate = new Date(year, month, startDay);
          const endDate = new Date(year, month, endDay, 23, 59, 59);

          filtered = expenseTransactions.filter(e => {
              const d = new Date(e.date);
              return d >= startDate && d <= endDate;
          });
      } else if (categoryTimeRange === 'month') {
          const month = targetDate.getMonth();
          const year = targetDate.getFullYear();
          filtered = expenseTransactions.filter(e => {
              const d = new Date(e.date);
              return d.getMonth() === month && d.getFullYear() === year;
          });
      }

      const catMap = filtered.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
          return acc;
      }, {});
      return Object.keys(catMap).map(key => ({ name: key, value: catMap[key] }));
  };
  const dailyCategoryData = getCategoryBreakdownData();

  // Expense Trends (Line Chart)
  const getFilteredData = () => {
     const now = new Date();
     let startDate = new Date();
     if (timeRange === '1m') startDate.setMonth(now.getMonth() - 1);
     else if (timeRange === '3m') startDate.setMonth(now.getMonth() - 3);
     else if (timeRange === '6m') startDate.setMonth(now.getMonth() - 6);

     const filteredExpenses = expenseTransactions.filter(exp => new Date(exp.date) >= startDate);
     
     // Group by YYYY-MM-DD for reliable sorting
     const grouped = filteredExpenses.reduce((acc, curr) => {
         const dateKey = new Date(curr.date).toISOString().split('T')[0];
         if (!acc[dateKey]) acc[dateKey] = 0;
         acc[dateKey] += curr.amount;
         return acc;
     }, {});

     // Sort entries by date key
     return Object.entries(grouped)
         .sort((a, b) => a[0].localeCompare(b[0]))
         .map(([dateKey, amount]) => {
            const d = new Date(dateKey);
            return {
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                amount,
                low: amount * 0.9,
                high: amount * 1.1
            };
         });
  };
  const chartData = getFilteredData();

  // Budget Health Data
  const budgetHealthData = [{
    name: 'Budget Used',
    value: Math.min((totalExpenses / budgetLimit) * 100, 100),
    fill: totalExpenses > budgetLimit ? '#ef4444' : '#10b981'
  }];

  // --- INSIGHTS CALCULATIONS ---
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = currentDate.getDate();

  // 1. This Month Spend
  const thisMonthExpenses = expenseTransactions.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthSpend = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Last 7 Days Spend
  const last7DaysDate = new Date();
  last7DaysDate.setDate(currentDate.getDate() - 7);
  const last7DaysSpend = expenseTransactions
      .filter(e => new Date(e.date) >= last7DaysDate)
      .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Daily Average (based on days passed in current month)
  const dailyAverage = daysPassed > 0 ? thisMonthSpend / daysPassed : 0;

  // 4. Projected Monthly Spend
  const projectedSpend = dailyAverage * daysInMonth;

  // --- EFFECTS & HANDLERS ---
  useEffect(() => {
    if (isError) console.log(message);
    
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getExpenses());
    }
    
    return () => { dispatch(reset()); };
  }, [user, navigate, isError, message, dispatch]);

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

  const exportPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Expense Tracker Report", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      const tableColumn = ["Date", "Description", "Category", "Amount (INR)"];
      const tableRows = [];
      filteredTransactions.forEach(expense => {
          tableRows.push([
              new Date(expense.date).toLocaleDateString(),
              expense.title,
              expense.category,
              expense.amount.toFixed(2)
          ]);
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
      doc.save("expenses_report.pdf");
  };

  // --- PAGINATION / EXPORT PREP ---
  const filteredTransactions = getFilteredTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );
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
          <SummaryCard title="Income" amount={totalIncome} type="income" />
          <SummaryCard title="Make Expense" amount={totalExpenses} type="expense" />
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                     <h3 className="text-lg font-bold text-white">{t('Category Breakdown')}</h3>
                     <div className="flex bg-slate-700 rounded-lg p-1">
                        {['date', 'week', 'month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setCategoryTimeRange(range)}
                                className={`px-2 py-1 text-[10px] rounded-md font-medium transition-all ${
                                    categoryTimeRange === range ? 'bg-accent text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                     <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-700 text-white text-[10px] rounded px-2 py-1 border-none focus:ring-1 focus:ring-accent"
                     />
                </div>
                {categoryTimeRange === 'week' && (
                    <div className="flex justify-center gap-1 mb-4 bg-slate-700/50 p-1 rounded-lg border border-slate-700">
                        {[1, 2, 3, 4, 5].map((w) => (
                            <button
                                key={w}
                                onClick={() => setSelectedWeek(w)}
                                className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                                    selectedWeek === w 
                                    ? 'bg-accent text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                W{w}
                            </button>
                        ))}
                    </div>
                )}
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

             {/* Budget Health (Insights Enhanced) */}
             <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 lg:col-span-1 flex flex-col items-center">
                <h3 className="text-lg font-bold text-white mb-2 self-start w-full">{t('Budget Health & Insights')}</h3>
                
                <div className="h-40 w-full relative mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="80%" 
                            outerRadius="100%" 
                            barSize={15} 
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
                    <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-[-10px]">
                        <p className="text-2xl font-bold text-white">{Math.round((totalExpenses / budgetLimit) * 100)}%</p>
                        <p className="text-[10px] text-slate-400">of Income Used</p>
                    </div>
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-slate-700/30 p-2 rounded-lg text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Daily Avg</p>
                        <p className="text-sm font-bold text-emerald-400">₹{dailyAverage.toFixed(0)}</p>
                    </div>
                     <div className="bg-slate-700/30 p-2 rounded-lg text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Last 7 Days</p>
                        <p className="text-sm font-bold text-blue-400">₹{last7DaysSpend.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/30 p-2 rounded-lg text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">This Month</p>
                        <p className="text-sm font-bold text-purple-400">₹{thisMonthSpend.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-700/30 p-2 rounded-lg text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Projected</p>
                        <p className="text-sm font-bold text-orange-400">₹{projectedSpend.toFixed(0)}</p>
                    </div>
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

        {/* Add Transaction Form */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{t('Add Transaction')}</h3>
                
                {/* Type Toggle */}
                <div className="flex bg-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: 'Food' }))}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            type === 'expense' 
                            ? 'bg-red-500 text-white shadow-sm' 
                            : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        Expense
                    </button>
                    <button
                        onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: 'Salary' }))}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            type === 'income' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        Income
                    </button>
                </div>
            </div>

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
                        type={type} // Pass type to select correct icons
                    />
                </div>
                <div className="md:col-span-1">
                    <input 
                        type="date" 
                        name="date" 
                        value={date} 
                        onChange={onChange}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]}
                        className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-accent"
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <button 
                        type="submit" 
                        className={`w-full h-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                            type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        <Plus size={20} />
                        {type === 'income' ? 'Add Income' : 'Add Expense'}
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
                    {/* TYPE Filter */}
                    <select 
                        value={filterTxType} 
                        onChange={(e) => { setFilterTxType(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1 border-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

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

                    {/* Category Filter */}
                    <select 
                        value={filterCategory} 
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1 border-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="all">All Categories</option>
                        {(filterTxType === 'all' || filterTxType === 'expense') && Object.keys(CATEGORY_ICONS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        {(filterTxType === 'all' || filterTxType === 'income') && Object.keys(INCOME_ICONS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

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
                            <th 
                                className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('Date')}
                                    {sortConfig.key === 'date' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    ) : <ArrowUpDown size={14} className="opacity-30" />}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('title')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('Description')}
                                    {sortConfig.key === 'title' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    ) : <ArrowUpDown size={14} className="opacity-30" />}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('category')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('Category')}
                                    {sortConfig.key === 'category' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    ) : <ArrowUpDown size={14} className="opacity-30" />}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-xs font-uppercase tracking-wider text-slate-400 text-right cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('amount')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    {t('Amount')}
                                    {sortConfig.key === 'amount' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                    ) : <ArrowUpDown size={14} className="opacity-30" />}
                                </div>
                            </th>
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
                                        {CATEGORY_ICONS[expense.category] || INCOME_ICONS[expense.category] || <HelpCircle size={14} />}
                                        {expense.category}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${expense.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                    {expense.type === 'income' ? '+' : '-'} ₹{expense.amount}
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
        {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 text-white bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Rows per page:</span>
                    <select 
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="bg-slate-700 text-white text-sm rounded-lg px-2 py-1 border-none focus:ring-1 focus:ring-accent"
                    >
                        {[10, 20, 30, 50, 100].map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-1.5 bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold bg-slate-700 px-3 py-1 rounded text-accent">
                        {currentPage} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-1.5 bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                        Next
                    </button>
                </div>
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
