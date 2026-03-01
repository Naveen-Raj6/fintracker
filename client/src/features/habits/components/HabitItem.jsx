import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, Circle, Flame, Clock, Hash, 
    Plus, Minus, RotateCcw, Swords, Timer,
    Save, Play, Pause, ChevronRight
} from 'lucide-react';

const HabitItem = ({ habit, onUpdate, onDelete }) => {
    const [isTiming, setIsTiming] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [manualMinutes, setManualMinutes] = useState('');
    const [bitwiseInput, setBitwiseInput] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const todayLog = habit.logs.find(log => new Date(log.date).toISOString().split('T')[0] === today);
    const completed = todayLog?.completed || (habit.trackingType === 'boolean' && !!todayLog);

    useEffect(() => {
        if (todayLog) {
            if (habit.trackingType === 'duration') setManualMinutes(todayLog.duration?.toString() || '');
            if (habit.trackingType === 'bitwise') setBitwiseInput(todayLog.sequence || '');
        }
    }, [todayLog, habit.trackingType]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isTiming) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (seconds > 0) {
            const minutesToAdd = Math.floor(seconds / 60);
            if (minutesToAdd > 0) {
                const currentDuration = todayLog?.duration || 0;
                onUpdate(habit._id, { 
                    duration: currentDuration + minutesToAdd,
                    completed: (currentDuration + minutesToAdd) >= (habit.targetDuration || 1)
                });
            }
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isTiming, habit._id, onUpdate, seconds, todayLog, habit.targetDuration]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManualLog = () => {
        if (habit.trackingType === 'duration') {
            const mins = parseInt(manualMinutes);
            if (!isNaN(mins)) {
                onUpdate(habit._id, { 
                    duration: mins, 
                    completed: mins >= (habit.targetDuration || 1) 
                });
            }
        } else if (habit.trackingType === 'bitwise') {
            onUpdate(habit._id, { 
                sequence: bitwiseInput, 
                completed: bitwiseInput.length > 0 
            });
        }
    };

    const renderInput = () => {
        switch (habit.trackingType) {
            case 'boolean':
                return (
                    <button
                        onClick={() => onUpdate(habit._id, { completed: !completed })}
                        className={`transition-all duration-500 p-3 rounded-2xl ${
                            completed
                                ? 'bg-emerald-500/20 text-emerald-500 scale-110'
                                : 'bg-slate-700/30 text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {completed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                    </button>
                );
            case 'quantity':
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-900/50 rounded-2xl p-1 border border-slate-700/50">
                            <button 
                                onClick={() => onUpdate(habit._id, { value: Math.max(0, (todayLog?.value || 0) - 1), completed: Math.max(0, (todayLog?.value || 0) - 1) >= (habit.targetValue || 1) })}
                                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="px-4 font-bold text-white min-w-[3rem] text-center">
                                {todayLog?.value || 0}
                            </span>
                            <button 
                                onClick={() => onUpdate(habit._id, { value: (todayLog?.value || 0) + 1, completed: (todayLog?.value || 0) + 1 >= (habit.targetValue || 1) })}
                                className="p-2 hover:bg-slate-700 rounded-xl text-emerald-500 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                );
            case 'duration':
                return (
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                placeholder="MIN"
                                value={manualMinutes}
                                onChange={(e) => setManualMinutes(e.target.value)}
                                className="w-20 bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                            <button 
                                onClick={handleManualLog}
                                className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all"
                            >
                                <Save size={18} />
                            </button>
                        </div>
                        <div className="flex items-center bg-slate-900/50 rounded-2xl p-1 border border-slate-700/50">
                            <span className="px-4 font-mono font-bold text-emerald-500 min-w-[4rem] text-center">
                                {isTiming ? formatTime(seconds) : `${todayLog?.duration || 0}m`}
                            </span>
                            <button 
                                onClick={() => setIsTiming(!isTiming)}
                                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    isTiming ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                                }`}
                            >
                                {isTiming ? 'Stop' : 'Timer'}
                            </button>
                        </div>
                    </div>
                );
            case 'bitwise':
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1 items-end">
                            <input 
                                type="text"
                                placeholder="e.g. W,L,W"
                                value={bitwiseInput}
                                onChange={(e) => setBitwiseInput(e.target.value.toUpperCase())}
                                className="w-32 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-xs font-black tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-800"
                            />
                            <div className="flex gap-1">
                                {['W', 'L', 'D'].map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => setBitwiseInput(prev => prev ? `${prev},${val}` : val)}
                                        className="px-2 py-0.5 bg-slate-800 text-[9px] font-black rounded-md hover:bg-slate-700 transition-colors"
                                    >
                                        +{val}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleManualLog}
                            className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 transition-all self-start"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`group relative bg-slate-900/40 backdrop-blur-md border transition-all duration-700 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            completed ? 'border-emerald-500/30 bg-emerald-500/5 shadow-2xl' : 'border-slate-800/50 hover:border-slate-700'
        }`}>
            {completed && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-900 p-1.5 rounded-lg shadow-lg rotate-12">
                    <CheckCircle2 size={16} />
                </div>
            )}

            <div className="flex items-center gap-6 flex-1">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${
                    completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-400'
                }`}>
                    {habit.trackingType === 'duration' ? <Clock size={24} /> : habit.trackingType === 'bitwise' ? <Swords size={24} /> : habit.trackingType === 'quantity' ? <Hash size={24} /> : <Flame size={24} />}
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h4 className={`text-xl font-black italic tracking-tight transition-all duration-500 ${completed ? 'text-slate-500 line-through opacity-50' : 'text-white'}`}>
                            {habit.name}
                        </h4>
                        {habit.isRecurring && (
                            <RotateCcw size={12} className="text-slate-700" title="Recurring Node" />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                            habit.streak > 0 ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_15px_-5px_#f97316]' : 'bg-slate-800/50 text-slate-600'
                        }`}>
                            <Flame size={12} fill={habit.streak > 0 ? "currentColor" : "none"} />
                            {habit.streak} DAY STREAK
                        </div>
                        {habit.targetDuration > 0 && (
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/30 px-2 py-1 rounded-lg">
                                GOAL: {habit.targetDuration}m
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                {renderInput()}
                
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => onDelete(habit._id)}
                        className="p-2.5 text-slate-700 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-500/10"
                        title="TERMINATE_PROTOCOL"
                    >
                        <RotateCcw size={18} className="rotate-45" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HabitItem;
