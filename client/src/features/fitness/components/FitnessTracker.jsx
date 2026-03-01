import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getFitnessLogs, addFitnessLog, deleteFitnessLog, 
    getExercises, addExercise, updateExercise, deleteExercise,
    toggleExerciseLog, reset 
} from '../store/fitnessSlice';
import { 
    Dumbbell, Plus, Activity, Zap, Clock, Trophy, 
    ChevronRight, ChevronLeft, BarChart3, Sparkles, 
    Timer, Flame, CheckCircle2, List, Settings, Save, Trash2, Circle
} from 'lucide-react';
import FitnessItem from './FitnessItem';
import ProgressRing from '../../../components/common/ProgressRing';
import XPNotification from '../../../components/common/XPNotification';
import ActivityHeatmap from '../../../components/common/ActivityHeatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FitnessTracker = () => {
    const dispatch = useDispatch();
    const { logs, exercises, isLoading } = useSelector((state) => state.fitness);
    const { user } = useSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'registry', 'analytics'
    const [xpQueue, setXpQueue] = useState([]);
    const [showAddExercise, setShowAddExercise] = useState(false);
    
    const [newExercise, setNewExercise] = useState({
        name: '',
        category: 'strength',
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
        defaultDuration: 0
    });

    useEffect(() => {
        dispatch(getFitnessLogs());
        dispatch(getExercises());
        return () => dispatch(reset());
    }, [dispatch]);

    const handleToggle = (exerciseId) => {
        dispatch(toggleExerciseLog(exerciseId));
        setXpQueue(prev => [...prev, { id: Date.now(), amount: 30 }]);
    };

    const onAddExercise = (e) => {
        e.preventDefault();
        dispatch(addExercise(newExercise));
        setShowAddExercise(false);
        setNewExercise({ name: '', category: 'strength', defaultSets: 3, defaultReps: 10, defaultWeight: 0, defaultDuration: 0 });
    };

    const handleUpdateExercise = (ex) => {
        dispatch(updateExercise(ex));
    };

    const todayStr = new Date().toISOString().split('T')[0];
    
    const { pendingDaily, completedDaily } = useMemo(() => {
        const pending = [];
        const completed = [];

        exercises.forEach(ex => {
            const log = logs.find(l => 
                l.exerciseId === ex._id && 
                new Date(l.date).toISOString().split('T')[0] === todayStr
            );

            if (log?.completed) {
                completed.push({ ...ex, logId: log._id });
            } else {
                pending.push(ex);
            }
        });

        return { pendingDaily: pending, completedDaily: completed };
    }, [exercises, logs, todayStr]);

    // Analytics Data
    const heatmapData = useMemo(() => {
        const counts = {};
        logs.forEach(log => {
            if (log.completed) {
                const date = new Date(log.date).toISOString().split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([date, value]) => ({ date, value }));
    }, [logs]);

    const weeklyData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const count = logs.filter(l => l.completed && new Date(l.date).toISOString().split('T')[0] === date).length;
            return { name: dayName, count };
        });
    }, [logs]);

    const dailyCompletionRate = exercises.length > 0 ? (completedDaily.length / exercises.length) * 100 : 0;

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
                            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                            <span className="text-blue-400 font-medium tracking-wider text-sm uppercase">Kinetic Matrix</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic uppercase tracking-tighter">
                            Iron Sanctuary
                        </h1>
                    </div>
                    
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                        {[
                            {id: 'daily', label: 'MISSIONS', icon: <Zap className="w-4 h-4" />},
                            {id: 'registry', label: 'REGISTRY', icon: <List className="w-4 h-4" />},
                            {id: 'analytics', label: 'ANALYTICS', icon: <BarChart3 className="w-4 h-4" />}
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === tab.id ? 'bg-blue-500 text-slate-900 shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {activeTab === 'daily' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Summary Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Dumbbell className="w-24 h-24 text-blue-400" />
                                </div>
                                <div className="relative">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Daily Output</div>
                                    <div className="flex items-center gap-6">
                                        <ProgressRing progress={dailyCompletionRate} color="#3b82f6" size={80} strokeWidth={8} />
                                        <div>
                                            <div className="text-2xl font-black text-white">{completedDaily.length} / {exercises.length}</div>
                                            <div className="text-xs text-slate-500 font-medium">Exercises Mastered</div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</div>
                                            <div className="text-lg font-bold text-blue-400">Lvl {user?.level || 1}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EXP</div>
                                            <div className="text-lg font-bold text-white">{user?.xp || 0} / {(user?.level || 1) * 100}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ActivityHeatmap data={heatmapData} color="blue" />
                        </div>

                        {/* Missions List */}
                        <div className="lg:col-span-8 space-y-12">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-[2px] w-12 bg-blue-500/50" />
                                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic">Pending Protocols</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingDaily.map(ex => (
                                        <div key={ex._id} className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-800/50 text-slate-500 rounded-xl group-hover:text-blue-400 transition-colors">
                                                    <Dumbbell size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black italic uppercase tracking-tight text-white">{ex.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {ex.defaultSets} SETS × {ex.defaultReps || ex.defaultDuration + 'M'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleToggle(ex._id)}
                                                className="p-3 bg-slate-950/50 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-2xl border border-slate-800 transition-all"
                                            >
                                                <Circle size={24} />
                                            </button>
                                        </div>
                                    ))}
                                    {pendingDaily.length === 0 && exercises.length > 0 && (
                                        <div className="col-span-full py-12 text-center bg-blue-500/5 rounded-3xl border border-dashed border-blue-500/20">
                                            <CheckCircle2 size={32} className="mx-auto mb-4 text-blue-500/30" />
                                            <div className="text-slate-600 font-black uppercase tracking-widest text-[10px]">All daily kinetic objectives secured</div>
                                        </div>
                                    )}
                                    {exercises.length === 0 && (
                                        <div className="col-span-full py-20 text-center bg-slate-900/10 rounded-3xl border border-dashed border-slate-800">
                                            <Plus size={32} className="mx-auto mb-4 text-slate-800 hover:text-blue-500 cursor-pointer" onClick={() => setActiveTab('registry')} />
                                            <div className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No exercise templates found. Visit Registry.</div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {completedDaily.length > 0 && (
                                <section className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-[2px] w-12 bg-slate-800" />
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Executed Modules</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {completedDaily.map(ex => (
                                            <div key={ex._id} className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black italic uppercase tracking-tight text-slate-400 line-through">{ex.name}</h4>
                                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Protocol Clear</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggle(ex._id)}
                                                    className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl border border-blue-500/30"
                                                >
                                                    <CheckCircle2 size={24} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'registry' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white font-mono">Exercise Sub-System</h3>
                            <button 
                                onClick={() => setShowAddExercise(true)}
                                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-900 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-[10px] italic flex items-center gap-2"
                            >
                                <Plus size={14} /> New Fragment
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exercises.map(ex => (
                                <div key={ex._id} className="bg-slate-950/40 border border-slate-800 rounded-3xl p-8 relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-12 -mt-12 group-hover:w-32 group-hover:h-32 transition-all duration-700" />
                                     
                                     <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-2xl ${ex.category === 'strength' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            <Dumbbell size={20} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => dispatch(deleteExercise(ex._id))} className="p-2 text-slate-700 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                     </div>

                                     <h4 className="text-xl font-black italic uppercase text-white mb-2">{ex.name}</h4>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">{ex.category}</span>

                                     <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Sets</label>
                                            <input 
                                                type="number" 
                                                value={ex.defaultSets} 
                                                onChange={(e) => handleUpdateExercise({...ex, defaultSets: parseInt(e.target.value)})}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        {ex.category === 'strength' ? (
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Reps</label>
                                                <input 
                                                    type="number" 
                                                    value={ex.defaultReps} 
                                                    onChange={(e) => handleUpdateExercise({...ex, defaultReps: parseInt(e.target.value)})}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Mins</label>
                                                <input 
                                                    type="number" 
                                                    value={ex.defaultDuration} 
                                                    onChange={(e) => handleUpdateExercise({...ex, defaultDuration: parseInt(e.target.value)})}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        )}
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                         {/* Intensity Map */}
                         <div className="p-8 bg-slate-900/40 border border-blue-500/10 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic">Kinetic Intensity</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {weeklyData.map((entry, index) => (
                                                <Cell key={index} fill={entry.count > 0 ? '#3b82f6' : '#1e293b'} />
                                            ))}
                                        </Bar>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Flame className="w-32 h-32 text-orange-500" />
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic">Neuro-Muscular Adaptation</h3>
                            <div className="h-64 w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <Timer className="w-16 h-16 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                                <div className="font-black tracking-widest text-[10px] uppercase">Analyzing repetitive stress cycles...</div>
                                <p className="text-[10px] text-slate-800 font-medium italic">Scanning for peak performance windows...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Exercise Modal */}
            {showAddExercise && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0e] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">Forge Fragment</h2>
                        <form onSubmit={onAddExercise} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fragment Identifier</label>
                                <input 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-800"
                                    placeholder="e.g. SQUAT_PROTOCOL"
                                    value={newExercise.name}
                                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Domain</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none appearance-none"
                                        value={newExercise.category}
                                        onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
                                    >
                                        <option value="strength">Strength</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="flexibility">Mobility</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Repetition Sets</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none"
                                        value={newExercise.defaultSets}
                                        onChange={(e) => setNewExercise({...newExercise, defaultSets: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            {newExercise.category === 'strength' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Standard Output (Reps)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none"
                                        value={newExercise.defaultReps}
                                        onChange={(e) => setNewExercise({...newExercise, defaultReps: parseInt(e.target.value)})}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporal Duration (Mins)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none"
                                        value={newExercise.defaultDuration}
                                        onChange={(e) => setNewExercise({...newExercise, defaultDuration: parseInt(e.target.value)})}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowAddExercise(false)} className="flex-1 px-8 py-4 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white rounded-2xl font-bold transition-all uppercase tracking-widest text-[10px]">Abort</button>
                                <button type="submit" className="flex-1 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-slate-900 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs italic">Sync Fragment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FitnessTracker;
