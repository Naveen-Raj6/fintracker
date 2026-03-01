import React from 'react';
import { CheckSquare, Square, Trash2, Edit3, Target, Clock, Zap, BarChart } from 'lucide-react';

const UpskillItem = ({ project, onUpdateMilestone, onDelete }) => {
    const progress = project.targetHours > 0 
        ? Math.min(Math.round(((project.totalMinutes / 60) / project.targetHours) * 100), 100) 
        : 0;

    const getGoalLabel = (level) => {
        switch(level) {
            case 'hourly': return 'Hourly Target';
            case 'weekly': return 'Weekly Sprint';
            case 'monthly': return 'Monthly Peak';
            default: return 'Daily Loop';
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-500 group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700" />

            <div className="flex justify-between items-start mb-8 relative">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] rounded border border-indigo-500/20">
                            {getGoalLabel(project.goalLevel)}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{project.skillName}</h3>
                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-800/50 w-fit">
                        <span className="flex items-center gap-1.5"><Zap size={12} className="text-indigo-500" /> {project.sessions?.length || 0} SESSIONS</span>
                        <span className="flex items-center gap-1.5 text-white"><Clock size={12} className="text-indigo-400" /> {(project.totalMinutes / 60).toFixed(1)} / {project.targetHours} HRS</span>
                    </div>
                </div>
                <button 
                    onClick={() => onDelete(project._id)} 
                    className="p-3 bg-slate-950/50 text-slate-700 hover:text-rose-500 rounded-2xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Progress Visualization */}
            <div className="mb-10 relative">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                    <span className="flex items-center gap-2 italic">Neural Sync Status</span>
                    <span className="text-indigo-400 tabular-nums">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Milestones Hierarchy */}
            <div className="space-y-3 relative">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 italic">
                    <Target size={14} className="text-indigo-500" />
                    Objective Nodes
                </h4>
                {project.milestones?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {project.milestones.map((m) => (
                            <button
                                key={m._id}
                                onClick={() => onUpdateMilestone(project._id, m._id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group/btn ${
                                    m.completed 
                                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500' 
                                        : 'bg-slate-950/30 border-slate-800/50 text-slate-300 hover:border-indigo-500/30 hover:bg-slate-900/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`transition-colors ${m.completed ? 'text-emerald-500' : 'text-slate-700 group-hover/btn:text-indigo-500'}`}>
                                        {m.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                    <span className={`text-xs font-bold tracking-tight uppercase ${m.completed ? 'line-through opacity-40' : ''}`}>
                                        {m.title}
                                    </span>
                                </div>
                                {m.completed && (
                                    <span className="text-[8px] font-medium text-emerald-500/50 tabular-nums">Cleared</span>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">No sub-modules defined</p>
                    </div>
                )}
            </div>
            
            {/* Recent Session Peek */}
            {project.sessions?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart size={10} className="text-indigo-500" />
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Latest Entry</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic line-clamp-1">
                        {project.sessions[project.sessions.length - 1].notes || project.sessions[project.sessions.length - 1].conceptsLearnt || 'No data logged'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default UpskillItem;
