import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses, reset } from '../store/expenseSlice';
import { useTranslation } from 'react-i18next';
import SummaryCard from './SummaryCard';
import EditExpenseModal from './EditExpenseModal';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import FinancialCharts from './FinancialCharts';
import { Wallet, PieChart, History, Plus, Sparkles, LayoutDashboard, BarChart3, ArrowDownToLine, ArrowUpFromLine, Banknote } from 'lucide-react';

const FinanceTracker = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { expenses, isLoading } = useSelector((state) => state.expenses);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'records'
  const [editingExpense, setEditingExpense] = useState(null);
  const [timeRange, setTimeRange] = useState('3m'); 
  const [categoryTimeRange, setCategoryTimeRange] = useState('date');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // --- CALCULATIONS ---
  const totalExpenses = useMemo(() => expenses
      .filter(item => item.type === 'expense' || !item.type)
      .reduce((acc, item) => acc + item.amount, 0), [expenses]);

  const totalIncome = useMemo(() => expenses
      .filter(item => item.type === 'income')
      .reduce((acc, item) => acc + item.amount, 0), [expenses]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthIncome = useMemo(() => expenses
      .filter(item => item.type === 'income' && 
              new Date(item.date).getMonth() === currentMonth && 
              new Date(item.date).getFullYear() === currentYear)
      .reduce((acc, item) => acc + item.amount, 0), [expenses, currentMonth, currentYear]);

  const currentMonthExpenses = useMemo(() => expenses
      .filter(item => (item.type === 'expense' || !item.type) && 
              new Date(item.date).getMonth() === currentMonth && 
              new Date(item.date).getFullYear() === currentYear)
      .reduce((acc, item) => acc + item.amount, 0), [expenses, currentMonth, currentYear]);

  const balance = totalIncome - totalExpenses;
  const budgetLimit = user?.monthlyBudget || 200000;

  // --- CHART DATA PREPARATION ---
  const dailyTrendData = useMemo(() => {
      const today = new Date();
      const last30Days = new Date();
      last30Days.setDate(today.getDate() - 30);
      const dayMap = {};
      for (let i = 0; i <= 30; i++) {
          const d = new Date(last30Days);
          d.setDate(last30Days.getDate() + i);
          dayMap[d.toLocaleDateString()] = 0;
      }
      expenses.filter(e => e.type === 'expense' || !e.type).forEach(expense => {
          const expDate = new Date(expense.date);
          if (expDate >= last30Days) {
              const dateStr = expDate.toLocaleDateString();
              if (dayMap[dateStr] !== undefined) dayMap[dateStr] += expense.amount;
          }
      });
      return Object.keys(dayMap).map(date => ({ date, amount: dayMap[date] }));
  }, [expenses]);

  const categoryBreakdownData = useMemo(() => {
      const targetDate = new Date(selectedDate);
      let filtered = expenses.filter(e => e.type === 'expense' || !e.type);

      if (categoryTimeRange === 'date') {
          const dateStr = targetDate.toLocaleDateString();
          filtered = filtered.filter(e => new Date(e.date).toLocaleDateString() === dateStr);
      } else if (categoryTimeRange === 'week') {
          const year = targetDate.getFullYear();
          const month = targetDate.getMonth();
          let startDay = (selectedWeek - 1) * 7 + 1;
          let endDay = selectedWeek * 7;
          if (selectedWeek === 5) endDay = new Date(year, month + 1, 0).getDate();
          const startDate = new Date(year, month, startDay);
          const endDate = new Date(year, month, endDay, 23, 59, 59);
          filtered = filtered.filter(e => { const d = new Date(e.date); return d >= startDate && d <= endDate; });
      } else if (categoryTimeRange === 'month') {
          filtered = filtered.filter(e => { const d = new Date(e.date); return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear(); });
      }

      const catMap = filtered.reduce((acc, curr) => { acc[curr.category] = (acc[curr.category] || 0) + curr.amount; return acc; }, {});
      return Object.keys(catMap).map(key => ({ name: key, value: catMap[key] }));
  }, [expenses, selectedDate, categoryTimeRange, selectedWeek]);

  const trendData = useMemo(() => {
     const now = new Date();
     let startDate = new Date();
     if (timeRange === '1m') startDate.setMonth(now.getMonth() - 1);
     else if (timeRange === '3m') startDate.setMonth(now.getMonth() - 3);
     else if (timeRange === '6m') startDate.setMonth(now.getMonth() - 6);

     const filtered = expenses.filter(e => (e.type === 'expense' || !e.type) && new Date(e.date) >= startDate);
     const grouped = filtered.reduce((acc, curr) => {
         const dateKey = new Date(curr.date).toISOString().split('T')[0];
         acc[dateKey] = (acc[dateKey] || 0) + curr.amount;
         return acc;
     }, {});

     return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(([dateKey, amount]) => ({
         date: new Date(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
         amount
     }));
  }, [expenses, timeRange]);

  const budgetMetrics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Current Month Total
    const monthExpenses = expenses
      .filter(e => (e.type === 'expense' || !e.type) && new Date(e.date) >= startOfMonth);
    const currentMonthTotal = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Avg Daily Spend
    const daysInMonthPassed = now.getDate();
    const avgDailySpend = currentMonthTotal / daysInMonthPassed;

    // Current Week Total
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const currentWeekTotal = expenses
      .filter(e => (e.type === 'expense' || !e.type) && new Date(e.date) >= startOfWeek)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Peak Spending Day
    const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    expenses.filter(e => e.type === 'expense' || !e.type).forEach(e => {
      const day = new Date(e.date).getDay();
      weekdayTotals[day] += e.amount;
    });
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayIndex = weekdayTotals.indexOf(Math.max(...weekdayTotals));
    const peakSpendingDay = weekdayTotals[peakDayIndex] > 0 ? weekdays[peakDayIndex] : 'N/A';

    return { avgDailySpend, currentMonthTotal, currentWeekTotal, peakSpendingDay };
  }, [expenses]);

  const { avgDailySpend, currentMonthTotal, currentWeekTotal, peakSpendingDay } = budgetMetrics;
  const budgetHealthValue = currentMonthIncome > 0 ? Math.min((currentMonthExpenses / currentMonthIncome) * 100, 100) : 0;
  const budgetHealthData = [{ name: 'Used', value: budgetHealthValue }];

  useEffect(() => {
    if (!user) navigate('/login');
    else dispatch(getExpenses());
    return () => { dispatch(reset()); };
  }, [user, navigate, dispatch]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-4 md:p-8 text-slate-200">
      {/* Cinematic Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-black tracking-[0.3em] text-[10px] uppercase">Finance Matrix Alpha</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic uppercase tracking-tighter">
              Asset Registry
            </h1>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              OVERVIEW
            </button>
            <button 
              onClick={() => setActiveTab('records')}
              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'records' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <History className="w-4 h-4" />
              RECORDS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* 5-Card Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard title="Total Balance" amount={balance} type="balance" />
          <SummaryCard title="Total Income" amount={totalIncome} type="income" />
          <SummaryCard title="Total Expenses" amount={totalExpenses} type="expense" />
          <SummaryCard title="Current Month Income" amount={currentMonthIncome} type="month-income" />
          <SummaryCard title="Current Month Expenses" amount={currentMonthExpenses} type="month-expense" />
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <FinancialCharts 
              dailyTrendData={dailyTrendData}
              dailyCategoryData={categoryBreakdownData}
              chartData={trendData}
              budgetHealthData={budgetHealthData}
              totalExpenses={totalExpenses}
              budgetLimit={budgetLimit}
              currentMonthIncome={currentMonthIncome}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              categoryTimeRange={categoryTimeRange}
              setCategoryTimeRange={setCategoryTimeRange}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              avgDailySpend={avgDailySpend}
              currentMonthTotal={currentMonthTotal}
              currentWeekTotal={currentWeekTotal}
              peakSpendingDay={peakSpendingDay}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full">
              <ExpenseForm />
            </div>
            <div className="w-full">
              <ExpenseList expenses={expenses} onEdit={setEditingExpense} />
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

export default FinanceTracker;
