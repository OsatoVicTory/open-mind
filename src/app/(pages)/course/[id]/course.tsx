"use client";
import { getUser, updateUser, updateUserCourseProgress } from '@/app/actions/user';
import { Spinner } from '@/components/ui/loading';
import { useOpenMind } from '@/hooks/useOpenMind';
import { formatDuration, getVideoDuration } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { 
  MdPlayArrow, 
  MdChevronLeft, 
  MdChevronRight, 
  MdCheckCircle, 
  MdOutlineFileDownload, 
  MdOutlineDescription,
  MdSettings,
  MdFullscreen,
  MdPlayCircleOutline,
  MdStar,
  MdPause
} from 'react-icons/md';

const CoursePlayer = ({ id } : { id: string }) => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { getProgram, userPublicKey, getProvider, getUserPDA, getCourseMaterialPDA, getInstructorCreatedCoursePDA } = useOpenMind();
    const [course, setCourse] = useState<any>({});
    const [chapters, setChapters] = useState<any[]>([]);
    const [lesson, setLesson] = useState<any>({});
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [instructor, setInstructor] = useState<string>("");
    const [courseIndex, setCourseIndex] = useState(0);
    const [materialIndex, setMaterialIndex] = useState(0);
    const [watchCount, setWatchCount] = useState(0);
    const [updating, setUpdating] = useState(false);

    // Toggle Play/Pause
    const togglePlay = () => {
      if(updating) return;
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    // Update time state as video plays
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    // Load metadata to get duration
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    // Format seconds to MM:SS
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleFullscreen = () => {
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    };
    

    const getUpdateProgress = async (instructorAddy: string, course_index: number, material_index: number) => {
      try {
        if(!userPublicKey) return null;

        if(updating) return;
        console.log("user");
        setUpdating(true);
        // update watching/progress on course
        const userId = userPublicKey.toString();
        const userDb = await getUser(userId);
        const courses: any[] = userDb.user.courses;
        let index = 0;
        for(const user_course_ of courses) {
          if(user_course_.instructor === instructorAddy && user_course_.instructorCourseIndex === course_index) {
            let cnt = 0;
            if(!user_course_.coveredLessons.includes(material_index)) {
              courses[index].coveredLessons.push(materialIndex);
              const _ = await updateUser(userId, { data: { courses } });
              cnt = 1;
            } 
            setWatchCount(user_course_.coveredLessons.length + cnt);
            break;
          }
          index++;
        };
        setUpdating(false);
      } catch(err) {
        console.log(err);
        setUpdating(false);
      }
    }

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

        setCourseIndex(course_index);
        setMaterialIndex(material_index);
        setInstructor(instructorAddy);
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
          const vidDurationRes: number | string = await getVideoDuration(material.fileUri);
          let duration = "";
          if(typeof vidDurationRes !== "string") {
            duration = formatDuration(vidDurationRes);
          } else {
            duration = "--:--";
          }
          material.duration = duration;
          materials.push(material);
          if(j === material_index) setLesson(material);
        }

        
        const chaptersClone : any[] = [];
        for(let i = 0; i < materials.length; i++) {
          const mat = materials[i];
          const chapter = [];
          let j = i;
          while(j < materials.length && materials[j].chapter === mat.chapter) {
            chapter.push(materials[j]);
            j++;
          }
          chaptersClone.push(chapter);
          i = j - 1;
        }
        
        setCourse(course);
        setChapters(chaptersClone);

        await getUpdateProgress(instructorAddy, course_index, material_index);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(false);
        setLoading(false);
      }
    }

    useEffect(() => {
      if(!instructor || !userPublicKey) return;
      getUpdateProgress(instructor, courseIndex, materialIndex);
    }, [materialIndex, instructor, courseIndex]);
    
    useEffect(() => {
        getCoursesAndMaterials();
    }, [id]);

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    // Calculate percentage for the custom "filled" look
    const progressPercent = (currentTime / duration) * 100 || 0;
    const watchPercent = Math.floor(watchCount / (course?.materialCount || 1)) * 100;

    const nextLesson = () => {
      if(!instructor) return null;
      if(materialIndex + 1 >= course.materialCount) return router.push(`/test/${instructor}_x_${courseIndex}_x_${course.courseName}_x_${course.testId}`);
      router.push(`/course/${instructor}_x_${courseIndex}_x_${materialIndex + 1}`);
    };
    
    const prevLesson = () => {
      if(!instructor || materialIndex - 1 < 0) return null;
      router.push(`/course/${instructor}_x_${courseIndex}_x_${materialIndex - 1}`);
    };

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
          <button className="p-2 hover:bg-slate-100 cursor-pointer rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          onClick={() => router.back()}>
            <MdChevronLeft className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-slate-900 font-bold text-sm line-clamp-1">
                {course.courseName}
            </h1>
            <div className="flex items-center gap-x-2 mt-0.5">
               <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{width: `${watchPercent}%`}} />
               </div>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{watchPercent}% Complete</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
           {/* <button className="hidden sm:flex items-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
             Leave a Review
           </button> */}
            <div className="hidden sm:flex items-center gap-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
              <MdStar className="w-4 h-4" />
              <span className="text-sm">{course.courseLevels}</span>
            </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Left Side: Video & Details */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30">
          <div className="relative aspect-video bg-black w-full shadow-lg group overflow-hidden">
            {/* Hidden Native Video Element */}
            <video
              ref={videoRef}
              src={lesson.fileUri}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
            />

            {/* Big Center Play Button (Hidden when playing) */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-20 h-20 bg-indigo-600/90 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                  {
                    updating ?
                    <Spinner className='w-12 h-12' />
                    :
                    <MdPlayArrow className="w-12 h-12" />
                  }
                </div>
              </div>
            )}

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              
              {/* Progress Bar */}
              <div className="w-full px-6">
                <div className="relative h-4 w-full">
                  <div className="w-full absolute top-[2px] left-0 h-1 bg-gray-600 rounded-full">
                    <div 
                      className="h-1 bg-indigo-500 rounded-full pointer-events-none duration-300 ease-in-out transition-all" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={handleScrub}
                    className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer z-10
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-x-4 text-white">
                  <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors">
                    {isPlaying ? <MdPause className="w-6 h-6" /> : <MdPlayArrow className="w-6 h-6" />}
                  </button>
                  
                  <div className="text-xs font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-x-4 text-white">
                  <MdSettings className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer hover:rotate-45 transition-transform" />
                  <button onClick={handleFullscreen}>
                      <MdFullscreen className="w-6 h-6 opacity-70 hover:opacity-100 cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 bg-white">
            <div className="flex border-b border-slate-100 mb-6 overflow-x-auto">
              {['Overview'].map((tab) => (
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
              <h2 className="text-xl font-bold text-slate-600">Lesson Title</h2>
              <p className="text-2xl font-bold text-slate-900 leading-relaxed">
                {lesson.materialTitle}
              </p>
              
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-x-4 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MdOutlineFileDownload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">Project_Files.zip</p>
                    <p className="text-slate-500 text-xs font-medium">12.4 MB • Source Code</p>
                  </div>
                </div>
              </div> */}
            </div>
            
             <div className="max-w-4xl space-y-5 mt-8">
              <h2 className="text-xl font-bold text-slate-600">Lesson Chapter</h2>
              <p className="text-2xl font-bold text-slate-900 leading-relaxed">
                {lesson.chapter}
              </p>
              
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-x-4 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MdOutlineFileDownload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">Project_Files.zip</p>
                    <p className="text-slate-500 text-xs font-medium">12.4 MB • Source Code</p>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="max-w-4xl space-y-4 mt-9">
              <h2 className="text-xl font-bold text-slate-600">Course description</h2>
              <p className="text-md text-slate-600 leading-relaxed">
                {course.courseDescription}
              </p>
              
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-x-4 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MdOutlineFileDownload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">Project_Files.zip</p>
                    <p className="text-slate-500 text-xs font-medium">12.4 MB • Source Code</p>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="w-full flex justify-between items-center mt-6">
              
                <button 
                className={`w-fit py-2 px-3 text-md bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-100 ${materialIndex===0?"cursor-disabled":"cursor-pointer"}`}
                // onClick={getCertificate}>
                onClick={prevLesson}>
                  Go to previous lesson
                </button>
              
                <button className={`w-fit py-2 px-3 text-md bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-100 ${materialIndex < course.materialCount?"cursor-pointer":"cursor-disabled"}`}
                // onClick={getCertificate}>
                onClick={nextLesson}>
                  Go to next lesson
                </button>
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
                  <span className="text-[10px] text-slate-400 font-bold">{chapterMaterial.length} lessons</span>
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
                            {/* <div className="w-5 h-5 rounded-full border-2 border-slate-200" /> */}
                            <MdPlayCircleOutline className="w-9 h-9 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold line-clamp-2 ${isCurrent ? "text-indigo-700" : "text-slate-700"}`}>
                            {material.materialTitle}
                          </p>
                          <div className="flex items-center gap-x-2 mt-1">
                            <MdOutlineDescription className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-bold">Video • {material.duration}</span>
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