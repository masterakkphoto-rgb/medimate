import React, { useState, useEffect } from 'react';
import { Activity, Brain, Calendar, Moon, Sun } from 'lucide-react';
import { Medication, IntakeRecord } from './types';
import MedicationList from './components/MedicationList';
import AddMedication from './components/AddMedication';
import BottomNav from './components/BottomNav';
import { getHealthTip } from './services/geminiService';

const App: React.FC = () => {
  // Application State
  const [activeTab, setActiveTab] = useState('home');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [dailyTip, setDailyTip] = useState<string>('');
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    const savedRecords = localStorage.getItem('intakeRecords');
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedRecords) setIntakeRecords(JSON.parse(savedRecords));

    // Fetch AI Tip
    const fetchTip = async () => {
       if (process.env.API_KEY) {
         const tip = await getHealthTip();
         setDailyTip(tip);
       }
    };
    fetchTip();
  }, []);

  // Save data when changed
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
    localStorage.setItem('intakeRecords', JSON.stringify(intakeRecords));
  }, [medications, intakeRecords]);

  const handleAddMedication = (med: Medication) => {
    setMedications([...medications, med]);
    setActiveTab('home');
  };

  const handleTakeMedication = (medId: string, scheduledTime: string) => {
    const newRecord: IntakeRecord = {
      id: Date.now().toString(),
      medicationId: medId,
      takenAt: new Date().toISOString(),
      status: 'taken',
      scheduledTime
    };
    setIntakeRecords([...intakeRecords, newRecord]);
  };

  // Calculate stats for History tab
  const stats = React.useMemo(() => {
    const totalTaken = intakeRecords.length;
    // Very basic adherence calc
    const uniqueDays = new Set(intakeRecords.map(r => r.takenAt.split('T')[0])).size;
    return { totalTaken, uniqueDays };
  }, [intakeRecords]);

  // --- Render Views ---

  const renderHeader = () => (
    <header className="bg-white dark:bg-slate-800 px-6 pt-8 pb-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="text-blue-600" /> MediMate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            {medications.length}
          </div>
        </div>
      </div>
      {dailyTip && activeTab === 'home' && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg text-sm flex gap-3 items-start">
          <Brain className="shrink-0 mt-1" size={18} />
          <div>
            <p className="font-bold opacity-90 text-xs uppercase tracking-wider mb-1">AI Health Tip</p>
            <p className="font-medium leading-relaxed">{dailyTip}</p>
          </div>
        </div>
      )}
    </header>
  );

  const renderHome = () => (
    <div className="px-4 py-6 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">ตารางยาของคุณ</h2>
      </div>
      <MedicationList 
        medications={medications} 
        intakeRecords={intakeRecords}
        onTakeMedication={handleTakeMedication}
      />
    </div>
  );

  const renderHistory = () => (
    <div className="px-6 py-8 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">ประวัติการกินยา</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-slate-700 transition-colors">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.totalTaken}</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">ครั้งที่กินยาแล้ว</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-slate-700 transition-colors">
          <div className="text-4xl font-bold text-green-500 dark:text-green-400 mb-1">{stats.uniqueDays}</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">วันที่ใช้งาน</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Calendar size={18} /> รายการล่าสุด
      </h3>
      <div className="space-y-3 pb-24">
        {[...intakeRecords].reverse().slice(0, 10).map(record => {
          const med = medications.find(m => m.id === record.medicationId);
          if (!med) return null;
          return (
            <div key={record.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
              <div>
                <div className="font-bold text-slate-700 dark:text-slate-200">{med.name}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(record.takenAt).toLocaleDateString('th-TH')} • {new Date(record.takenAt).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-md font-bold">
                เรียบร้อย
              </div>
            </div>
          );
        })}
        {intakeRecords.length === 0 && (
           <p className="text-slate-400 text-center py-10">ยังไม่มีประวัติ</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900 min-h-screen shadow-2xl overflow-hidden relative transition-colors">
      {activeTab !== 'add' && renderHeader()}
      
      <main className="relative z-0">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'add' && <AddMedication onAdd={handleAddMedication} onCancel={() => setActiveTab('home')} />}
        {activeTab === 'history' && renderHistory()}
      </main>

      {activeTab !== 'add' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

export default App;