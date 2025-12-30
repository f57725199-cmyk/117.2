import React, { useMemo } from 'react';
import { ClassSyllabus, UserProgress } from '../types';
import MonthSelector from './MonthSelector';

interface RevisionPageProps {
  syllabus: ClassSyllabus;
  progress: UserProgress;
  onChangeMonth: (month: number) => void;
}

const RevisionPage: React.FC<RevisionPageProps> = ({ syllabus, progress, onChangeMonth }) => {
  const isSunday = new Date().getDay() === 0;
  
  const prevMonthIdx = progress.currentMonth - 2;
  const prevMonthData = prevMonthIdx >= 0 ? syllabus.months[prevMonthIdx] : null;

  const revisionTopics = useMemo(() => {
    if (!prevMonthData) return [];
    const list: { subject: string; topic: string; id: string }[] = [];
    prevMonthData.content.forEach(sub => {
      sub.topics.forEach(t => {
        list.push({
          subject: sub.subjectName,
          topic: t.name,
          id: `${syllabus.classLevel}_m${prevMonthIdx}_${sub.subjectName}_${t.name}`
        });
      });
    });
    return list;
  }, [prevMonthData, syllabus, prevMonthIdx]);

  return (
    <div className="space-y-8 pb-20">
      <MonthSelector syllabus={syllabus} progress={progress} onChangeMonth={onChangeMonth} />
      
      <div className="bg-rose-50 rounded-[3rem] p-10 border-4 border-rose-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <i className="fas fa-history text-9xl text-rose-900"></i>
        </div>
        <h2 className="text-3xl font-black text-rose-900 uppercase tracking-tighter mb-4">Revision Control</h2>
        <p className="text-rose-700 font-medium max-w-2xl mb-8">
          Review topics from the previous month to ensure long-term retention. 
          {isSunday ? " It's Sunday! Focus strictly on revision." : " Daily revision enhances memory."}
        </p>
      </div>

      {isSunday && (
         <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-pulse border-4 border-indigo-700">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                <i className="fas fa-calendar-star"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Sunday Mega Protocol</h3>
                <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest mt-1">Active Now</p>
              </div>
            </div>
         </div>
      )}

      {prevMonthData ? (
        <div className="bg-white rounded-[3rem] p-8 border-4 border-slate-100 shadow-lg">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Month {prevMonthData.month} Topics</h3>
             <span className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest">{revisionTopics.length} Items</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revisionTopics.map((item, idx) => (
                <div key={idx} className="p-6 rounded-[2rem] border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all group">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">{item.subject}</div>
                   <div className="font-bold text-slate-800 leading-tight">{item.topic}</div>
                   <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Revise Now</span>
                      <i className="fas fa-arrow-right text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all"></i>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-slate-50 rounded-[3rem] border-dashed border-4 border-slate-200">
           <i className="fas fa-wind text-4xl text-slate-300 mb-4 block"></i>
           <p className="text-slate-400 font-black uppercase tracking-widest">No previous month data available for revision yet.</p>
        </div>
      )}
    </div>
  );
};

export default RevisionPage;
