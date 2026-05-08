"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  MdPlayCircleOutline, 
  MdOutlineAccessTime, 
  MdOutlineInfo, 
  MdOutlineCloudDownload, 
  MdOutlineEmojiEvents,
  MdKeyboardArrowDown,
  MdStar
} from 'react-icons/md';
import { IoMdCheckmark } from 'react-icons/io';
import img from "@/assets/python-course.png";
import Image from 'next/image';
import { useOpenMind } from '@/hooks/useOpenMind';
import Link from 'next/link';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { GoClockFill } from 'react-icons/go';
import CertificateModal from '@/components/modals/certificateModal';
import CertificateGenerator from '@/components/account/certificate';
import { useRouter } from 'next/navigation';
import { formatDuration, getVideoDuration } from '@/utils/helpers';
import { getUser, updateUser } from '@/app/actions/user';
import { getTest } from '@/app/actions/test';

const CourseP = ({ id } : { id: string }) => {

  const router = useRouter();
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [certifying, setCertifying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [completed, setCompleted] = useState<any>({});
  const { 
    getProgram, userPublicKey, getProvider, 
    getUserPDA, getCourseMaterialPDA, getInstructorCreatedCoursePDA, 
    getUserCertificatePDA, getCertificatePDA, getUserEnrolledCoursesPDA 
  } = useOpenMind();
  const [course, setCourse] = useState<any>({});
  const [instructor, setInstructor] = useState<string>("");
  const [courseIndex, setCourseIndex] = useState(0);
  const [chapters, setChapters] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [testCreated, setTestCreated] = useState(false);

  const curriculum = [
    { title: "Introduction to Python", lessons: 5, duration: "45m" },
    { title: "Data Structures & Algorithms", lessons: 12, duration: "3h 20m" },
    { title: "Web Scraping with Beautiful Soup", lessons: 8, duration: "1h 45m" },
    { title: "Automating Excel & Emails", lessons: 10, duration: "2h 10m" },
  ];
    const getCoursesAndMaterials = async () => {
      setLoading(true);
      try {
        
        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
        }

        const [instructorAddy, cI] = id.split("_x_");
        setInstructor(instructorAddy);
        const course_index = Number(cI);
        setCourseIndex(course_index);

        const userPDA = getUserPDA();
        const user = await (program.account as any).user.fetch(userPDA);
        
        const instructorCreated = getInstructorCreatedCoursePDA(instructorAddy, course_index);
        const course = await (program.account as any).course.fetch(instructorCreated);
        course.instructor = course.instructor.toString(); 
        console.log("course", course);
        setCourse(course);

        const test = await getTest(course.testId);
        if(test?.test?.courseName) {
          setTestCreated(true);
        }

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
          materials.push({ ...material, materialIndex: j, instructor: material.instructor.toString() });
        }

        console.log("materials", materials);

        const chaptersClone : any[] = [];
        let i = 0;
        for(; i < materials.length; i++) {
          const mat = materials[i];
          const chapter: any[] = [];
          let j = i;
          while(j < materials.length && materials[j].chapter === mat.chapter) {
            chapter.push(materials[j]);
            j++;
          }
          chaptersClone.push(chapter);
          i = j - 1;
        }
        setChapters(chaptersClone);


        for(let course_index = 0; course_index < user.enrolledCoursesCount; course_index++) {
            const userEnrolled = getUserEnrolledCoursesPDA(course_index);
            const course_ = await (program.account as any).userCourse.fetch(userEnrolled);
            
            if(course_.instructor === instructorAddy && course_.instructorCourseIndex === cI) {
              setEnrolled(true);

              // find if user has completed course
              const userDb = await getUser(userPublicKey.toString());
              const userCourse = userDb.courses.find((user_course_: any) => {
                return user_course_.instructor === instructorAddy && user_course_.instructorCourseIndex === course_index;
              });
              setCompleted({
                coveredAllLessons: userCourse.coveredLessons.length >= course_.materialCount,
                claimedCertificate: userCourse.claimed, testScore: userCourse.testScore
              });

              break;
            }
        }


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

    const getCertificate = async () => {

      if(certifying) return;
      setCertifying(true);
      try {
        
        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }
        const provider = getProvider();

        const userPDA = getUserPDA();
        const issuerPDA = getUserPDA();
        const user = await (program.account as any).user.fetch(userPDA);
        console.log("user", user, user.createdCoursesCount, userPublicKey);
        
        const tx = new Transaction();
        const issuer = await (program.account as any).user.fetch(issuerPDA);
        console.log("user", user, user.certifications, issuer);

        const cert_index = user.certifications;
        const issuer_cert_index = issuer.issuedCertificatesCount;

        const receipientAddress = userPublicKey.toString(); // should be receipient address
        const receipientKey = new PublicKey(receipientAddress);


        const userCertPda = getUserCertificatePDA(receipientKey, cert_index);
        const certificatePda = getCertificatePDA(receipientAddress, issuer_cert_index); // should be issuer address but we are issuer for testing

        const certs = await (program.account as any).certificate.all();
        console.log("certificates", certs);

        if (!userPDA || !issuerPDA || !userCertPda || !certificatePda) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }

        const matTx = await program.methods
          .initializeCertificate(
            new PublicKey(instructor),
            cert_index,
            issuer_cert_index,
            courseIndex,
            "none just vibez",
          )
          .accounts({
            claimer: userPublicKey,
            issuer: issuerPDA,
            userCert: userCertPda,
            certificate: certificatePda,
            systemProgram: SystemProgram.programId,
          }).instruction();
        
          tx.add(matTx);

        const tHash = await program.methods
          .addUserCertificate()
          .accounts({
            signer: userPublicKey,
            user: userPDA,
            systemProgram: SystemProgram.programId,
          }).instruction();
        
          tx.add(tHash);
                
        const txSignature = await provider.sendAndConfirm(tx);
        console.log("Batch Transaction Success:", txSignature);
        setCertifying(false);
        
      } catch(err) {
        console.log(err);
        setCertifying(false);
      }
    };

    const enrollCourse = async () => {
      if(enrolling) return;
      setEnrolling(true);
      try {
        

        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }

        const userPDA = getUserPDA();
        const user = await (program.account as any).user.fetch(userPDA);
        console.log("user", user, user.createdCoursesCount, userPublicKey);
        console.log("u", userPublicKey.toString(), userPublicKey.toString() === instructor, courseIndex);
        const enrolled_course_count = user.enrolledCoursesCount;

        const userCreatedPDA = getInstructorCreatedCoursePDA(instructor, courseIndex);
        const userEnrolledCoursePDA = getUserEnrolledCoursesPDA(enrolled_course_count);

        const _course = await (program.account as any).course.fetch(userCreatedPDA);
        console.log("course", _course);
        
        const tx = await program.methods.initializeUserCourse(
          enrolled_course_count,
          new PublicKey(instructor), // use instructor_name as address can be gotten from instructor field
          courseIndex
        ).accounts({
            signer: userPublicKey,
            user: userPDA,
            course: userCreatedPDA,
            userCourse: userEnrolledCoursePDA,
            systemProgram: SystemProgram.programId,
        } as any).rpc();


        // initialize tracking of user watching/progress in course
        const userId = userPublicKey.toString();
        const userDb = await getUser(userId);
        console.log("user", userDb.user);
        const userCoursesDb = userDb.user.courses;
        const enrolledCourse = userCoursesDb.find((user_course_: any) => {
          return user_course_.instructor === instructor && user_course_.instructorCourseIndex === courseIndex;
        });
        if(!enrolledCourse) {
          const newUserCourse_ = {
            coveredLessons: [], claimed: false,
            instructor, instructorCourseIndex: courseIndex
          };
          userCoursesDb.push(newUserCourse_);
          const _r = await updateUser(userPublicKey.toString(), { data: { courses: userCoursesDb } });
        }
        setEnrolled(true);
        setEnrolling(false);
      } catch (err) {
        console.log("enroll error", err);
        setEnrolling(false);
      }
    };

    const createNewTest = () => {
      router.push(`/create/${courseIndex}_x_${course.courseName}_x_${course.testId}`);
    };

    const btnRef = [
      {name: null, fn: null},
      {name: "Enroll", fn: enrollCourse}, 
      {name: "Get Certificate", fn: getCertificate}, 
      {name: "Update Course Test", fn: createNewTest}
    ];

    const btnRefIndex = useMemo(() => {
      if(loading || !userPublicKey) return 0;
      else if(userPublicKey.toString() === instructor) {
        if(!testCreated)return 3;
        else return 0;
      } else if(completed.coveredAllLessons) {
        if(completed.testScore > 70) return 2; 
        else return 0;
      }
      else if(!enrolled) return 1;
      else return 0;
    }, [userPublicKey, loading, enrolled, instructor, completed?.completedLessons]);

  return (
    <div className="w-full bg-white font-sans text-slate-900">
      
      
      {
        loading ?
        <div className='text-black text-xl'>Loading...</div>
        :
        <>
        <section className="w-full bg-[#1c1d1f] text-white py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-y-12">
          <div className="lg:col-span-2 space-y-6">
            
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              {course.courseName}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              {course.courseDescription}
            </p>

            <div className="flex items-center text-sm mt-17">
              <div className="flex items-center gap-2 bg-amber-400 text-black px-2 py-1 rounded font-bold">
                <MdStar className="w-4 h-4" />
                <span className="text-base">{course.courseLevels}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-amber-400 text-black px-2 py-1 rounded font-bold">
                <GoClockFill className="w-4 h-4" />
                <span className="text-base">{course.courseHours} minutes</span>
              </div>
            </div>

            <div className="text-sm text-slate-300">
              Created by <span className="text-indigo-400 underline font-bold">{course.instructorName}</span>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="sticky top-10 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden text-slate-900">
              <div className="aspect-video bg-slate-900 relative group cursor-pointer">
                {/* <img 
                  src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800" 
                  alt="Course Preview" 
                  className="w-full h-full object-cover opacity-60"
                /> */}
                <Image 
                    src={img} 
                    fill
                    alt="Course Preview" 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MdPlayCircleOutline className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-white font-bold mt-2">Video course</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black">{course.courseAmount}</span>
                  <span className="text-emerald-600 font-bold text-lg">SOL</span>
                </div>

                {btnRef[btnRefIndex]?.name && <div className="space-y-3">
                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-100"
                  onClick={btnRef[btnRefIndex].fn}>
                    {btnRef[btnRefIndex].name}
                  </button>
                </div>}

                <div className="space-y-4">
                  <p className="font-bold text-sm">This course includes:</p>
                  <ul className="space-y-3">
                    {[
                      { icon: MdOutlineAccessTime, text: `${course.courseHours} mins on-demand video` },
                      { icon: MdOutlineCloudDownload, text: `${course.materialCount} resources` },
                      { icon: MdOutlineInfo, text: "Full lifetime access" },
                      { icon: MdOutlineEmojiEvents, text: "Certificate of completion" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                        <item.icon className="w-5 h-5" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
{/* 
        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-100"
        // onClick={getCertificate}>
        onClick={enrollCourse}>
          Get certificate
        </button> */}
          
          
          <section className="p-8 border border-slate-200 rounded-2xl bg-slate-50/50">
            <h2 className="text-2xl font-black mb-6">What you'll learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.courseWhatYouWillLearn || "").split(",").map((text: any, i: number) => (
                <div key={i} className="flex gap-3 items-center">
                  <IoMdCheckmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-6">Course Content</h2>
            <div className="flex justify-between items-center mb-4 text-sm text-slate-500 font-medium">
              <span>{`${chapters.length} chapters • ${course.materialCount} lectures `}</span>
              <button className="text-indigo-600 font-bold hover:underline">Expand all sections</button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              {chapters.map((lessons, i) => (
                <div key={`chapters-${i}`} className="border-b border-slate-200 last:border-0">
                  <button 
                    onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MdKeyboardArrowDown className={`w-6 h-6 transition-transform ${openSection === i ? 'rotate-180' : ''}`} />
                      <span className="font-bold text-left">{lessons[0].chapter}</span>
                    </div>
                    {/* <span className="hidden sm:block text-xs text-slate-400">{section.lessons} lectures • {section.duration}</span> */}
                  </button>
                  
                  {openSection === i && (
                    <div className="p-5 bg-slate-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {lessons.map((lesson: any, idx: number) => (
                        <Link 
                        href={`/course/${instructor}_x_${courseIndex}_x_${lesson.materialIndex}`} 
                        key={`course-sections-${idx}`} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <MdPlayCircleOutline className="text-slate-400" />
                            <span className="text-slate-600">{lesson.materialTitle}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-xs">{lesson.duration}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>


          <section className="space-y-4">
            <h2 className="text-2xl font-black">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
              <li>No prior experience required</li>
              <li>A computer (Windows, Mac, or Linux) with internet access</li>
              <li>Willingness to learn and build real-world projects</li>
            </ul>
          </section>
        </div>
      </main>
    </>
    }

    <CertificateModal 
      isOpen={openModal} onClose={() => setOpenModal(false)}
      title='Certificate' 
    >
      <CertificateGenerator />
    </CertificateModal>
    </div>
  );
};

export default CourseP;