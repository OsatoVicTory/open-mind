"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/python-course.png";
import { useState } from "react";
import { FaInstagram, FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { MdLink } from "react-icons/md";


export default function User({ id } : { id: string }) {
    
    const [route, setRoute] = useState("Created Courses");
    const courses = Array(10).fill(0). map((_, i) => {
        return { 
            _id: i, img: logo, name: "100 Days of Code: The Complete python bootcamp", 
            instructor: "Dr Angela Yen - Chief Instructor", price: "$35"
        };
    });
    
    const routes = [
        {name: "Created Courses"},
        {name: "Enrolled Courses"},
        {name: "Settings"},
    ];

    return (
        <div className="w-full">
            <div className="w-full bg-[var(--user-banner-bg)] p-6 py-6 lg:px-10 relative">
                <div className="w-full flex flex-col gap-y-1 py-3 text-black">
                    <span className="text-[14px] font-550 mt-[-7px]">USER</span>
                    <h2 className="text-xl lg:text-3xl font-750 mt-2">Dr. Angela Yu, Developer</h2>
                    <span className="text-md mt-1 font-550">Developer and Lead Instructor</span>
                    <div className="w-fit bg-[rgba(239,188,239,0.5)] py-1 px-3 mt-3 font-550 text-sm rounded-sm">OpenMind Instructor</div>
                </div>
                <div className="w-[330px] bg-white shadow-lg rounded-xl absolute right-12 top-0 z-1 mt-8 px-3 py-8 flex flex-col gap-y-10 items-center justify-center">
                    <Image src={logo} alt="logo" className={`object-cover rounded-full w-[130px] h-[130px]`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="w-full flex justify-center items-center gap-x-3">
                        <a href="/" className="decration-none rounded-sm border border-[rgb(38,39,45)] p-3 flex justify-center items-center">
                            <MdLink className="w-[19px] h-[18px] text-black/90" />
                        </a>
                        <a href="/" className="decration-none rounded-sm border border-[rgb(38,39,45)] p-3 flex justify-center items-center">
                            <FaLinkedin className="w-[19px] h-[18px] text-black/90" />
                        </a>
                        <a href="/" className="decration-none rounded-sm border border-[rgb(38,39,45)] p-3 flex justify-center items-center">
                            <FaSquareXTwitter className="w-[19px] h-[18px] text-black/90" />
                        </a>
                        <a href="/" className="decration-none rounded-sm border border-[rgb(38,39,45)] p-3 flex justify-center items-center">
                            <FaInstagram className="w-[19px] h-[18px] text-black/90" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-[calc(100%-400px)] mt-5 p-6 px-7">
                <div className="w-full flex items-center gap-x-10 text-black">
                    <div className="flex flex-col w-fit gap-y-1">
                        <span className="text-xl font-550">3,078,288</span>
                        <span className="text-md text-black/75">Total learners</span>
                    </div>
                    <div className="flex flex-col w-fit gap-y-1">
                        <span className="text-xl font-550">1,078,288</span>
                        <span className="text-md text-black/75">Total reviews</span>
                    </div>
                </div>
                <div className="w-full mt-7">
                    <span className="text-sm text-black/93 font-480">{"The boy is the goat. ".repeat(20)}</span>
                </div>
            </div>
            <div className="w-full px-6 py-4">
                <div className="w-full p-2 gap-x-3 flex items-center border-b border-b-[rgba(18,18,18,0.19)]">
                    {routes.map((_route, r_id) => (
                        <button key={`acccount-id-routes-${r_id}`} onClick={() => setRoute(_route.name)}
                        className={`w-fit text-left rounded-full px-4 py-3 cursor-pointer flex items-center gap-x-3 ${route === _route.name ? "bg-[rgba(18,18,18,0.09)] font-550" : "hover:bg-[rgba(18,18,18,0.09)]/50"}`}>
                            <span className="text-[15px] text-black font-500">{_route.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full px-6 py-4">
                <div className="w-full courses-box-parent">
                    {courses.map((course, cId) => (
                        <div key={`c-${cId}-${course._id}`}>
                            <Link href={`/courses/${course._id}`} className="w-full">
                                <div className="w-full flex flex-col gap-y-1">
                                    <Image src={course.img} alt="logo" className={`object-fill rounded-[3] w-full h-[180px] min-[420px]:h-[130px]`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    <span className="font-550 text-black/90 line-clamp-2 text-[13px]">{course.name}</span>
                                    <span className="text-black/51 text-[11px] font-500 line-clamp-1">{course.instructor}</span>
                                    <span className="font-550 text-black/93 line-clamp-2 text-xs"><span className="text-black/65">Price:   </span>{course.price}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};