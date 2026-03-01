import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHabits, addHabit, toggleHabit, deleteHabit, reset } from '../store/habitSlice';
import { CheckCircle2, Plus, Flame, Target, Calendar, BarChart3, Clock, Sparkles, Filter, ChevronDown, Activity, Trophy, Swords } from 'lucide-react';
import HabitItem from './HabitItem';
import ProgressRing from '../../../components/common/ProgressRing';
import XPNotification from '../../../components/common/XPNotification';
import ActivityHeatmap from '../../../components/common/ActivityHeatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HabitTracker = () => {
    const dispatch = useDispatch();
    const { habits, isLoading } = useSelector((state) => state.habits);
    const { user } = useSelector((state) => state.auth);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState('active_today'); // 'all', 'active_today', 'completed_today'
    const [xpQueue, setXpQueue] = useState([]);
    const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'analytics'
    
    const [newHabit, setNewHabit] = useState({
        name: '',
        frequency: 'daily',
        trackingType: 'boolean',
        targetValue: 1,
        targetDuration: 0,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
    });

    useEffect(() => {
        dispatch(getHabits());
        return () => dispatch(reset());
    }, [dispatch]);

    const onAddHabit = (e) => {
        e.preventDefault();
        dispatch(addHabit(newHabit));
        setShowAddModal(false);
        setNewHabit({ name: '', frequency: 'daily', trackingType: 'boolean', targetValue: 1, targetDuration: 0, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
    };

    const handleUpdate = (id, logData) => {
        dispatch(toggleHabit({ id, ...logData }));
        setXpQueue(prev => [...prev, { id: Date.now(), amount: logData.completed ? 20 : 5 }]);
    };

    const todayDay = new Date().getDay();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayHabits = useMemo(() => {
        return habits.filter(habit => !habit.daysOfWeek || habit.daysOfWeek.length === 0 || habit.daysOfWeek.includes(todayDay));
    }, [habits, todayDay]);

    const { pendingToday, completedTodayList } = useMemo(() => {
        const pending = [];
        const completed = [];
        
        todayHabits.forEach(habit => {
            const isDone = habit.logs?.some(log => {
                const logDate = new Date(log.date).toISOString().split('T')[0];
                return logDate === todayStr && log.completed;
            });

            if (isDone) completed.push(habit);
            else pending.push(habit);
        });

        return { pendingToday: pending, completedTodayList: completed };
    }, [todayHabits, todayStr]);

    const displayList = useMemo(() => {
        if (filter === 'active_today') return pendingToday;
        if (filter === 'completed_today') return completedTodayList;
        return habits;
    }, [filter, pendingToday, completedTodayList, habits]);

    // Analytics Data
    const heatmapData = useMemo(() => {
        const counts = {};
        habits.forEach(habit => {
            habit.logs?.forEach(log => {
                const date = new Date(log.date).toISOString().split('T')[0];
                counts[date] = (counts[date] || 0) + (log.completed ? 1 : 0);
            });
        });
        return Object.entries(counts).map(([date, value]) => ({ date, value }));
    }, [habits]);

    const weeklyData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            let count = 0;
            habits.forEach(h => {
                if (h.logs?.some(l => new Date(l.date).toISOString().split('T')[0] === date && l.completed)) {
                    count++;
                }
            });
            return { name: dayName, count };
        });
    }, [habits]);

    const totalCompletions = habits.reduce((acc, h) => acc + (h.logs?.filter(l => l.completed).length || 0), 0);
    const avgStreak = habits.length ? Math.round(habits.reduce((acc, h) => acc + (h.streak || 0), 0) / habits.length) : 0;
    const completedToday = completedTodayList.length;
    const todayHabitsCount = todayHabits.length;
    const completionRate = todayHabitsCount > 0 ? (completedToday / todayHabitsCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#0a0a0c] p-4 md:p-8 text-slate-200">
            {/* XP Notifications */}
            <div className="fixed top-24 right-8 z-50 flex flex-col gap-2">
                {xpQueue.map(xp => (
                    <XPNotification 
                        key={xp.id} 
                        xp={xp.amount} 
                        onComplete={() => setXpQueue(q => q.filter(item => item.id !== xp.id))}
                    />
                ))}
            </div>

            {/* Cinematic Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 font-medium tracking-wider text-sm uppercase">Habit Nexus</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic uppercase tracking-tighter">
                            Incomplete Tasks
                        </h1>
                    </div>
                    
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                        <button 
                            onClick={() => setActiveTab('tracking')}
                            className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'tracking' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Activity className="w-4 h-4" />
                            MISSIONS
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            ANALYTICS
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {activeTab === 'tracking' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Stats Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Trophy className="w-24 h-24 text-emerald-400" />
                                </div>
                                <div className="relative">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Metrics</div>
                                    <div className="flex items-center gap-6">
                                        <ProgressRing progress={completionRate} size={80} strokeWidth={8} />
                                        <div>
                                            <div className="text-2xl font-black text-white">{completedToday} / {todayHabitsCount}</div>
                                            <div className="text-xs text-slate-500 font-medium">Daily Missions Clear</div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</div>
                                            <div className="text-lg font-bold text-emerald-400">Lvl {user?.level || 1}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EXP</div>
                                            <div className="text-lg font-bold text-white">{user?.xp || 0} / {(user?.level || 1) * 100}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ActivityHeatmap data={heatmapData} color="emerald" />

                            <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weekly Neural Pulse</h3>
                                    <BarChart3 className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData}>
                                            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                                {weeklyData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.count > 0 ? '#10b981' : '#1e293b'} />
                                                ))}
                                            </Bar>
                                            <XAxis dataKey="name" hide />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold text-emerald-400 shadow-2xl">
                                                                {payload[0].value} MISSIONS
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Habits List */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                                <div className="flex items-center gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800">
                                    {[
                                        {id: 'active_today', label: 'Incomplete'},
                                        {id: 'completed_today', label: 'Completed'},
                                        {id: 'all', label: 'Full Registry'}
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFilter(f.id)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs italic"
                                >
                                    <Plus className="w-4 h-4" />
                                    Init Protocol
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Conditional Rendering based on Filter */}
                                {filter === 'active_today' && (
                                    <>
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-[2px] w-12 bg-emerald-500/50" />
                                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">Pending Missions</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pendingToday.map(habit => (
                                                    <HabitItem key={habit._id} habit={habit} onUpdate={handleUpdate} onDelete={() => dispatch(deleteHabit(habit._id))} />
                                                ))}
                                                {pendingToday.length === 0 && (
                                                    <div className="col-span-full py-12 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                                        <CheckCircle2 size={32} className="mx-auto mb-4 text-emerald-500/20" />
                                                        <div className="text-slate-600 font-black uppercase tracking-widest text-[10px]">All major nodes clear for this cycle</div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {completedTodayList.length > 0 && (
                                            <section className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-[2px] w-12 bg-slate-800" />
                                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Cleared Tasks</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {completedTodayList.map(habit => (
                                                        <HabitItem key={habit._id} habit={habit} onUpdate={handleUpdate} onDelete={() => dispatch(deleteHabit(habit._id))} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </>
                                )}

                                {filter !== 'active_today' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                                        {displayList.map(habit => (
                                            <HabitItem key={habit._id} habit={habit} onUpdate={handleUpdate} onDelete={() => dispatch(deleteHabit(habit._id))} />
                                        ))}
                                        {displayList.length === 0 && (
                                            <div className="col-span-full py-20 text-center bg-slate-900/10 rounded-3xl border border-dashed border-slate-800">
                                                <Sparkles className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                                <div className="text-slate-600 font-bold uppercase tracking-widest text-xs">No entries found in registry</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="p-8 bg-slate-900/40 border border-emerald-500/10 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" />
                                Streak Persistence
                            </h3>
                            <div className="space-y-4">
                                {habits.slice().sort((a,b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5).map(h => (
                                    <div key={h._id} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                                        <span className="font-bold text-sm tracking-tight">{h.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-orange-500 font-black italic">{h.streak || 0}D</span>
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2 p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl group">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Temporal Efficiency</h3>
                            <div className="h-64 w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <Activity className="w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                                <div className="font-black tracking-widest text-[10px] uppercase">Processing historical data streams...</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Habit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0e] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
                        <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">Forge Node</h2>
                        <form onSubmit={onAddHabit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Node Identifier</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-slate-800"
                                    placeholder="e.g. NEURAL_SYNOPSIS"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sync Cycle</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none appearance-none"
                                        value={newHabit.frequency}
                                        onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                                    >
                                        <option value="daily">Daily Loop</option>
                                        <option value="weekly">Weekly Burst</option>
                                        <option value="custom">Custom Params</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logic Type</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none appearance-none"
                                        value={newHabit.trackingType}
                                        onChange={(e) => setNewHabit({...newHabit, trackingType: e.target.value, targetValue: 1, targetDuration: 0})}
                                    >
                                        <option value="boolean">Bitwise (1/0)</option>
                                        <option value="quantity">Integer (Count)</option>
                                        <option value="duration">Clock (Time)</option>
                                        <option value="bitwise">Sequence (W,L)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {newHabit.trackingType === 'duration' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock size={12} /> Target Mission Time (Minutes)
                                    </label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                        value={newHabit.targetDuration}
                                        onChange={(e) => setNewHabit({...newHabit, targetDuration: parseInt(e.target.value)})}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-4 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white rounded-2xl font-bold transition-all uppercase tracking-widest text-[10px]">Abort</button>
                                <button type="submit" className="flex-1 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs italic">Activate Node</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;
