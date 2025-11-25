import React, { useState } from 'react';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { Medication, FrequencyType, AIParseResult } from '../types';
import { parseMedicationInput } from '../services/geminiService';

interface AddMedicationProps {
  onAdd: (med: Medication) => void;
  onCancel: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AddMedication: React.FC<AddMedicationProps> = ({ onAdd, onCancel }) => {
  const [isAiMode, setIsAiMode] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const result = await parseMedicationInput(aiInput);
      setName(result.name);
      setDosage(result.dosage);
      setInstructions(result.instructions);
      if (result.times && result.times.length > 0) {
        setTimes(result.times);
      }
      setIsAiMode(false); // Switch to manual view to confirm
    } catch (error) {
      alert("ขออภัย ไม่สามารถแปลข้อมูลได้ กรุณาลองใหม่หรือกรอกเอง");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newMed: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
      instructions,
      frequency: FrequencyType.DAILY,
      times,
      color: selectedColor,
      icon: 'pill'
    };
    onAdd(newMed);
  };

  const addTimeSlot = () => setTimes([...times, '08:00']);
  const removeTimeSlot = (idx: number) => setTimes(times.filter((_, i) => i !== idx));
  const updateTimeSlot = (idx: number, val: string) => {
    const newTimes = [...times];
    newTimes[idx] = val;
    setTimes(newTimes);
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-full pb-24 transition-colors">
      <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">เพิ่มยาใหม่</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* AI Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg transition-colors">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${isAiMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            onClick={() => setIsAiMode(true)}
          >
            <Sparkles size={16} /> ใช้ AI ช่วย
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isAiMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            onClick={() => setIsAiMode(false)}
          >
            กรอกเอง
          </button>
        </div>

        {isAiMode ? (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2 font-medium">พิมพ์หรือพูดสิ่งที่คุณต้องการ เช่น:</p>
              <p className="text-blue-600 dark:text-blue-300 text-xs italic">"ยาพารา 2 เม็ด หลังอาหารเช้าและเย็น"</p>
              <p className="text-blue-600 dark:text-blue-300 text-xs italic mt-1">"Amoxicillin 500mg 3 times a day"</p>
            </div>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 dark:text-slate-100 min-h-[150px] transition-colors placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="พิมพ์รายละเอียดการกินยาที่นี่..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button
              onClick={handleAiParse}
              disabled={loading || !aiInput}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              วิเคราะห์ข้อมูล
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อยา</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="เช่น Paracetamol"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ปริมาณ</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-colors"
                  placeholder="เช่น 1 เม็ด"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">สีประจำยา</label>
                <div className="flex gap-2 mt-2">
                  {COLORS.slice(0,4).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">คำแนะนำเพิ่มเติม</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-colors"
                placeholder="เช่น หลังอาหารทันที"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">เวลาที่ต้องกิน</label>
                <button type="button" onClick={addTimeSlot} className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center">
                  <Plus size={14} className="mr-1" /> เพิ่มเวลา
                </button>
              </div>
              <div className="space-y-2">
                {times.map((time, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot(idx, e.target.value)}
                      className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none text-center font-mono text-lg transition-colors"
                    />
                    {times.length > 1 && (
                      <button type="button" onClick={() => removeTimeSlot(idx)} className="text-red-400 hover:text-red-600 p-2">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mt-8 active:scale-95 transition-transform"
            >
              บันทึกยา
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMedication;