"use client";

import logo from "@/assets/python-course.png";
import Image from "next/image";
import Link from "next/link";
import { IoFilterSharp } from "react-icons/io5";
import { PiCertificate } from "react-icons/pi";

export const AccountCourses = ({ headerName, courses, setShowFilter }: { headerName: string, courses: any[], setShowFilter: (val: boolean) => void }) => {
    return (
        <>
            <div className="w-full flex flex-col ">
                <div className="w-full px-6 py-4 gap-x-3 shadow-sm flex items-center">
                    <button onClick={() => setShowFilter(true)}
                    className="min-md:hidden w-fit flex items-center cursor-pointer py-2 px-2 border border-[var(--border)] rounded-sm">
                        <IoFilterSharp className="w-[16px] h-[16px] text-black" />
                    </button>
                    <h2 className="text-black font-bold text-xl">{headerName}</h2>
                </div>
            </div>
            <div className="w-full px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course, cId) => (
                    <Link 
                        href={`/courses/${course.instructor}_x_${course.courseIndex}`} 
                        key={cId}
                        className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <Image 
                                src={logo}
                                // src={course.img} 
                                alt={course.courseName} 
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0 rounded-lg shadow-sm">
                                <span className="text-xs font-bold text-indigo-600">{course.courseAmount}<span className="text-[10px] font-medium text-indigo-700"> SOL</span></span>
                            </div>
                        </div>
                            
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                {course.courseName}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mb-4">{course.instructorName}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Course Detail</span>
                                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    →
                                </div>
                            </div>
                        </div>
                    </Link>
                    ))}
                </div>
            </div>
        </>
    )
};


export const AccountCertificates = ({ 
    headerName, certificates, setShowFilter, setSelectedCert 
} : { 
    headerName: string, certificates: any[], setShowFilter: (val: boolean) => void, setSelectedCert: (val: any) => void 
}
) => {
    return (
        <>
            <div className="w-full flex flex-col ">
                <div className="w-full px-6 py-4 gap-x-3 shadow-sm flex items-center">
                    <button onClick={() => setShowFilter(true)}
                    className="min-md:hidden w-fit flex items-center cursor-pointer py-2 px-2 border border-[var(--border)] rounded-sm">
                        <IoFilterSharp className="w-[16px] h-[16px] text-black" />
                    </button>
                    <h2 className="text-black font-bold text-xl">{headerName}</h2>
                </div>
            </div>
            <div className="w-full px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {certificates.map((certificate, cId) => (
                        <div
                            key={cId}
                            onClick={() => setSelectedCert(certificate)}
                            className="group flex flex-col cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <Image 
                                    src={logo}
                                    // src={certificate.certificateUrl} 
                                    alt={certificate.courseName} 
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                                    <PiCertificate className="text-slate-900 w-4 h-4" />
                                </div>
                            </div>
                                
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {certificate.courseName}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-2">{certificate.instructorName}</p>
                                
                                <div className="mt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                        Issued at: {certificate.issuedAt}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
};
