import React, { useMemo } from 'react';
import { ClassSyllabus, UserProgress } from '../types';
import MonthSelector from './MonthSelector';

interface McqPageProps {
  syllabus: ClassSyllabus;
  progress: UserProgress;
  onStartMcq: (id: string, name: string) => void;
  onChangeMonth: (month: number) => void;
}

const McqPage: React.FC<McqPageProps> = ({ syllabus, progress, onStartMcq, onChangeMonth }) => {
  
  const availableMcqs = useMemo(() => {
    const list: { subject: string; topic: string; id: string; month: number; score?: number }[] = [];
    
    // Look at previous months and current month topics
    syllabus.months.forEach((m, idx) => {
      if (m.month > progress.currentMonth) return; // Future months maybe locked?
      
      m.content.forEach(sub => {
        sub.topics.forEach(t => {
          const id = `${syllabus.classLevel}_m${idx}_${sub.subjectName}_${t.name}`;
          // Find if there's a result
          const result = progress.mcqResults.find(r => r.topicId === id);
          const score = result ? result.score : undefined;
          
          list.push({
             subject: sub.subjectName,
             topic: t.name,
             id,
             month: m.month,
             score
          });
        });
      });
    });
    
    // Sort: recent/active first, or weak ones first
    return list.sort((a, b) => {
       if (a.score === undefined && b.score !== undefined) return -1;
       if (a.score !== undefined && b.score === undefined) return 1;
       return 0;
    });
  }, [syllabus, progress]);

  return (
    <div className="space-y-8 pb-20">
       <MonthSelector syllabus={syllabus} progress={progress} onChangeMonth={onChangeMonth} />

       <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <i className="fas fa-brain text-9xl"></i>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">MCQ Arena</h2>
          <p className="text-indigo-200 font-medium max-w-xl">
             Test your knowledge. Topics you've studied are available here. Low scores indicate areas for improvement.
          </p>
       </div>

       <div className="bg-white rounded-[3rem] p-8 border-4 border-slate-100 shadow-xl">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Available Tests</h3>
          
          <div className="space-y-4">
             {availableMcqs.map((item, i) => (
               <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${item.score !== undefined ? (item.score >= 60 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600') : 'bg-slate-200 text-slate-500'}`}>
                        {item.score !== undefined ? `${item.score}%` : '?'}
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.subject} • M-{item.month}</div>
                        <div className="font-bold text-slate-900 text-lg">{item.topic}</div>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => onStartMcq(item.id, item.topic)}
                    className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all"
                  >
                     <i className="fas fa-play text-xs"></i>
                  </button>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default McqPage;
