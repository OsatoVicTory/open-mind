"use client";

import { useOpenMind } from '@/hooks/useOpenMind';
import { SystemProgram, Transaction } from "@solana/web3.js";
import { SKILLS } from '@/utils/data';
import { uploadToIpfs } from '@/utils/helpers';
import { useState } from 'react';
import { 
  MdOutlineCloudUpload, 
  MdOutlineSlowMotionVideo, 
  MdOutlineDescription, 
  MdAttachMoney, 
  MdAddCircleOutline,
  MdDeleteOutline,
  MdRocketLaunch,
  MdDragIndicator,
  MdFolderOpen,
  MdAdd,
  MdCheckCircleOutline,
  MdUpload
} from 'react-icons/md';

const CreateCourse = () => {
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState("");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  
  const { getProgram, userPublicKey, getProvider, getUserPDA, getCourseMaterialPDA, getCreatedCoursePDA, txWait } = useOpenMind();
  // Step 1 State: Learning Objectives
  const [objectives, setObjectives] = useState([""]);

  // Step 2 State: Chapters and Videos
  const [chapters, setChapters] = useState<any[]>([
    { id: 1, title: "Introduction", videos: [{ id: 101, name: "", file: null }] }
  ]);

  // --- Handlers for Step 1 ---
  const addObjective = () => setObjectives([...objectives, ""]);
  const updateObjective = (index: number, val: string) => {
    const newObs = [...objectives];
    newObs[index] = val;
    setObjectives(newObs);
  };

  // --- Handlers for Step 2 ---
  const addChapter = () => {
    setChapters([...chapters, { id: Date.now(), title: "", videos: [] }]);
  };

  const addVideoToChapter = (chapterId: number) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
      ? { ...ch, videos: [...ch.videos, { id: Date.now(), name: "" }] } 
      : ch
    ));
  };

    const handleMaterials = async () => {
      const materials_ : any[] = [];
      let i = 0;
      chapters.forEach(ch => {
        ch.videos.forEach((c: any) => {
          materials_.push({ chapter: ch.title, index: i, file: c.file, material_title: c.name });
          i++;
        })
      });

      const materials = [];
      for(let material of materials_) {
        const url = await uploadToIpfs(material.file);
        material.file_uri = url;
        delete material.file;
        materials.push(material);
      }
      
      return materials;
    };
  
  const ref = [
    "course_name",
    "course_description",
    "course_what_you_will_learn",
    "course_amount",
    "course_index",
    "subscriber_count",
    "material_count",
    "star_review_total",
    "star_review_count",
    "course_hours",
    "course_levels",
    "course_skills",
    "test_id",
  ];

    const handleCreate = async () => {
      if(loading) return;
      setLoading(true);
      try {
        const d = data;
        const wywl = objectives.join(",");
        if(wywl.length > 499) {
          // must not be > 499 characters
        }
        d.course_amount = Number(d.course_amount);
        d.course_hours = Number(d.course_hours); // actually in minutes not hours cus some course might be short
        d.course_what_you_will_learn = wywl;
        d.test_id = "0123456789";

        // countdown video just for testing
        const fakeVideo = "https://static.vecteezy.com/system/resources/previews/008/976/748/watermarked/countdown-one-minute-animation-from-60-to-0-seconds-free-video.mp4";
        
        const materials : any[] = [];
        let i = 0;
        chapters.forEach(ch => {
          ch.videos.forEach((c: any) => {
            materials.push({ 
              chapter: ch.title, index: i, 
              file_uri: (i==0||i==1) ? fakeVideo : "none vibes", material_title: c.name });
            i++;
          })
        });
        // const materials = await handleMaterials();

        console.log("MATERIALS", materials);
        console.log(d, userPublicKey?.toString() || "");
        // setLoading(false);
        // return;
        
        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }

        const provider = getProvider();

        const userPDA = getUserPDA();
        const user = await (program.account as any).user.fetch(userPDA);
        console.log("user", user, user.createdCoursesCount, userPublicKey);
        const course_index = user.createdCoursesCount;

        d["course_index"] = course_index;
        // d["material_count"] = materials.length;  // no need for this as we will increment in smart contract the material count

        const tx = new Transaction();

        const userCreated = getCreatedCoursePDA(course_index);
        // try {
        //   const course = await (program.account as any).course.fetch(userCreated);
        //   console.log("course exist: ", course);
        // } catch(e) {
        //   console.log("coure error: ", e);
        // }

        if (!userPDA || !userPublicKey || !userCreated) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }

        const courseTx = await program.methods.initializeCourse(
          course_index,
          `${user.firstName} ${user.lastName}`, // use instructor_name as address can be gotten from instructor field
          ...ref.map(_r => {
              if(d[_r]) return d[_r];
              else return 0;
          })
        ).accounts({
            instructor: userPublicKey,
            user: userPDA,
            course: userCreated,
            systemProgram: SystemProgram.programId,
        } as any).rpc();

        await txWait(courseTx);

        await new Promise((res) => setTimeout(res, 2000));
        
        
        const course = await (program.account as any).course.fetch(userCreated);
        console.log("new course", course);

        
        for(let i = 0; i < materials.length; i++) {
          const courseMaterialPda = getCourseMaterialPDA(course_index, i);
          const material = materials[i];
          const matTx = await program.methods.submitMaterial(
            course_index,
            i,
            data.course_name,
            material.material_title,
            material.file_uri,
            material.chapter,
          ).accounts({
              instructor: userPublicKey,
              course: userCreated,
              courseMaterial: courseMaterialPda,
              systemProgram: SystemProgram.programId,
          } as any).instruction();

          tx.add(matTx);
        }
        
        const txSignature = await provider.sendAndConfirm(tx);
        console.log("Batch Transaction Success:", txSignature);
        setLoading(false);

      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 text-center">Create Course</h2>
        
        {/* Progress Header */}
        <div className="flex mt-6 items-center justify-between mb-10 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                ${step >= i ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-400 border border-slate-200"}`}>
                {i}
              </div>
              {i < 3 && (
                <div className={`flex-1 h-1 mx-4 rounded ${step > i ? "bg-indigo-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <header>
                    <h2 className="text-2xl font-black text-slate-900">Basic Information</h2>
                    <p className="text-slate-500 text-sm mt-1">Tell us about your course and what students will learn.</p>
                  </header>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Course Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Master Solana Development with Anchor"
                        className="w-full text-black/85 px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                        onChange={(e) => setData({...data,course_name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Description</label>
                      <textarea 
                        rows={4} 
                        placeholder="Describe the course value..."
                        onChange={(e) => setData({...data,course_description: e.target.value})}
                        className="w-full px-5 py-4 text-black/85 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                    
                    
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <MdCheckCircleOutline className="w-5 h-5" />
                            <h3 className="font-black uppercase tracking-widest text-xs">What will students learn?</h3>
                        </div>
                        <div className="space-y-3">
                            {objectives.map((obj, i) => (
                            <div key={i} className="flex gap-3 group">
                                <input 
                                value={obj}
                                onChange={(e) => updateObjective(i, e.target.value)}
                                placeholder="e.g. Build a decentralized exchange"
                                className="flex-1 bg-slate-50 text-black/85 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                                />
                                {objectives.length > 1 && (
                                <button onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500">
                                    <MdDeleteOutline className="w-5 h-5" />
                                </button>
                                )}
                            </div>
                            ))}

                            {objectives.length < 11 && (
                            <button onClick={addObjective} className="flex items-center gap-2 text-indigo-600 text-sm font-bold mt-6 hover:opacity-70 transition-opacity">
                            <MdAdd className="w-5 h-5" /> Add another objective
                            </button>)}
                        </div>
                    </section>
                  </div>
                </div>
              )}

                {/* STEP 3: CHAPTERS & VIDEO SEGMENTATION */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                    <header className="flex justify-between items-end">
                        <div>
                        <h2 className="text-3xl font-black text-slate-900">Curriculum Structure</h2>
                        <p className="text-slate-500 text-sm mt-1">Organize your content into logical chapters.</p>
                        </div>
                        <button 
                        onClick={addChapter}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all"
                        >
                        <MdFolderOpen className="w-4 h-4" /> Add Chapter
                        </button>
                    </header>

                    <div className="space-y-6">
                        {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/50">
                            <div className="p-5 bg-white border-b border-slate-100 flex items-center gap-x-3">
                            <MdDragIndicator className="text-slate-300 cursor-grab" />
                            <input 
                                type="text" 
                                placeholder={`Chapter ${index + 1} Title`}
                                className="bg-transparent text-slate-700 font-500 bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none flex-1"
                                defaultValue={chapter.title||""}
                                onChange={(e) => {
                                  const chapts = chapters.map(chap => {
                                    if(chap.id === chapter.id) {
                                      return { ...chap, title: e.target.value };
                                    } else return chap;
                                  });
                                  setChapters(chapts);
                                }}
                            />
                            <button onClick={() => setChapters(chapters.filter(c => c.id !== chapter.id))} className="text-slate-300 hover:text-red-500">
                                <MdDeleteOutline className="w-5 h-5" />
                            </button>
                            </div>

                            <div className="p-6 space-y-4">
                            {chapter.videos.map((vid: any, vIdx: number) => (
                                <div key={vid.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group">
                                <div className=" w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <MdOutlineSlowMotionVideo className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Video Title (e.g. Intro to Solana)" 
                                    className="flex-1 text-sm font-500 rounded-lg py-2 px-3 border border-slate-200 outline-none focus:ring-0 focus:ring-2 focus:ring-indigo-400 text-slate-700" 
                                    onChange={(e) => {
                                      const chapts = chapters.map(chap => {
                                        if(chap.id === chapter.id) {
                                          return { 
                                            ...chap, 
                                            videos: chap.videos.map((c: any) => {
                                              if(c.id === vid.id) return { ...c, name: e.target.value };
                                              else return c;
                                            })
                                          };
                                        } else return chap;
                                      });
                                      setChapters(chapts);
                                    }}
                                />
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 transition-all">
                                    Select File
                                        {/* <MdUpload className="w-5 h-5" /> */}
                                        <input type="file" className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if(!file) return;
                                            const chapts = chapters.map(chap => {
                                              if(chap.id === chapter.id) {
                                                return chap.videos.map((c: any) => {
                                                  if(c.id === vid.id) return { ...c, file };
                                                  else return c;
                                                });
                                              } else return chap;
                                            });
                                            setChapters(chapts);
                                        }} />
                                    </label>
                                    <button className="text-slate-300 hover:text-red-400 cursor-pointer"
                                    onClick={() => {
                                      const chapts = chapters.map(chap => {
                                        if(chap.id === chapter.id) {
                                          return chap.videos.filter((cv: any) => cv.id !== vid.id);
                                        } else return chap;
                                      });
                                      setChapters(chapts);
                                    }}>
                                        <MdDeleteOutline className="w-5 h-5" />
                                    </button>
                                </div>
                                </div>
                            ))}
                            
                            <button 
                                onClick={() => addVideoToChapter(chapter.id)}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                            >
                                <MdAdd className="w-4 h-4" /> Add Video to {chapter.title || "Chapter"}
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <header>
                    <h2 className="text-2xl font-black text-slate-900">Details, Pricing & Launch</h2>
                    <p className="text-slate-500 text-sm mt-1">Set more details, your price and publish to the Solana blockchain.</p>
                  </header>

                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">

                    {/* Course Level and Skills Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                          Difficulty Level
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                            defaultValue=""
                            onChange={(e) => setData({ ...data, course_levels: e.target.value })}
                          >
                            <option value="" disabled>Select Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert / Pro</option>
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="group relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                          Primary Skill
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                            defaultValue=""
                            onChange={(e) => setData({ ...data, course_skills: e.target.value })}
                          >
                            <option value="" disabled>Select Skill</option>
                            {SKILLS.map((skill, sI) => (
                              <option value={skill} key={`skill-option-${sI}`}>{skill}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-7">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs font-black text-indigo-900 uppercase">Course Duration</p>
                          <span className="text-xs text-indigo-600">Students will spend this much time <span className='font-black text-indigo-900'>in Mins</span></span>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          onChange={(e) => setData({ ...data, course_hours: e.target.value })}
                          placeholder="0"
                          className="w-30 bg-white border-none rounded-xl px-4 py-3 font-black text-indigo-900 text-right focus:ring-2 focus:ring-indigo-600"
                        />
                        {/* <span className="absolute -right-6 top-1/2 -translate-y-1/2 font-black text-indigo-900">SOL</span> */}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-7">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                          <MdAttachMoney className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-indigo-900 uppercase">Course Price</p>
                          <span className="text-xs text-indigo-600">Students will pay this in <span className='font-black text-indigo-900'>$SOL</span></span>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          onChange={(e) => setData({ ...data, course_amount: e.target.value })}
                          placeholder="0.00"
                          className="w-30 bg-white border-none rounded-xl px-4 py-3 font-black text-indigo-900 text-right focus:ring-2 focus:ring-indigo-600"
                        />
                        {/* <span className="absolute -right-6 top-1/2 -translate-y-1/2 font-black text-indigo-900">SOL</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <button 
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    step < 3 ? setStep(s => s + 1) : handleCreate();
                  }}
                  className="px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  {step === 3 ? (
                    <><MdRocketLaunch className="w-5 h-5" />{loading ? " Creating..." : "Create Course"}</>
                  ) : "Next Step"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Tips & Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Instructor Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MdAddCircleOutline />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Upload your thumbnail in <b>16:9 ratio</b> for better visibility on the marketplace.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MdAddCircleOutline />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Courses priced between <b>0.5 - 2 SOL</b> generally see the highest conversion rates.
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
               <h4 className="text-lg font-black leading-tight">FYI on files upload</h4>
               <p className="text-indigo-100 text-xs mt-2 leading-relaxed opacity-80">
                 All assets are automatically uploaded to IPFS before being stored on the Solana blockchain.
                 This makes it almost impossible to be lost.
               </p>
               {/* <button className="mt-4 text-xs font-bold text-white underline underline-offset-4">Learn more</button> */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateCourse;