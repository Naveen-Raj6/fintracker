import { useTranslation } from 'react-i18next';
import { HelpCircle, TrendingUp, Landmark, BarChart3, Activity, Zap, PieChart } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Cell, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#a855f7'];

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c0c0e] border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-lg font-black text-white italic tracking-tighter">
                    {prefix}{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const FinancialCharts = ({ 
    dailyTrendData, 
    dailyCategoryData, 
    chartData, 
    budgetHealthData, 
    totalExpenses, 
    budgetLimit, 
    currentMonthIncome,
    setTimeRange, 
    timeRange, 
    categoryTimeRange, 
    setCategoryTimeRange, 
    selectedDate, 
    setSelectedDate, 
    selectedWeek, 
    setSelectedWeek,
    avgDailySpend,
    currentMonthTotal,
    currentWeekTotal,
    peakSpendingDay
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-12 mb-12">
            {/* Trends Section */}
            <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-orange-500" />
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{t('Expense Trends')}</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-8">Temporal spending analysis</p>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {['1m', '3m', '6m'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-5 py-2 text-[10px] rounded-lg font-black tracking-widest transition-all ${
                                    timeRange === range ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis 
                                dataKey="date" 
                                stroke="#334155" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                                tick={{ fill: '#475569', fontWeight: 900 }}
                            />
                            <YAxis 
                                stroke="#334155" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `₹${val/1000}K`}
                                tick={{ fill: '#475569', fontWeight: 900 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#f59e0b" 
                                strokeWidth={4} 
                                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} 
                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Daily Expense Trend */}
                <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl group">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{t('Daily Output')}</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">30-day velocity</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyTrendData}>
                                <XAxis dataKey="date" hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Category Breakdown */}
                <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
                    <div className="flex flex-col gap-6 mb-8">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <PieChart className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{t('Sector Pulse')}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Categorical distribution</p>
                                </div>
                            </div>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                {['date', 'week', 'month'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setCategoryTimeRange(range)}
                                        className={`px-3 py-1.5 text-[9px] rounded-lg font-black tracking-widest transition-all ${
                                            categoryTimeRange === range ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'
                                        }`}
                                    >
                                        {range.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none color-scheme-dark"
                            />
                            {categoryTimeRange === 'week' && (
                                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    {[1, 2, 3, 4, 5].map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => setSelectedWeek(w)}
                                            className={`w-8 h-8 text-[9px] font-black rounded-lg transition-all ${
                                                selectedWeek === w ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'
                                            }`}
                                        >
                                            W{w}
                                        </button>
                                    ))}
                                </div>
                            )}
                         </div>
                    </div>
                    <div className="h-64">
                    {dailyCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyCategoryData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={100} 
                                    tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                    {dailyCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-50">
                            <HelpCircle size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{t('No data detected')}</span>
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Budget Health & Extended Metrics */}
            <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/50 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-10">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{t('Intelligence & Insights')}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Efficiency analysis</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded-[2rem] border border-slate-800/50 p-6 shadow-inner relative overflow-hidden group">
                        <div className="h-44 w-44 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="80%" outerRadius="100%" barSize={12} data={budgetHealthData} startAngle={180} endAngle={0}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background clockWise dataKey="value" cornerRadius={10} fill="#3b82f6" shadow="0 0 10px rgba(59, 130, 246, 0.5)" />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-4xl font-black text-white italic tracking-tighter">{Math.round((totalExpenses / budgetLimit) * 100)}%</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{t('Limit Used')}</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 className="w-16 h-16 text-blue-500" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">{t('Daily Burn Rate')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white italic tracking-tighter">₹{Math.round(avgDailySpend || 0).toLocaleString()}</span>
                                <span className="text-[10px] font-black text-slate-700 uppercase">/cycle</span>
                            </div>
                        </div>
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">{t('Peak Activity')}</p>
                            <div className="flex items-center gap-2 text-white">
                                <TrendingUp size={16} className="text-orange-500 animate-bounce" />
                                <span className="text-lg font-black italic tracking-tight uppercase">{peakSpendingDay}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">{t('Weekly Accumulation')}</p>
                            <span className="text-2xl font-black text-emerald-400 italic tracking-tighter">₹{currentWeekTotal.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">{t('Monthly Registry')}</p>
                            <span className="text-2xl font-black text-blue-400 italic tracking-tighter">₹{currentMonthTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 p-8 text-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-lg mx-auto">
                                <Landmark size={28} />
                            </div>
                            <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-1">{t('Liquidity Margin')}</p>
                            <p className="text-3xl font-black text-white italic tracking-tighter">₹{Math.max(currentMonthIncome - currentMonthTotal, 0).toLocaleString()}</p>
                            <div className="mt-3 flex items-center justify-center gap-1.5 bg-[#0c0c0e]/50 px-3 py-1 rounded-full border border-emerald-500/10">
                                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Active Sync</p>
                            </div>
                        </div>
                        <Activity className="absolute -bottom-6 -left-6 w-32 h-32 text-emerald-500 opacity-5 group-hover:scale-125 transition-transform duration-1000" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialCharts;
