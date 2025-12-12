// lib/accessControl.ts

export const getHistoryAccess = (level: number) => {
    // Level 1-2: Alleen vandaag
    if (level < 3) return { days: 0, weeks: 0, label: "alleen vandaag" };
    // Level 3-5: 3 dagen / 1 week terug
    if (level < 6) return { days: 3, weeks: 1, label: "3 dagen terug" };
    // Level 6-10: 7 dagen / 3 weken terug
    if (level < 11) return { days: 7, weeks: 3, label: "een week terug" };
    // Level 11+: Onbeperkt (of heel ver)
    return { days: 365, weeks: 52, label: "onbeperkt" };
};
