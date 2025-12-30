
import React, { useState } from 'react';

interface McqTestPortalProps {
  topicName: string;
  topicId: string;
  onFinish: (topicId: string, score: number) => void;
  onCancel: () => void;
}

const McqTestPortal: React.FC<McqTestPortalProps> = ({ topicName, topicId, onFinish, onCancel }) => {
  const [score, setScore] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericScore = parseInt(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      alert("Please enter a valid score between 0 and 100");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => onFinish(topicId, numericScore), 1500);
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-[4rem] shadow-2xl overflow-hidden border-8 border-slate-900">
        <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
           <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6">
             <i className="fas fa-file-signature"></i>
           </div>
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Performance Reporter</p>
           <h3 className="text-2xl font-black uppercase tracking-tight leading-none px-4">{topicName}</h3>
        </div>

        <div className="p-12 text-center">
          {isSubmitting ? (
            <div className="py-10 animate-pulse space-y-6">
               <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-indigo-200">
                 <i className="fas fa-sync fa-spin"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Logging Score...</h3>
            </div>
          ) : (
            <>
               <div className="mb-10">
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">"Finish your 100 MCQs First!"</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">Enter your final percentage score below to update your study dashboard.</p>
               </div>
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative max-w-[200px] mx-auto">
                    <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="0-100" className="w-full text-center text-6xl font-black bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] py-8 px-4 focus:border-indigo-600 outline-none transition-all" autoFocus />
                    <span className="absolute -right-10 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black tracking-widest hover:bg-indigo-700 transition-all uppercase text-xs"><i className="fas fa-check-circle mr-2"></i> Submit Score Report</button>
                    <button type="button" onClick={onCancel} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Later</button>
                  </div>
               </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default McqTestPortal;
