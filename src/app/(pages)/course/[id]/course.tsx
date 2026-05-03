"use client";
import { useOpenMind } from '@/hooks/useOpenMind';
import React, { useEffect, useState } from 'react';
import { 
  MdPlayArrow, 
  MdChevronLeft, 
  MdChevronRight, 
  MdCheckCircle, 
  MdOutlineFileDownload, 
  MdOutlineDescription,
  MdSettings,
  MdFullscreen
} from 'react-icons/md';

const CoursePlayer = ({ id } : { id: string }) => {
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { getProgram, userPublicKey, getProvider, getUserPDA, getCourseMaterialPDA, getInstructorCreatedCoursePDA } = useOpenMind();
    const [course, setCourse] = useState<any>({});
    const [chapters, setChapters] = useState<any[]>([]);
    const [lesson, setLesson] = useState<any>({});

    const getCoursesAndMaterials = async () => {
      setLoading(true);
      try {
        
        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }

        const [instructorAddy, cI, mI] = id.split("_x_");
        const course_index = Number(cI);
        const material_index = Number(mI);
        console.log("ccc", instructorAddy, cI);

        // const userPDA = getUserPDA();
        // const user = await (program.account as any).user.fetch(userPDA);
        
        const instructorCreated = getInstructorCreatedCoursePDA(instructorAddy, course_index);
        const course = await (program.account as any).course.fetch(instructorCreated);
        console.log("course", course);

        const materials = [];
        
        for(let j = 0; j < course.materialCount; j++) {
          const matPDA = getCourseMaterialPDA(course_index, j);
          const material = await (program.account as any).courseMaterial.fetch(matPDA);
          materials.push(material);
          if(j === material_index) setLesson(material);
        }

        const chaptersClone : any[] = [];
        let i = 0;
        for(; i < materials.length; i++) {
          const mat = materials[i];
          const chapter = [];
          let j = 0;
          while(j < materials.length && materials[j].chapter === mat.chapter) {
            chapter.push(materials[j]);
          }
          i = j - 1;
        }
        setChapters(chaptersClone);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(false);
        setLoading(false);
      }
    }
    
    useEffect(() => {
        getCoursesAndMaterials();
    }, []);

  return (
    <>
    {
        loading ?
        <div className='text-black text-xl'>Loading...</div>
        :
        <div className="w-full min-h-screen bg-white flex flex-col text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="w-full h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-[68px] z-50">
        <div className="flex items-center gap-x-4">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors">
            <MdChevronLeft className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-slate-900 font-bold text-sm line-clamp-1">
                {course.courseName}
            </h1>
            <div className="flex items-center gap-x-2 mt-0.5">
               <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-indigo-600" />
               </div>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">35% Complete</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
           <button className="hidden sm:flex items-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
             Leave a Review
           </button>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Left Side: Video & Details */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30">
          {/* Video Player Placeholder - Keep black for the actual video content */}
          <div className="relative aspect-video bg-black w-full shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center group cursor-pointer">
              <div className="w-20 h-20 bg-indigo-600/90 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <MdPlayArrow className="w-12 h-12" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-x-4 text-white">
                <MdPlayArrow className="w-6 h-6" />
                <div className="text-xs font-mono">12:45 / 24:00</div>
              </div>
              <div className="flex items-center gap-x-4 text-white">
                <MdSettings className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer" />
                <MdFullscreen className="w-6 h-6 opacity-70 hover:opacity-100 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 bg-white">
            <div className="flex border-b border-slate-100 mb-6 overflow-x-auto">
              {['Overview', 'Notes', 'Resources', 'Reviews'].map((tab) => (
                <button 
                  key={tab}
                  className={`px-6 py-3 text-sm font-bold transition-all capitalize border-b-2 whitespace-nowrap
                  ${tab.toLowerCase() === 'overview' ? "text-indigo-600 border-indigo-600" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="max-w-4xl space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Lesson Title</h2>
              <p className="text-slate-600 leading-relaxed">
                {course.courseDescription}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-x-4 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MdOutlineFileDownload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">Project_Files.zip</p>
                    <p className="text-slate-500 text-xs font-medium">12.4 MB • Source Code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Side: Curriculum Sidebar */}
        <aside className="w-full lg:w-[400px] bg-white border-l border-slate-200 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === 'content' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-500 hover:text-slate-900"}`}
            >
              Course Content
            </button>
            {/* <button 
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === 'qa' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-500 hover:text-slate-900"}`}
            >
              Q&A
            </button> */}
          </div>

          {/* Curriculum List */}
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapterMaterial, idx) => (
              <div key={`chapter-course-${idx}`} className="border-b border-slate-100">
                <div className="px-5 py-4 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-tight">
                    {chapterMaterial[0].chapter}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">4 / 6</span>
                </div>
                
                <div className="flex flex-col">
                  {chapterMaterial.map((material: any, index: number) => {
                    const isCurrent = material === 1 && idx === 1;
                    return (
                      <button 
                        key={`material-course-${index}`}
                        className={`group flex items-start gap-x-3 px-5 py-4 text-left transition-all hover:bg-slate-50
                        ${isCurrent ? "bg-indigo-50 border-l-4 border-indigo-600" : "border-l-4 border-transparent"}`}
                      >
                        <div className="mt-1">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold line-clamp-2 ${isCurrent ? "text-indigo-700" : "text-slate-700"}`}>
                            {material.materialTitle}
                          </p>
                          <div className="flex items-center gap-x-2 mt-1">
                            <MdOutlineDescription className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-bold">Video • 12:45 mins</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom "Next Lesson" Button */}
          {/* <div className="p-4 bg-white border-t border-slate-200">
             <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-x-2 transition-transform active:scale-95 shadow-lg shadow-slate-200">
               Next Lesson <MdChevronRight className="w-5 h-5" />
             </button>
          </div> */}
        </aside>
      </div>
    </div>
    }
    </>
  );
};

export default CoursePlayer;