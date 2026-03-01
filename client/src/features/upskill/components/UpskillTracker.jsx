import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUpskillProjects, addUpskillProject, addSession, toggleMilestone, deleteProject, reset } from '../store/upskillSlice';
import { GraduationCap, Plus, BookOpen, Clock, Target, Play, Calendar, Trophy, Sparkles, BarChart3, Activity, Timer, ChevronDown, List, Layers } from 'lucide-react';
import UpskillItem from './UpskillItem';
import ProgressRing from '../../../components/common/ProgressRing';
import XPNotification from '../../../components/common/XPNotification';
import ActivityHeatmap from '../../../components/common/ActivityHeatmap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UpskillTracker = () => {
    const dispatch = useDispatch();
    const { projects, isLoading } = useSelector((state) => state.upskill);
    const { user } = useSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'analytics'
    const [projectForm, setProjectForm] = useState({
        skillName: '',
        goalLevel: 'daily',
        targetHours: '',
        startDate: '',
        endDate: '',
        milestones: []
    });
    const [tempMilestone, setTempMilestone] = useState('');
    const [showSessionModal, setShowSessionModal] = useState(null);
    const [xpQueue, setXpQueue] = useState([]);
    
    const [sessionForm, setSessionForm] = useState({
        duration: '',
        conceptsLearnt: '',
        workDone: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch(getUpskillProjects());
        return () => dispatch(reset());
    }, [dispatch]);

    const onAddProject = (e) => {
        e.preventDefault();
        if (projectForm.skillName.trim()) {
            dispatch(addUpskillProject(projectForm));
            setProjectForm({
                skillName: '',
                goalLevel: 'daily',
                targetHours: '',
                startDate: '',
                endDate: '',
                milestones: []
            });
        }
    };

    const addMilestone = () => {
        if (tempMilestone.trim()) {
            setProjectForm({
                ...projectForm,
                milestones: [...projectForm.milestones, { title: tempMilestone.trim(), completed: false }]
            });
            setTempMilestone('');
        }
    };

    const handleAddSession = (e) => {
        e.preventDefault();
        if (sessionForm.duration && showSessionModal) {
            dispatch(addSession({
                id: showSessionModal,
                sessionData: sessionForm
            }));
            setXpQueue(prev => [...prev, { id: Date.now(), amount: 30 }]);
            setShowSessionModal(null);
            setSessionForm({
                duration: '',
                conceptsLearnt: '',
                workDone: '',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    };

    const handleUpdateMilestone = (projectId, milestoneId) => {
        dispatch(toggleMilestone({ projectId, milestoneId }));
        setXpQueue(prev => [...prev, { id: Date.now(), amount: 50 }]);
    };

    // Analytics Data
    const heatmapData = useMemo(() => {
        const counts = {};
        projects.forEach(project => {
            project.sessions?.forEach(session => {
                const date = new Date(session.date).toISOString().split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            });
        });
        return Object.entries(counts).map(([date, value]) => ({ date, value }));
    }, [projects]);

    const weeklyData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            let count = 0;
            projects.forEach(p => {
                p.sessions?.forEach(s => {
                    if (new Date(s.date).toISOString().split('T')[0] === date) count++;
                });
            });
            return { name: dayName, count };
        });
    }, [projects]);

    const totalMinutesLogged = projects.reduce((acc, p) => acc + (p.totalMinutes || 0), 0);
    const totalHours = (totalMinutesLogged / 60).toFixed(1);

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
                            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                            <span className="text-indigo-400 font-medium tracking-wider text-sm uppercase">Skynet Academy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic uppercase tracking-tighter">
                            Knowledge Expansion
                        </h1>
                    </div>
                    
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                        <button 
                            onClick={() => setActiveTab('projects')}
                            className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'projects' ? 'bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <BookOpen className="w-4 h-4" />
                            PROJECTS
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-bold ${activeTab === 'analytics' ? 'bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            ANALYTICS
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {activeTab === 'projects' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Stats Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <GraduationCap className="w-24 h-24 text-indigo-400" />
                                </div>
                                <div className="relative">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Neural Density</div>
                                    <div className="flex items-center gap-6">
                                        <ProgressRing progress={Math.min(100, (totalHours / 100) * 100)} color="#6366f1" size={80} strokeWidth={8} />
                                        <div>
                                            <div className="text-2xl font-black text-white">{totalHours} HRS</div>
                                            <div className="text-xs text-slate-500 font-medium">Global Knowledge Load</div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Paths</div>
                                            <div className="text-lg font-bold text-indigo-400">{projects.length}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Power Level</div>
                                            <div className="text-lg font-bold text-white">LVL {user?.level || 1}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ActivityHeatmap data={heatmapData} color="indigo" />

                            <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synaptic Pulse</h3>
                                    <BarChart3 className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData}>
                                            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                                {weeklyData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.count > 0 ? '#6366f1' : '#1e293b'} />
                                                ))}
                                            </Bar>
                                            <XAxis dataKey="name" hide />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold text-indigo-400 shadow-2xl">
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

                        {/* Project Initiation & List */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Project Initiation */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-xl font-black text-white mb-8 flex items-center space-x-3 italic uppercase">
                                    <Plus size={20} className="text-indigo-500" />
                                    <span>Initiate Neural Path</span>
                                </h3>
                                <form onSubmit={onAddProject} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Path Identifier</label>
                                            <input
                                                type="text"
                                                value={projectForm.skillName}
                                                onChange={(e) => setProjectForm({ ...projectForm, skillName: e.target.value })}
                                                placeholder="e.g. ADVANCED_RUST_CORE"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hierarchy Level</label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none appearance-none font-bold text-sm"
                                                    value={projectForm.goalLevel}
                                                    onChange={(e) => setProjectForm({...projectForm, goalLevel: e.target.value})}
                                                >
                                                    <option value="hourly">Hourly Flow</option>
                                                    <option value="daily">Daily Habit</option>
                                                    <option value="weekly">Weekly Sprint</option>
                                                    <option value="monthly">Monthly Peak</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Hours</label>
                                            <input
                                                type="number"
                                                value={projectForm.targetHours}
                                                onChange={(e) => setProjectForm({ ...projectForm, targetHours: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start (Optional)</label>
                                            <input
                                                type="date"
                                                value={projectForm.startDate}
                                                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none text-sm color-scheme-dark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End (Optional)</label>
                                            <input
                                                type="date"
                                                value={projectForm.endDate}
                                                onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none text-sm color-scheme-dark"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Target size={12} className="text-indigo-500" /> Milestone Nodes
                                        </label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={tempMilestone}
                                                onChange={(e) => setTempMilestone(e.target.value)}
                                                placeholder="Define sub-module..."
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 text-sm"
                                            />
                                            <button 
                                                type="button"
                                                onClick={addMilestone}
                                                className="px-6 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white transition-colors border border-slate-700"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {projectForm.milestones.map((m, i) => (
                                                <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1 text-[10px] font-black text-indigo-400 uppercase italic">
                                                    {m.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest text-sm italic"
                                    >
                                        Instantiate Protocol
                                    </button>
                                </form>
                            </div>

                            {/* Project List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isLoading ? (
                                    <div className="col-span-full flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="col-span-full bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl p-20 text-center">
                                        <GraduationCap size={48} className="mx-auto text-slate-800 mb-6" />
                                        <p className="text-slate-700 font-black uppercase tracking-widest text-[10px]">No neural projects detected in registry</p>
                                    </div>
                                ) : (
                                    projects.map((project) => (
                                        <div key={project._id} className="relative group">
                                            <UpskillItem 
                                                project={project} 
                                                onUpdateMilestone={handleUpdateMilestone}
                                                onDelete={(id) => dispatch(deleteProject(id))}
                                            />
                                            <button 
                                                onClick={() => setShowSessionModal(project._id)}
                                                className="absolute top-6 right-6 p-4 bg-indigo-500 text-slate-900 rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-90 transition-all z-10 opacity-0 group-hover:opacity-100"
                                            >
                                                <Play size={20} fill="currentColor" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Analytics Cards */}
                        <div className="p-8 bg-slate-900/40 border border-indigo-500/10 rounded-3xl backdrop-blur-xl">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic flex items-center gap-2">
                                <Layers size={14} className="text-indigo-400" /> Neural Density Level
                            </h3>
                            <div className="space-y-6">
                                {projects.slice(0, 5).map((p, i) => (
                                    <div key={p._id} className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-indigo-400">{p.skillName}</span>
                                            <span className="text-white">{(p.totalMinutes / 60).toFixed(1)} HRS</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (p.totalMinutes / (p.targetHours * 60)) * 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {projects.length === 0 && (
                                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest text-center py-4 italic">Establishing baseline data...</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2 p-8 bg-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-xl group overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-32 h-32 text-indigo-500" />
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic">Neuro-Temporal Logic</h3>
                            <div className="h-64 w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <Timer className="w-16 h-16 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                                <div className="font-black tracking-widest text-[10px] uppercase">Decrypting acquisition velocity...</div>
                                <p className="text-[10px] text-slate-800 font-medium italic">Processing cognitive feedback loops...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mission Log Modal */}
            {showSessionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0e] border border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                        <h3 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase italic">Mission Report</h3>
                        <form onSubmit={handleAddSession} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sync Duration (MIN)</label>
                                    <input
                                        type="number"
                                        value={sessionForm.duration}
                                        onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cycle Date</label>
                                    <input
                                        type="date"
                                        value={sessionForm.date}
                                        onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none text-sm color-scheme-dark"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural Concepts Learnt</label>
                                <input
                                    type="text"
                                    value={sessionForm.conceptsLearnt}
                                    onChange={(e) => setSessionForm({ ...sessionForm, conceptsLearnt: e.target.value })}
                                    placeholder="e.g. ASYNC_TRAIT_RESOLVER"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Briefing Notes</label>
                                <textarea
                                    value={sessionForm.notes}
                                    onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Log the nuances of this session..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowSessionModal(null)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px]">Abort</button>
                                <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-xs italic">Sync Registry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpskillTracker;
