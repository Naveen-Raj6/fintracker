import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteExpense } from '../store/expenseSlice';
import { useTranslation } from 'react-i18next';
import { Trash2, Download, Edit2, ChevronUp, ChevronDown, HelpCircle, Utensils, Home, Car, Zap, Clapperboard, Stethoscope, User, TrendingUp, Landmark, Wallet, Banknote, Gem, Briefcase, Filter, ArrowUpDown, ChevronRight, ChevronLeft, Search, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';

const CATEGORY_ICONS = {
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

const ExpenseList = ({ expenses, onEdit }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [filterType, setFilterType] = useState('all'); 
    const [filterTxType, setFilterTxType] = useState('all'); 
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterCategory, setFilterCategory] = useState('all'); 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getFilteredTransactions = () => {
        let filtered = [...expenses];

        if (searchTerm) {
            filtered = filtered.filter(exp => exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filterTxType !== 'all') {
            filtered = filtered.filter(exp => (exp.type || 'expense') === filterTxType);
        }

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

        if (filterCategory !== 'all') {
            filtered = filtered.filter(exp => exp.category === filterCategory);
        }

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

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Asset Registry Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        const tableColumn = ["Date", "Identifier", "Sector", "Value (INR)"];
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
        doc.save("finance_report.pdf");
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-20" />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
    };

    const getTooltip = (column) => {
        if (sortConfig.key !== column) return "Click to sort asc";
        return sortConfig.direction === 'asc' ? "Click to sort desc" : "Click to sort asc";
    };

    return (
        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col h-full animate-in fade-in duration-1000">
            {/* Table Header / Toolbar */}
            <div className="p-8 border-b border-slate-800/50 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{t('Transaction Archive')}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Temporal registry logs</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={exportPDF} className="group p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                        <CSVLink data={csvData} filename={"finance_archive.csv"} className="group p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                            <Download size={18} className="group-hover:scale-110 transition-transform" />
                        </CSVLink>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="SEARCH_REGISTRY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder-slate-800"
                        />
                    </div>
                    
                    <select 
                        value={filterTxType} 
                        onChange={(e) => { setFilterTxType(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                    >
                        <option value="all">{t('All Types')}</option>
                        <option value="income">{t('Income')}</option>
                        <option value="expense">{t('Expense')}</option>
                    </select>

                    <select 
                        value={filterType} 
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                    >
                        <option value="all">{t('Temporal Range: All')}</option>
                        <option value="month">{t('Target: Current Cycle')}</option>
                        <option value="date">{t('Target: Specific Sync')}</option>
                    </select>

                    <select 
                        value={filterCategory} 
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                    >
                        <option value="all">{t('All Sectors')}</option>
                        {(filterTxType === 'all' || filterTxType === 'expense') && Object.keys(CATEGORY_ICONS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        {(filterTxType === 'all' || filterTxType === 'income') && Object.keys(INCOME_ICONS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto border-b border-slate-800/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/80 border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-20">
                            <th 
                                className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 cursor-pointer hover:bg-slate-900/50 transition-colors group" 
                                onClick={() => requestSort('date')}
                                title={getTooltip('date')}
                            >
                                <div className="flex items-center gap-2">
                                    {t('Temporal_Sync')}
                                    <SortIcon column="date" />
                                </div>
                            </th>
                            <th 
                                className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 cursor-pointer hover:bg-slate-900/50 transition-colors group" 
                                onClick={() => requestSort('title')}
                                title={getTooltip('title')}
                            >
                                <div className="flex items-center gap-2">
                                    {t('Identifier')}
                                    <ArrowUpDown size={10} className={`opacity-20 group-hover:opacity-100 transition-opacity ${sortConfig.key === 'title' ? 'text-blue-500 opacity-100' : ''}`} />
                                </div>
                            </th>
                            <th 
                                className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 cursor-pointer hover:bg-slate-900/50 transition-colors group" 
                                onClick={() => requestSort('category')}
                                title={getTooltip('category')}
                            >
                                <div className="flex items-center gap-2">
                                    {t('Sector')}
                                    <ArrowUpDown size={10} className={`opacity-20 group-hover:opacity-100 transition-opacity ${sortConfig.key === 'category' ? 'text-blue-500 opacity-100' : ''}`} />
                                </div>
                            </th>
                            <th 
                                className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 cursor-pointer hover:bg-slate-900/50 transition-colors group text-right" 
                                onClick={() => requestSort('amount')}
                                title={getTooltip('amount')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    {t('Magnitude')}
                                    <SortIcon column="amount" />
                                </div>
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">{t('Protocols')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {paginatedTransactions.length > 0 ? paginatedTransactions.map((expense) => (
                            <tr key={expense._id} className="hover:bg-slate-950 transition-all group">
                                <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                                    {new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white italic tracking-tight">{expense.title}</span>
                                        <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1">Ref: {expense._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                        expense.type === 'income' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-slate-800 text-slate-400 border-slate-700'
                                    } w-fit`}>
                                        {CATEGORY_ICONS[expense.category] || INCOME_ICONS[expense.category] || <HelpCircle size={12} />}
                                        {expense.category}
                                    </div>
                                </td>
                                <td className={`px-8 py-6 whitespace-nowrap text-right`}>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-base font-black italic tracking-tighter ${expense.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                            {expense.type === 'income' ? '+' : '-'} ₹{expense.amount.toLocaleString()}
                                        </span>
                                        <div className={`h-[2px] w-8 rounded-full mt-1 ${expense.type === 'income' ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                                    </div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                     <div className="flex justify-center gap-3">
                                        <button onClick={() => onEdit(expense)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => dispatch(deleteExpense(expense._id))} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-400 transition-all"><Trash2 size={16} /></button>
                                     </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Activity size={48} className="text-slate-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('No Archive Data Detected')}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-8 bg-slate-950/50 flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Registry_Page {currentPage} of {totalPages || 1}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2.5 text-slate-500 hover:text-white disabled:opacity-10 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-2 px-3 border-x border-slate-800">
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{t('Size')}</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-transparent text-white text-[10px] font-black border-none focus:ring-0 cursor-pointer p-0 appearance-none min-w-[2rem] text-center"
                            >
                                {[10, 20, 50, 100].map(val => (
                                    <option key={val} value={val} className="bg-slate-950 text-white">{val}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2.5 text-slate-500 hover:text-white disabled:opacity-10 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseList;
