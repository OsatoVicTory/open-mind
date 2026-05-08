"use client";
import { createTest } from '@/app/actions/test';
import { useOpenMind } from '@/hooks/useOpenMind';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MdDeleteSweep, MdAddCircleOutline, MdSave } from 'react-icons/md';

interface Question {
  id: number;
  type: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function TestGenerator({ id } : { id: string }) {

    
      const { userPublicKey } = useOpenMind();
    const [saving, setSaving] = useState(false);
    const [testData, setTestData] = useState<any>({});
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), type: 'Multiple Choice', text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const router = useRouter();

  // --- Handlers ---
  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now(), 
      type: 'Multiple Choice', 
      text: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }]);
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: number, oIdx: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIdx] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const initTest = () => {
    // ${courseIndex}_x_${course.courseName}_x_${course.testId}`)
    const [cI, courseName, testId] = id.split("_x_");
    const course_index = Number(cI);
    setTestData({ courseIndex: course_index, courseName, testId });
  };

  useEffect(() => {
    initTest();
  }, [id]);

  const handleSave = async () => {
    if(saving) return;
    try {
        if(!userPublicKey) return;
        const addy = userPublicKey.toString();
        setSaving(true);
        const t = await createTest({
            courseName: testData.courseName,
            testId: testData.testId,
            questions,
        });
        setSaving(false);
        router.push(`/courses/${addy}_x_${testData.courseIndex}`);
        console.log(t);
    } catch (err) {
        setSaving(false);
        console.log(err);
    }
    
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-10 text-slate-300">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Test Generator</h1>
            <p className="text-slate-500 font-medium">Configure your exam structure and question logic</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <MdSave className="w-5 h-5" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Dynamic Question List */}
        <div className="space-y-10">
          {questions.map((q, idx) => (
            <div key={q.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Decorative Gradient Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity" />
              
              <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-lg font-semibold text-white">Question Type</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-2 ring-indigo-500 cursor-pointer"
                    >
                        Multiple Choice
                    </span>
                    
                    <button 
                      onClick={() => removeQuestion(q.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove Question"
                    >
                      <MdDeleteSweep className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Question Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Question Text</label>
                    <textarea 
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      className="w-full bg-[#0F172A]/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 focus:ring-0 transition-all outline-none min-h-[100px] placeholder:text-slate-600"
                      placeholder="e.g. What is the complexity of a Binary Search?"
                    />
                  </div>

                  {/* Options Grid (Conditional for Multiple Choice) */}
                  {q.type === 'Multiple Choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="relative group/opt">
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className={`w-full bg-[#0F172A]/50 border border-slate-700 rounded-xl py-3 px-12 text-sm focus:border-indigo-500 outline-none transition-all
                              ${q.correctAnswer === oIdx ? 'ring-1 ring-emerald-500/50 border-emerald-500/50 bg-emerald-500/5' : ''}`}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                             <input 
                               type="radio" 
                               name={`correct-${q.id}`} 
                               checked={q.correctAnswer === oIdx}
                               onChange={() => updateQuestion(q.id, 'correctAnswer', oIdx)}
                               className="w-4 h-4 accent-indigo-500 cursor-pointer" 
                             />
                          </div>
                          {q.correctAnswer === oIdx && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False Placeholder */}
                  {/* {q.type === 'True/False' && (
                    <div className="flex gap-4">
                      {['True', 'False'].map((val, i) => (
                        <button 
                          key={val}
                          onClick={() => updateQuestion(q.id, 'correctAnswer', i)}
                          className={`flex-1 py-3 rounded-xl border font-bold transition-all ${q.correctAnswer === i ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button 
          onClick={addQuestion}
          className="w-full mt-12 py-8 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all font-bold text-lg flex items-center justify-center gap-3 group"
        >
          <MdAddCircleOutline className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Add New Question
        </button>
      </div>
    </div>
  );
}