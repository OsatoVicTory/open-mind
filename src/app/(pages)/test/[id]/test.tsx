"use client";
import { getTest } from '@/app/actions/test';
import { getUser, updateUser } from '@/app/actions/user';
import { PageLoader } from '@/components/ui/loading';
import { useOpenMind } from '@/hooks/useOpenMind';
import React, { useState, useEffect } from 'react';
import { MdTimer, MdChevronLeft, MdChevronRight, MdCheckCircle } from 'react-icons/md';

// // 1. Mock Data Structure
// const Questions = [
//   {
//     id: 1,
//     question: "In a custom React hook, which of the following is the most efficient way to ensure a function is not re-created on every render cycle?",
//     options: ['useCallback() hook', 'useMemo() with a function return', 'Defining the function outside the component', 'Using a local variable'],
//     correct: 0
//   },
//   {
//     id: 2,
//     question: "Which hook is used to perform side effects in a functional component?",
//     options: ['useState', 'useContext', 'useEffect', 'useReducer'],
//     correct: 2
//   },
//   // Add more Questions here...
// ];

export default function TestSession({ id } : { id: string }) {

    
    const { userPublicKey } = useOpenMind();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [Questions, setQuestions] = useState<any[]>([]);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(true);
  const [score, setScore] = useState(0);

    const getQuestions = async () => {
        setLoading(true);
        const [instructor, cI, courseName, testId] = id.split("_x_");
        const course_index = Number(cI);
        try {
            const test = await getTest(testId);
            console.log(test);
            setQuestions(test.test.questions);
            setData({ courseName, testId, instructor, courseIndex: course_index });
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }
  useEffect(() => {
    if(id) getQuestions();
  }, [id]);

  // 2. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // 3. Formatting Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

//   console.log("q", Questions);
  const ans = Object.keys(answers) || [];
  const progress = Math.round((ans.length / Questions.length) * 100);

  const handleSubmit = async () => {
    try {
        if(!userPublicKey) return;
        setSubmitting(true);
        console.log(answers, Questions);
        const cor = [...Questions].filter((q:any,id:number) => q.correctAnswer === answers[id]);
        setScore(cor.length);
        console.log(answers, Questions, cor);
        if(cor.length >= 0.7 * Questions.length) {
            
            const userId = userPublicKey.toString();
            const userDb = await getUser(userId);
            console.log("user", userDb.user);
            const userCoursesDb = userDb.user.courses;
            const enrolledCourse = userCoursesDb.find((user_course_: any) => {
                return user_course_.instructor === data.instructor && user_course_.instructorCourseIndex === data.courseIndex;
            });
            let i = 0;
            for(const user_course_ of userCoursesDb) {
                if(user_course_.instructor === data.instructor && user_course_.instructorCourseIndex === data.courseIndex) {
                    userCoursesDb[i].testScore = cor.length;
                    break;
                }
                i++;
            }
            
            const _r = await updateUser(userPublicKey.toString(), { data: { courses: userCoursesDb } });
            setIsSubmitted(true)
        } else {
            alert("Need to score 70%+ to get certificate");
        }
        setSubmitting(false);
    } catch (err) {
        setSubmitting(false);
        console.log(err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center max-w-md w-full shadow-2xl">
          <MdCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Exam Results</h2>
          <p className="text-slate-400 mb-8 text-lg">You scored {score} out of {Questions.length}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    {
        loading ?
        <PageLoader />
        :
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <nav className="h-20 border-b border-slate-800 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">{data.courseName}</h1>
            <span className="text-xs text-slate-500">Certification Exam • {Questions.length} Questions</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-slate-900/50 border-slate-800 text-indigo-100'}`}>
            <MdTimer className={timeLeft < 60 ? 'animate-pulse' : 'text-indigo-400'} />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => setIsSubmitted(true)}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/20 font-semibold transition-all"
          >
            Finish Session
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-12 gap-12">
        {/* Left Column: The Question */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="space-y-2">
            <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Question {currentIdx + 1}</span>
            <h2 className="text-2xl font-medium text-white leading-snug">
              {Questions[currentIdx].text}
            </h2>
          </div>

          <div className="grid gap-4">
            {Questions[currentIdx].options.map((opt: any, i: number) => (
              <button 
                key={i} 
                onClick={() => setAnswers({...answers, [currentIdx]: i})}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                  answers[currentIdx] === i 
                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  answers[currentIdx] === i ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={answers[currentIdx] === i ? 'text-white' : 'text-slate-300'}>{opt}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-8 border-t border-slate-800/50">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <MdChevronLeft className="w-6 h-6" /> Back
            </button>
            
            {currentIdx === Questions.length - 1 ? (
              <button 
                onClick={() => handleSubmit()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-emerald-500/20 transition-all"
              >
                {submitting ? "Submitting..." : "Submit Exam"}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                Next Question <MdChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Progress Grid */}
        <div className="hidden lg:block col-span-4 bg-slate-900/30 rounded-3xl border border-slate-800 p-6 h-fit sticky top-32">
          <h3 className="font-bold text-white mb-6">Question Tracker</h3>
          <div className="grid grid-cols-5 gap-3">
            {Questions.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentIdx(i)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all cursor-pointer
                  ${currentIdx === i ? 'bg-indigo-600 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/40' : 
                    answers[i] !== undefined ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_10px_#6366f1]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
    }
    </>
  );
}