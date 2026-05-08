"use client";

import { FormatTokenPrice, Skeleton, Spinner } from "@/components/ui/loading";
import useScrollThrottle from "@/hooks/useScroll";
import { LoadingType } from "@/types";
import { formatValue } from "@/utils/helpers";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { IoFilterSharp } from "react-icons/io5";
import { RiAccountPinBoxLine, RiApps2AddFill, RiMedalLine } from "react-icons/ri";
import { SlSettings } from "react-icons/sl";
import { AccountCertificates, AccountCourses } from "@/components/account";
import { AccountSettings } from "@/components/account/settings";
import { useOpenMind } from "@/hooks/useOpenMind";
import { useReadContract } from "thirdweb/react";
import { PiCertificate } from "react-icons/pi";
import CertificateGenerator from "@/components/account/certificate";
import CertificateModal from "@/components/modals/certificateModal";
import CertificateViewer from "@/components/account/certificateView";

export default function AccountPage() {

    const pageSize = 20;
    const { 
        getProgram, userPublicKey, getProvider, getUserPDA, getUserEnrolledCoursesPDA, 
        getCreatedCoursePDA, getUserCertificatePDA, getCertificatePDA, getInstructorCreatedCoursePDA 
    } = useOpenMind();
    const [route, setRoute] = useState("Created Courses");
    const lstId = useRef<string>("");
    const filtersRef = useRef<any>({ cap: 0, cat: [0] });
    const loadedRef = useRef(false);
    const stopScrollFetchingRef = useRef(false);

    const [showFilter, setShowFilter] = useState(false);
    const [created, setCreated] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState<any>({});
    

    const routes = [
        {icon: RiApps2AddFill, name: "Created Courses"},
        {icon: RiAccountPinBoxLine, name: "Enrolled Courses"},
        {icon: PiCertificate, name: "Certificates"},
        {icon: SlSettings, name: "Settings"},
    ];

    const fetchUserCourses = async () => {
        setLoading(true);
        try {
        
            const program = getProgram();
            if (!program || !userPublicKey) {
                throw new Error("Wallet not connected or Program failed to load.");
                return;
            }

            const provider = getProvider();

            const userPDA = getUserPDA();
            const user = await (program.account as any).user.fetch(userPDA);
            console.log(user);
            const enrolled_ = [];
            const created_ = [];
            for(let course_index = 0; course_index < user.createdCoursesCount; course_index++) {
                const userCreated = getCreatedCoursePDA(course_index);
                const course = await (program.account as any).course.fetch(userCreated);
                created_.push(course);
                console.log("created_course", course);
            }
            
            for(let course_index = 0; course_index < user.enrolledCoursesCount; course_index++) {
                const userEnrolled = getUserEnrolledCoursesPDA(course_index);
                const course_ = await (program.account as any).userCourse.fetch(userEnrolled);
                // console.log("enrolled_course", course_);
                const userCreated = getInstructorCreatedCoursePDA(course_.instructor, course_.instructorCourseIndex);
                const course = await (program.account as any).course.fetch(userCreated);
                enrolled_.push(course);
            }

            const certificates_ = []
            
            
            for(let course_index = 0; course_index < user.certifications; course_index++) {
                const userEnrolled = getUserCertificatePDA(userPublicKey, course_index);
                const userCert = await (program.account as any).userCertificate.fetch(userEnrolled);
                console.log("userCert", course_index, userCert);
                const instructor = userCert.issuer.toString();
                const certPda = getCertificatePDA(instructor, userCert.trackingId);
                const cert = await (program.account as any).certificate.fetch(certPda);
                const timeInSecs = cert.issuedAt.toNumber();//(u64) to get issuance date
                cert.issuedAt = String(new Date(timeInSecs * 1000)).slice(4, 15);

                const instructorCreatedPDA = getInstructorCreatedCoursePDA(instructor, cert.courseIndex);
                const course = await (program.account as any).course.fetch(instructorCreatedPDA);
                cert.instructorName = course.instructorName;
                cert.courseName = course.courseName;
                cert.instructor = instructor; 
                certificates_.push(cert);
            }

            setCreated(created_);
            setEnrolled(enrolled_);
            setCertificates(certificates_);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setError(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserCourses();
    }, []);


    return (
        <div className="w-full flex">

            <aside className={`w-full md:w-[270px] h-[calc(100vh-75px)] overflow-hidden ${!showFilter ? "max-md:hidden" : ""} sticky left-0 top-[72px] z-3 sm:border-r border-r-[rgba(18,18,18,0.19)]`}>
                <div className="w-full h-full bg-white flex flex-col border-r border-slate-100">
                    {/* Sidebar Header */}
                    <div className="w-full px-5 py-6 flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <IoFilterSharp className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account</h2>
                        </div>

                        <button 
                        className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                        onClick={() => setShowFilter(false)}
                        >
                        <AiOutlineClose className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                        {routes.map((_route, r_id) => {
                        const isActive = route === _route.name;
                        return (
                            <button
                            key={`account-routes-${r_id}`}
                            onClick={() => setRoute(_route.name)}
                            className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive 
                                ? "bg-indigo-50 text-indigo-700" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                } cursor-pointer`}
                            >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                            )}

                            <div className={`transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                                <_route.icon className="w-6 h-6" />
                            </div>

                            <span className={`text-sm font-bold transition-colors ${isActive ? "text-indigo-700" : "text-slate-600 group-hover:text-slate-900"}`}>
                                {_route.name}
                            </span>
                            
                            {/* Optional: Add a chevron that shows on hover for inactive items */}
                            {!isActive && (
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                </div>
                            )}
                            </button>
                        );
                        })}
                    </nav>

                    {/* Optional Sidebar Footer (Help/Logout) */}
                    <div className="p-4 border-t border-slate-50">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-bold">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className={`w-full md:w-[calc(100%-270px)] min-h-[calc(100vh-70px)] ${showFilter ? "max-md:hidden" : ""}`}>
                {
                    loading ?
                    <div className='text-black text-xl'>Loading...</div>
                    :
                    (
                        route === routes[0].name
                        ?
                        <AccountCourses headerName={"Created Courses"} courses={created} setShowFilter={setShowFilter} />
                        : (
                            route === routes[1].name
                            ?
                            <AccountCourses headerName={"Enrolled Courses"} courses={enrolled} setShowFilter={setShowFilter} />
                            : (
                                route === routes[2].name 
                                ?
                                <AccountCertificates headerName={"Certificates"} certificates={certificates} 
                                setShowFilter={setShowFilter} setSelectedCert={(val: any) => {
                                    setSelectedCert(val);
                                    setOpenModal(true);
                                }} />
                                :
                                <AccountSettings headerName={"Account Settings"} setShowFilter={setShowFilter} />
                            )
                        )
                    )
                }

            </main>

            <CertificateModal 
            isOpen={openModal} onClose={() => setOpenModal(false)}
            title='Certificate' 
            >
                <CertificateViewer selectedCert={selectedCert} />
            </CertificateModal>

        </div>
    )
}