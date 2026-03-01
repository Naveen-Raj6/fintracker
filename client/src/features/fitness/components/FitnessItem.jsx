import React from 'react';
import { Dumbbell, Clock, Activity, Trash2, Plus, Zap } from 'lucide-react';

const FitnessItem = ({ log, onDelete }) => {
    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 hover:border-slate-600 transition-all group flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${
                    log.activityCategory === 'strength' ? 'bg-orange-500/10 text-orange-500' :
                    log.activityCategory === 'cardio' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-emerald-500/10 text-emerald-500'
                }`}>
                    {log.activityCategory === 'cardio' ? <Activity size={24} /> : <Dumbbell size={24} />}
                </div>
                
                <div>
                    <h4 className="text-lg font-bold text-white">{log.activityType}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        {log.duration && (
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                                <Clock size={12} />
                                {log.duration} mins
                            </div>
                        )}
                        {log.distance && (
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                                <Zap size={12} className="text-blue-500" />
                                {log.distance} km
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {log.activityCategory === 'strength' && log.sets?.length > 0 && (
                    <div className="flex gap-2">
                        {log.sets.slice(0, 3).map((set, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2 text-center min-w-[3.5rem]">
                                <div className="text-[10px] text-slate-500 font-bold uppercase">Set {idx + 1}</div>
                                <div className="text-sm font-black text-white">{set.reps} × {set.weight}k</div>
                            </div>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={() => onDelete(log._id)}
                    className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-500/10 ml-4"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default FitnessItem;
