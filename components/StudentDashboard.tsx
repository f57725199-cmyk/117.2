
import React, { useMemo, useState, useEffect } from 'react';
import { ClassSyllabus, UserProgress, MonthSyllabus } from '../types';
import MonthSelector from './MonthSelector';

interface StudentDashboardProps {
  syllabus: ClassSyllabus;
  progress: UserProgress;
  onToggleTopic: (monthIdx: number, subject: string, topic: string) => void;
  onToggleDailyTask: (task: keyof UserProgress['dailyTasks'], value?: any) => void;
  onChangeMonth: (month: number) => void;
  onStartMcq: (id: string, name: string) => void;
  onSkipDay: () => void;
}

const FESTIVALS: Record<string, string> = {
  '01-01': 'New Year Day',
  '01-14': 'Makar Sankranti',
  '01-26': 'Republic Day',
  '03-08': 'Holi',
  '04-09': 'Eid-ul-Fitr',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '10-24': 'Vijayadashami',
  '11-12': 'Diwali',
  '12-25': 'Christmas'
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ syllabus, progress, onToggleTopic, onToggleDailyTask, onChangeMonth, onStartMcq, onSkipDay }) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate() % 31 || 1);
  const [showPrevMonthList, setShowPrevMonthList] = useState(false);
  const [currentFestival, setCurrentFestival] = useState<string | null>(null);
  
  const currentMonthIdx = progress.currentMonth - 1;
  const currentMonthData = syllabus.months[currentMonthIdx];
  const prevMonthData = currentMonthIdx > 0 ? syllabus.months[currentMonthIdx - 1] : null;

  const isTodaySunday = new Date().getDay() === 0;

  useEffect(() => {
    const today = new Date();
    const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (FESTIVALS[key]) {
      setCurrentFestival(FESTIVALS[key]);
    }
  }, []);
  
  const dayTask = currentMonthData.dailySchedule?.find(d => d.day === selectedDay);
  const monthSkips = progress.skippedDaysCount[progress.currentMonth] || 0;

  const getSubjectLightColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    if (s.includes('science') || s.includes('physics') || s.includes('chem') || s.includes('bio')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s.includes('sst') || s.includes('social')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s.includes('revision')) return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div className="space-y-10">
      {/* Festival Banner */}
      {currentFestival && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden animate-pulse border-8 border-amber-400/30">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                 <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Happy {currentFestival}! ✨</h2>
                 <p className="text-amber-100 font-bold uppercase tracking-widest text-xs">A special day for celebration and joy.</p>
                 <p className="text-white font-black mt-4 text-lg italic">"You can skip today, student, and enjoy!"</p>
              </div>
              <button 
                onClick={onSkipDay}
                disabled={monthSkips >= 5}
                className="bg-white text-orange-600 px-10 py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Claim Festive Holiday
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-6 bg-slate-900 text-white rounded-[3rem] mb-8 shadow-xl border-4 border-indigo-900">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-50">Authorized Portal Node</span>
        <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">
          {progress.board} - CLASS {syllabus.classLevel}
        </h2>
      </div>

      <MonthSelector syllabus={syllabus} progress={progress} onChangeMonth={onChangeMonth} />

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border-4 border-slate-100 shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Daily Protocol</h3>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                     Day {selectedDay} Target • {isTodaySunday ? 'Sunday Mega Revision' : '6 Hours Study'}
                   </p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => onToggleDailyTask('studyDone')}
                     className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${progress.dailyTasks.studyDone ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                   >
                     Report {progress.dailyTasks.studyDone ? 'Done ✓' : 'Study'}
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-10">
               {Array.from({ length: 30 }).map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setSelectedDay(i + 1)}
                   className={`aspect-square rounded-xl font-black text-xs transition-all border-2 ${
                     selectedDay === i + 1 
                       ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-110' 
                       : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                   }`}
                 >
                   {i + 1}
                 </button>
               ))}
             </div>

             {isTodaySunday && selectedDay === new Date().getDate() ? (
                <div className="bg-rose-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-10">
                      <i className="fas fa-calendar-check text-9xl"></i>
                   </div>
                   <h4 className="text-4xl font-black tracking-tighter uppercase mb-6">Sunday Mega Revision Protocol</h4>
                   <p className="text-rose-100 font-bold text-lg mb-10 leading-relaxed uppercase tracking-tight">
                     Today is Sunday. No new topics allowed. Strictly revise the previous week and clarify your doubts from M-1 subjects.
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                         <span className="text-[10px] font-black uppercase opacity-60">Session 1</span>
                         <h5 className="text-xl font-black mt-1">Full Weekly Recap</h5>
                      </div>
                      <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                         <span className="text-[10px] font-black uppercase opacity-60">Session 2</span>
                         <h5 className="text-xl font-black mt-1">M-1 Subject Deep Dive</h5>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {dayTask?.tasks.map((task, idx) => {
                     const isComp = progress.completedTopics.includes(`${syllabus.classLevel}_m${progress.currentMonth - 1}_${task.subject}_${task.topic}`);
                     return (
                       <div 
                         key={idx} 
                         onClick={() => onToggleTopic(progress.currentMonth - 1, task.subject, task.topic)}
                         className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all hover:scale-105 ${getSubjectLightColor(task.subject)} shadow-sm relative group`}
                       >
                         {isComp && (
                           <div className="absolute top-4 right-4 text-green-600 text-xl">
                             <i className="fas fa-check-circle"></i>
                           </div>
                         )}
                         <div className="flex justify-between mb-4">
                           <span className="w-10 h-10 rounded-2xl bg-white shadow-inner flex items-center justify-center text-xl">
                             {task.subject.toLowerCase().includes('math') ? '📐' : task.subject.toLowerCase().includes('revision') ? '🔄' : '🔬'}
                           </span>
                           <span className="text-[10px] font-black uppercase opacity-60">Session {idx + 1}</span>
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{task.subject}</h4>
                         <p className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                           {task.topic}
                         </p>
                         <div className="pt-4 border-t border-current border-opacity-10 font-black text-lg">
                           {task.hours} Hours {task.subject.toLowerCase().includes('math') ? 'Revision' : 'Study'}
                         </div>
                       </div>
                     );
                   })}
                </div>
             )}

             {prevMonthData && (
                <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">M-{prevMonthData.month} Legacy Revision</h4>
                    <button 
                      onClick={() => setShowPrevMonthList(!showPrevMonthList)}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                    >
                      {showPrevMonthList ? 'Hide List' : 'View Topics'}
                    </button>
                  </div>
                  {showPrevMonthList && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {prevMonthData.content.map(sub => 
                        sub.topics.map((t, tidx) => (
                          <div key={tidx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">{t.name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">{sub.subjectName}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <i className="fas fa-repeat text-8xl"></i>
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
               <i className="fas fa-calendar-check"></i> Strategy
             </h3>
             
             <div className="space-y-4">
                <button 
                  onClick={() => onToggleDailyTask('revisionDone')}
                  className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${progress.dailyTasks.revisionDone ? 'bg-white text-indigo-600 border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                >
                   <div className="text-left">
                      <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Saturday Ritual</span>
                      <span className="text-sm font-black uppercase">Weekly Revision (Current + M-1)</span>
                   </div>
                   {progress.dailyTasks.revisionDone ? <i className="fas fa-check-circle text-xl"></i> : <i className="fas fa-circle-play opacity-40"></i>}
                </button>

                <button 
                  onClick={() => onToggleDailyTask('mcqDone')}
                  className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${progress.dailyTasks.mcqDone ? 'bg-white text-indigo-600 border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                >
                   <div className="text-left">
                      <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Sunday Challenge</span>
                      <span className="text-sm font-black uppercase">Mega Revision Protocol</span>
                   </div>
                   {progress.dailyTasks.mcqDone ? <i className="fas fa-trophy text-xl text-amber-500"></i> : <i className="fas fa-circle-play opacity-40"></i>}
                </button>
             </div>

             <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <div className="text-xs font-black italic tracking-widest uppercase opacity-40">M(N) tests M(N-1) Protocol Active</div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border-4 border-slate-100 shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skip Tokens</span>
                <span className="text-red-600 font-black text-xs">{5 - monthSkips} Left</span>
             </div>
             <div className="flex gap-2 mb-8">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${i <= monthSkips ? 'bg-red-500' : 'bg-slate-100'}`}></div>
                ))}
             </div>
             <button 
               onClick={onSkipDay}
               disabled={monthSkips >= 5}
               className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all disabled:opacity-20 shadow-lg active:scale-95"
             >
               Skip Study Today
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
