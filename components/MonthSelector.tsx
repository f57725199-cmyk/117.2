
import React from 'react';
import { ClassSyllabus, UserProgress } from '../types';

interface MonthSelectorProps {
  syllabus: ClassSyllabus;
  progress: UserProgress;
  onChangeMonth: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ syllabus, progress, onChangeMonth }) => {
  const getCompletionPercentage = (monthIdx: number) => {
    const month = syllabus.months[monthIdx];
    let total = 0, completed = 0;
    
    if (month.dailyRevisionPlan) {
      total = month.dailyRevisionPlan.length;
      month.dailyRevisionPlan.forEach(p => {
        const id = `${syllabus.classLevel}_m${monthIdx}_DailyRevision_${p}`;
        if (progress.completedTopics.includes(id)) completed++;
      });
    } else {
      month.content.forEach(sub => {
        sub.topics.forEach(t => {
          total++;
          const id = `${syllabus.classLevel}_m${monthIdx}_${sub.subjectName}_${t.name}`;
          if (progress.completedTopics.includes(id)) completed++;
        });
      });
    }
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  return (
    <section className="bg-white/90 backdrop-blur-md sticky top-24 z-40 py-6 px-4 -mx-4 overflow-x-auto no-scrollbar scroll-smooth flex gap-4 border-b border-slate-200 shadow-sm mb-8">
      {syllabus.months.map((m, i) => {
        const isSelected = progress.currentMonth === m.month;
        const monthProgress = getCompletionPercentage(i);
        return (
          <button
            key={i}
            onClick={() => onChangeMonth(m.month)}
            className={`flex-shrink-0 w-24 h-24 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center justify-center relative ${
              isSelected ? 'border-indigo-600 bg-white shadow-2xl scale-105 z-10' : 
              monthProgress < 100 ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">M-{m.month}</span>
            <span className="text-xl font-black">{monthProgress}%</span>
            {monthProgress < 100 && i < (progress.currentMonth - 1) && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
            )}
          </button>
        );
      })}
    </section>
  );
};

export default MonthSelector;
