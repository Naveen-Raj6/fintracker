import React, { useEffect, useState } from 'react';

const XPNotification = ({ xp, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="animate-bounce-up bg-accent text-slate-900 font-black px-4 py-2 rounded-full shadow-lg shadow-accent/50 flex items-center gap-2">
                <span className="text-lg">+{xp}</span>
                <span className="text-xs uppercase tracking-widest">XP gained</span>
            </div>
        </div>
    );
};

export default XPNotification;
