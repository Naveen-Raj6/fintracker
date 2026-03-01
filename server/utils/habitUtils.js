// Helper function to calculate streak
const calculateStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;

    const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(sortedDates[0]);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0;

    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        date.setHours(0, 0, 0, 0);

        if (i === 0) {
            streak = 1;
        } else {
            const prevDate = new Date(sortedDates[i - 1]);
            prevDate.setHours(0, 0, 0, 0);

            const diff = Math.ceil(Math.abs(prevDate - date) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                streak++;
            } else if (diff === 0) {
                continue;
            } else {
                break;
            }
        }
    }
    return streak;
};

module.exports = {
    calculateStreak,
};
