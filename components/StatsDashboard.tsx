import React, { useMemo } from 'react';
import { ClassSyllabus, UserProgress, ClassLevel } from '../types';

interface StatsDashboardProps {
  syllabus: ClassSyllabus;
  progress: UserProgress;
  onChangeMonth: (month: number) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ syllabus, progress, onChangeMonth }) => {
  const stats = useMemo(() => {
    let totalTopics = 0;
    let completed = 0;
    let locked = 0;
    let notStudied = 0;
    let uncleared = 0;

    const unclearedList: { subject: string; topic: string; month: number }[] = [];
    const monthStats: { month: number; status: 'locked' | 'active' | 'completed'; done: number; total: number }[] = [];

    syllabus.months.forEach((month, idx) => {
      let mTotal = 0;
      let mDone = 0;
      const isLocked = month.month > progress.currentMonth;

      month.content.forEach(sub => {
        sub.topics.forEach(t => {
          mTotal++;
          const topicId = `${syllabus.classLevel}_m${idx}_${sub.subjectName}_${t.name}`;
          
          if (progress.completedTopics.includes(topicId)) {
            mDone++;
          }
          
          if (progress.weakTopics.includes(topicId)) {
            uncleared++;
            unclearedList.push({ subject: sub.subjectName, topic: t.name, month: month.month });
          }
        });
      });

      monthStats.push({
        month: month.month,
        status: isLocked ? 'locked' : (mDone === mTotal && mTotal > 0 ? 'completed' : 'active'),
        done: mDone,
        total: mTotal
      });

      totalTopics += mTotal;
      completed += mDone;
      if (isLocked) locked += mTotal;
      else notStudied += (mTotal - mDone);
    });

    return { totalTopics, completed, locked, notStudied, uncleared, unclearedList, monthStats };
  }, [syllabus, progress]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border-2 border-green-100 shadow-sm">
          <div className="text-3xl font-black text-green-600 mb-1">{stats.completed}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-red-100 shadow-sm">
          <div className="text-3xl font-black text-red-600 mb-1">{stats.notStudied}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Not Read</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <div className="text-3xl font-black text-slate-600 mb-1">{stats.locked}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-amber-100 shadow-sm">
          <div className="text-3xl font-black text-amber-600 mb-1">{stats.uncleared}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uncleared</div>
        </div>
      </div>

      {/* Uncleared Topics List */}
      {stats.unclearedList.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 border-4 border-amber-100 shadow-lg">
          <h3 className="text-xl font-black text-amber-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i> Needs Attention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.unclearedList.map((item, i) => (
              <div key={i} className="p-4 bg-amber-50 rounded-2xl flex items-center justify-between border border-amber-100">
                <div>
                  <div className="text-xs font-black text-amber-800/60 uppercase tracking-wider mb-1">{item.subject} • M-{item.month}</div>
                  <div className="text-sm font-black text-slate-900">{item.topic}</div>
                </div>
                <i className="fas fa-refresh text-amber-500"></i>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Progress Grid */}
      <div className="bg-white rounded-[3rem] p-8 border-4 border-slate-100 shadow-xl">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Monthly Roadmap</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.monthStats.map((m) => (
            <button
              key={m.month}
              onClick={() => onChangeMonth(m.month)}
              className={`p-6 rounded-[2rem] text-left transition-all border-2 relative overflow-hidden group ${
                m.status === 'locked' 
                  ? 'bg-slate-50 border-slate-100 text-slate-400 opacity-60' 
                  : m.status === 'completed'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-white border-indigo-100 hover:border-indigo-500 hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Month {m.month}</span>
                {m.status === 'locked' && <i className="fas fa-lock opacity-40"></i>}
                {m.status === 'completed' && <i className="fas fa-check-circle text-green-500"></i>}
              </div>
              <div className="relative pt-2">
                <div className="text-3xl font-black mb-1">
                  {Math.round((m.done / (m.total || 1)) * 100)}%
                </div>
                <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${m.status === 'completed' ? 'bg-green-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${(m.done / (m.total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
