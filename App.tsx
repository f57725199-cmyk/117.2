
import React, { useState, useEffect, useMemo } from 'react';
import { ClassLevel, ClassSyllabus, UserProgress, BoardType } from './types';
import { INITIAL_SYLLABUS_DATA } from './constants';
import StudentDashboard from './components/StudentDashboard';
import RevisionPage from './components/RevisionPage';
import McqPage from './components/McqPage';
import StatsDashboard from './components/StatsDashboard';
import McqTestPortal from './components/McqTestPortal';
import { db, saveUserProgress, getUserProgress } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routine' | 'revision' | 'mcq' | 'dashboard'>('routine');
  const [syllabusData] = useState<Record<ClassLevel, ClassSyllabus>>(INITIAL_SYLLABUS_DATA);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(ClassLevel.CLASS_10);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [loginStep, setLoginStep] = useState<'auth' | 'class'>('auth');
  const [authInput, setAuthInput] = useState('');
  
  const [activeMcqTopic, setActiveMcqTopic] = useState<{id: string, name: string} | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState<{id: string, name: string} | null>(null);

  const [userProgress, setUserProgress] = useState<UserProgress>({
    loginId: '',
    loginMethod: 'email',
    board: 'CBSE',
    completedTopics: [],
    testedTopics: [],
    currentMonth: 1,
    selectedClass: ClassLevel.CLASS_10,
    mcqResults: [],
    weakTopics: [],
    skippedDaysCount: {},
    dailyTasks: {
      lastReset: new Date().toISOString().split('T')[0],
      studyDone: false,
      revisionDone: false,
      saturdayRevisionDone: false,
      sundayMcqCount: 0,
      mcqDone: false
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedUid = localStorage.getItem('syllabusMaster_uid');
    if (savedUid) {
      setUserId(savedUid);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    const docRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as UserProgress;
        setUserProgress(prev => ({ ...prev, ...cloudData }));
        if (cloudData.selectedClass) setSelectedClass(cloudData.selectedClass);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase sync error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = authInput.trim().toLowerCase();
    if (!id || id.length < 3) return alert("Please enter Email, Phone, or UID");

    setIsLoading(true);
    const existing = await getUserProgress(id);
    
    if (existing) {
      setUserId(id);
      localStorage.setItem('syllabusMaster_uid', id);
    } else {
      setLoginStep('class');
      setIsLoading(false);
    }
  };

  const handleFinalRegistration = (level: ClassLevel) => {
    const method = authInput.includes('@') ? 'email' : /^\d+$/.test(authInput) ? 'phone' : 'id';
    const newProfile: UserProgress = {
      ...userProgress,
      loginId: authInput,
      loginMethod: method as any,
      selectedClass: level,
      board: 'CBSE'
    };
    
    setUserId(authInput.toLowerCase());
    localStorage.setItem('syllabusMaster_uid', authInput.toLowerCase());
    setSelectedClass(level);
    setUserProgress(newProfile);
    triggerSync(newProfile, authInput.toLowerCase());
  };

  const handleLogout = () => {
    if (confirm("Logout? Your progress is saved in the cloud.")) {
      localStorage.removeItem('syllabusMaster_uid');
      window.location.reload();
    }
  };

  const toggleBoard = () => {
    const newBoard: BoardType = userProgress.board === 'CBSE' ? 'BSEB' : 'CBSE';
    const updated = { ...userProgress, board: newBoard };
    setUserProgress(updated);
    triggerSync(updated);
  };

  const triggerSync = async (newData: UserProgress, targetId?: string) => {
    const id = targetId || userId;
    if (!id) return;
    setIsSyncing(true);
    try {
      await saveUserProgress(id, newData);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTopicToggle = (monthIndex: number, subjectName: string, topicName: string) => {
    const topicId = `${selectedClass}_m${monthIndex}_${subjectName}_${topicName}`;
    const isCompleted = userProgress.completedTopics.includes(topicId);
    const updatedProgress = {
      ...userProgress,
      completedTopics: isCompleted 
        ? userProgress.completedTopics.filter(id => id !== topicId) 
        : [...userProgress.completedTopics, topicId]
    };
    const isMath = subjectName.toLowerCase().includes('math');
    if (!isCompleted && !isMath) {
      setShowChallengeModal({ id: topicId, name: topicName });
    }
    setUserProgress(updatedProgress);
    triggerSync(updatedProgress);
  };

  const handleMcqFinish = (topicId: string, score: number) => {
    const newResults = [...userProgress.mcqResults, { score, date: new Date().toISOString(), topicId }];
    const updatedProgress = {
      ...userProgress,
      mcqResults: newResults,
      weakTopics: score < 60 ? [...new Set([...userProgress.weakTopics, topicId])] : userProgress.weakTopics.filter(id => id !== topicId),
      testedTopics: [...new Set([...userProgress.testedTopics, topicId])]
    };
    setUserProgress(updatedProgress);
    triggerSync(updatedProgress);
    setActiveMcqTopic(null);
  };

  const currentClassSyllabus = useMemo(() => syllabusData[selectedClass], [syllabusData, selectedClass]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl shadow-2xl animate-bounce mb-8">
          <i className="fas fa-cloud-bolt"></i>
        </div>
        <h2 className="text-white font-black text-2xl tracking-[0.2em] uppercase">Cloud Sync...</h2>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          {loginStep === 'auth' ? (
            <div className="bg-white rounded-[4rem] p-12 text-center border-8 border-slate-900 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8">
                <i className="fas fa-user-circle"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">WorkIsh</h2>
              <p className="text-slate-500 font-medium mb-10 text-sm italic">Professional Learning Platform</p>
              
              <form onSubmit={handleAuthSubmit} className="space-y-6">
                <input 
                  type="text" 
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="ID / Email / Mobile"
                  className="w-full bg-slate-50 border-4 border-slate-100 rounded-[2rem] px-8 py-5 focus:border-indigo-600 focus:bg-white outline-none font-black transition-all text-center placeholder:opacity-50"
                  required
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 text-xs">
                  Access Portal
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] p-12 text-center border-8 border-indigo-600 shadow-2xl">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Select Class</h2>
              <div className="grid grid-cols-2 gap-4">
                {[ClassLevel.CLASS_9, ClassLevel.CLASS_10, ClassLevel.CLASS_11, ClassLevel.CLASS_12].map(level => (
                  <button key={level} onClick={() => handleFinalRegistration(level)} className="p-8 rounded-[2.5rem] bg-slate-50 border-4 border-slate-100 hover:border-indigo-600 hover:bg-white transition-all group">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 group-hover:text-indigo-400">CLASS</span>
                    <span className="text-4xl font-black text-slate-900 group-hover:text-indigo-600">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {showProfile && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
           <div className="bg-white rounded-[4rem] p-12 max-w-lg w-full border-8 border-slate-900 text-center relative">
              <button onClick={() => setShowProfile(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 text-2xl"><i className="fas fa-times-circle"></i></button>
              <h3 className="text-3xl font-black text-slate-900 uppercase mb-8">Student Profile</h3>
              <div className="space-y-4 text-left">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">User Identity</span>
                    <span className="text-lg font-black">{userProgress.loginId}</span>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Board Focus</span>
                    <span className="text-lg font-black text-indigo-600 uppercase">{userProgress.board} Mode</span>
                 </div>
              </div>
              <button onClick={handleLogout} className="mt-10 w-full py-5 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all">Logout Account</button>
           </div>
        </div>
      )}

      {showChallengeModal && <McqTestPortal topicName={showChallengeModal.name} topicId={showChallengeModal.id} onFinish={handleMcqFinish} onCancel={() => setShowChallengeModal(null)} />}
      {activeMcqTopic && <McqTestPortal topicName={activeMcqTopic.name} topicId={activeMcqTopic.id} onFinish={handleMcqFinish} onCancel={() => setActiveMcqTopic(null)} />}

      <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-50 px-6 lg:px-12 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl rotate-3 shadow-lg">W</div>
          <div className="hidden sm:block">
            <h1 className="font-black text-slate-900 text-xl uppercase leading-none tracking-tighter">WorkIsh</h1>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <div className="text-slate-900 font-black text-xs tabular-nums tracking-widest">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
           <div className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-0.5">
             {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center">
              <button 
                onClick={toggleBoard}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${userProgress.board === 'CBSE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                CBSE
              </button>
              <button 
                onClick={toggleBoard}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${userProgress.board === 'BSEB' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                BSEB
              </button>
           </div>

           <button onClick={() => setShowProfile(true)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all">
             <i className="fas fa-user"></i>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-10 mb-20 md:mb-0">
        <div className="max-w-[1500px] mx-auto">
          {activeTab === 'routine' && <StudentDashboard syllabus={currentClassSyllabus} progress={userProgress} onToggleTopic={handleTopicToggle} onToggleDailyTask={(t,v) => { const updated = {...userProgress, dailyTasks: {...userProgress.dailyTasks, [t]: v ?? !userProgress.dailyTasks[t as keyof typeof userProgress.dailyTasks]}}; setUserProgress(updated); triggerSync(updated); }} onChangeMonth={(m) => { const updated = {...userProgress, currentMonth: m}; setUserProgress(updated); triggerSync(updated); }} onStartMcq={(id, name) => setActiveMcqTopic({id, name})} onSkipDay={() => { if ((userProgress.skippedDaysCount[userProgress.currentMonth] || 0) < 5) { const updated = { ...userProgress, skippedDaysCount: { ...userProgress.skippedDaysCount, [userProgress.currentMonth]: (userProgress.skippedDaysCount[userProgress.currentMonth] || 0) + 1 }, dailyTasks: { ...userProgress.dailyTasks, studyDone: true } }; setUserProgress(updated); triggerSync(updated); } else { alert("Max 5 skips!"); } }} />}
          {activeTab === 'revision' && <RevisionPage syllabus={currentClassSyllabus} progress={userProgress} onChangeMonth={(m) => { const updated = {...userProgress, currentMonth: m}; setUserProgress(updated); triggerSync(updated); }} />}
          {activeTab === 'mcq' && <McqPage syllabus={currentClassSyllabus} progress={userProgress} onStartMcq={(id, name) => setActiveMcqTopic({id, name})} onChangeMonth={(m) => { const updated = {...userProgress, currentMonth: m}; setUserProgress(updated); triggerSync(updated); }} />}
          {activeTab === 'dashboard' && <StatsDashboard syllabus={currentClassSyllabus} progress={userProgress} onChangeMonth={(m) => { const updated = {...userProgress, currentMonth: m}; setUserProgress(updated); triggerSync(updated); }} />}
        </div>
      </main>

      {/* Bottom Navigation for Mobile / Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
         <div className="flex justify-around items-center p-2 max-w-[1500px] mx-auto">
            <button onClick={() => setActiveTab('routine')} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'routine' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
               <i className="fas fa-calendar-day text-xl mb-1"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">Routine</span>
            </button>
            <button onClick={() => setActiveTab('revision')} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'revision' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
               <i className="fas fa-repeat text-xl mb-1"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">Revision</span>
            </button>
            <button onClick={() => setActiveTab('mcq')} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'mcq' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
               <i className="fas fa-clipboard-check text-xl mb-1"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">MCQ</span>
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
               <i className="fas fa-chart-pie text-xl mb-1"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
            </button>
         </div>
         <div className="bg-slate-900 text-white py-2 text-center">
             <span className="text-[8px] font-black uppercase tracking-[0.3em]">Developed by Nadim Anwar</span>
         </div>
      </div>
    </div>
  );
};

export default App;
