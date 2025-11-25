import React, { useMemo } from 'react';
import { Check, Clock, Pill } from 'lucide-react';
import { Medication, IntakeRecord } from '../types';

interface MedicationListProps {
  medications: Medication[];
  intakeRecords: IntakeRecord[];
  onTakeMedication: (medId: string, time: string) => void;
}

const MedicationList: React.FC<MedicationListProps> = ({ medications, intakeRecords, onTakeMedication }) => {
  
  const todayStr = new Date().toISOString().split('T')[0];

  // Flatten medications into scheduled instances
  const scheduledItems = useMemo(() => {
    const items: { med: Medication; time: string; taken: boolean }[] = [];
    
    medications.forEach(med => {
      med.times.forEach(time => {
        const isTaken = intakeRecords.some(
          r => r.medicationId === med.id && r.scheduledTime === time && r.takenAt.startsWith(todayStr)
        );
        items.push({ med, time, taken: isTaken });
      });
    });

    // Sort by time
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, intakeRecords, todayStr]);

  if (scheduledItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <Pill size={48} className="mb-4 opacity-20" />
        <p>ไม่มีรายการยาสำหรับวันนี้</p>
        <p className="text-sm">กดปุ่ม "เพิ่มยา" เพื่อเริ่มต้น</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {scheduledItems.map((item, index) => (
        <div 
          key={`${item.med.id}-${item.time}-${index}`}
          className={`relative flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all ${item.taken ? 'opacity-60 grayscale' : 'hover:shadow-md dark:hover:bg-slate-750'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-sm`} style={{ backgroundColor: item.med.color }}>
            {item.med.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">
              <Clock size={14} className="mr-1" />
              {item.time}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.med.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{item.med.dosage} • {item.med.instructions}</p>
          </div>

          <button
            onClick={() => !item.taken && onTakeMedication(item.med.id, item.time)}
            disabled={item.taken}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              item.taken 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
          >
            <Check size={20} strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MedicationList;