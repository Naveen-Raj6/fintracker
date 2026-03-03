import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getExpenses } from '../../expenses/store/expenseSlice';
import { getHabits } from '../../habits/store/habitSlice';
import { getFitnessLogs } from '../../fitness/store/fitnessSlice';
import { getUpskillProjects } from '../../upskill/store/upskillSlice';
import { 
    Wallet, 
    CheckCircle2, 
    Dumbbell, 
    GraduationCap,
    TrendingUp,
    Activity,
    ChevronRight,
    Sparkles,
    Zap,
    Target,
    ArrowUpRight
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const HomeDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { expenses } = useSelector((state) => state.expenses);
    const { habits } = useSelector((state) => state.habits);
    const { logs: fitnessLogs } = useSelector((state) => state.fitness);
    const { projects: upskillProjects } = useSelector((state) => state.upskill);

    useEffect(() => {
        dispatch(getExpenses());
        dispatch(getHabits());
        dispatch(getFitnessLogs());
        dispatch(getUpskillProjects());
    }, [dispatch]);

    const totalExpenses = expenses
        .filter(item => item.type === 'expense' || !item.type)
        .reduce((acc, item) => acc + item.amount, 0);

    const activeHabits = habits.length;
    const fitnessCount = fitnessLogs.length;
    const upskillCount = upskillProjects.length;

    const modules = [
      {
        id: 'finance',
        name: 'FINANCE_MATRIX',
        value: `₹${totalExpenses.toLocaleString()}`,
        metric: 'AGGREGATE_EXPENSE',
        icon: <Wallet size={24} />,
        link: '/finance',
        color: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/20',
        border: 'border-emerald-500/20'
      },
      {
        id: 'habits',
        name: 'NEURAL_SYNC',
        value: activeHabits,
        metric: 'ACTIVE_PROTOCOLS',
        icon: <CheckCircle2 size={24} />,
        link: '/habits',
        color: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-500/20',
        border: 'border-blue-500/20'
      },
      {
        id: 'fitness',
        name: 'KINETIC_FLOW',
        value: fitnessCount,
        metric: 'SESSIONS_LOGGED',
        icon: <Dumbbell size={24} />,
        link: '/fitness',
        color: 'from-rose-500 to-red-600',
        glow: 'shadow-rose-500/20',
        border: 'border-rose-500/20'
      },
      {
        id: 'upskill',
        name: 'SKYNET_ACADEMY',
        value: upskillCount,
        metric: 'KNOWLEDGE_NODES',
        icon: <GraduationCap size={24} />,
        link: '/upskill',
        color: 'from-orange-500 to-amber-600',
        glow: 'shadow-orange-500/20',
        border: 'border-orange-500/20'
      }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] pt-8 pb-12 px-4 md:px-8">
            {/* Cinematic Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                        <span className="text-blue-400 font-black tracking-[0.3em] text-[10px] uppercase">Command Center Alpha</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase mb-4">
                        Welcome, <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">{user?.name}</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide max-w-2xl">
                        Holistic performance metrics synchronized. All systems operational. 
                        Targeting 100% efficiency in all primary life protocols.
                    </p>
                </header>

                {/* Module Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {modules.map((module) => (
                        <RouterLink
                            key={module.id}
                            to={module.link}
                            className={`group relative bg-slate-900/40 backdrop-blur-xl border ${module.border} rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all duration-500 overflow-hidden shadow-2xl hover:${module.glow} hover:-translate-y-2`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                                {module.icon}
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${module.color} shadow-lg ${module.glow}`}>
                                        {module.icon}
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                                
                                <h3 className="text-[10px] font-black text-slate-500 tracking-[0.2em] mb-2 uppercase">{module.name}</h3>
                                <div className="text-4xl font-black text-white mb-4 italic tracking-tighter">
                                    {module.value}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 bg-blue-500 rounded-full animate-ping" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{module.metric}</span>
                                </div>
                            </div>
                        </RouterLink>
                    ))}
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 p-10 bg-slate-900/40 border border-slate-800/50 rounded-[3rem] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Efficiency Metrics</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Real-time system analysis</p>
                            </div>
                            <Zap className="w-6 h-6 text-yellow-400" />
                        </div>

                        <div className="space-y-8">
                            {[
                              { label: 'Neural Habit Consistency', val: '94%', color: 'bg-indigo-500' },
                              { label: 'Kinetic Output Level', val: '78%', color: 'bg-rose-500' },
                              { label: 'Knowledge Registry Expansion', val: '62%', color: 'bg-orange-500' }
                            ].map((item, i) => (
                              <div key={i} className="space-y-3">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-white">{item.val}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000 delay-300`} style={{ width: item.val }} />
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-10 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[3rem] backdrop-blur-xl group relative overflow-hidden">
                            <Target className="w-12 h-12 text-blue-400/20 absolute -bottom-2 -right-2 transform -rotate-12 group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-lg font-black text-white italic uppercase mb-6 tracking-tight">Active Catalyst</h3>
                            <blockquote className="text-slate-300 font-medium italic mb-6 leading-relaxed">
                                "The only limit to our realization of tomorrow will be our doubts of today."
                            </blockquote>
                            <div className="h-px w-8 bg-blue-500 mb-2" />
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">— FRANKLIN D. ROOSEVELT</p>
                        </div>

                        <div className="p-8 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] backdrop-blur-xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/40 transition-all">
                          <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Upcoming Milestone</div>
                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Neural Sync Calibration</div>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-blue-500/50 transition-colors">
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400" />
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;
