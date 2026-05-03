"use client";

import SideNavbar from "@/ui/sidebar";
import Image from "next/image";
import logo from "../../assets/agrow-no-bg-full.png";
import Link from "next/link";
import { useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdNotifications } from "react-icons/io";
import { MdOutlineAccountCircle } from "react-icons/md";
import useScrollThrottle from "@/hooks/useScroll";
import { IoWallet } from "react-icons/io5";


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    // true initially, cus collapse gives more width room, and only when users wants to route that is when 
    // they click to uncollapse and show sidebar navs
    const [collapse, setCollapse] = useState(true); 
    const [stick, setStick] = useState(false);
    const stickRef = useRef(false);

    useScrollThrottle(
        "dashboard-main",
        (e: any) => {
            if (e.y >= 15) {
                if (!stickRef.current) setStick(true);
                stickRef.current = true;
            } else {
                if (stickRef.current) setStick(false);
                stickRef.current = false;
            }
        },
        300
    );

    return (
        <div className="flex h-screen w-full overflow-y-auto" id="dashboard-main">
            <SideNavbar collapse={collapse} setCollapse={() => setCollapse(!collapse)} />
            <main className={`Main ${collapse}`}>
                <div className="w-full">
                    <header 
                    className={`w-full sticky top-0 z-50 transition-all duration-300 flex flex-row justify-between items-center px-4 sm:px-8 py-3 
                        ${stick 
                        ? "bg-white backdrop-blur-md shadow-md border-b border-slate-200/50" 
                        : "bg-transparent shadow-sm"
                        }`}
                    >
                        {/* Left Section: Nav & Branding */}
                        <div className="flex items-center gap-x-2 md:gap-x-4">
                            <button 
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center group" 
                            onClick={() => setCollapse(!collapse)}
                            aria-label="Toggle Sidebar"
                            >
                            <GiHamburgerMenu className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                            </button>

                            {/* Mobile Logo */}
                            <Link href="/" className="flex items-center lg:hidden gap-x-2 ml-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm shadow-indigo-200">
                                <Image src={logo} alt="logo" className="w-5 h-5 brightness-0 invert" />
                            </div>
                            <h1 className="font-bold text-lg tracking-tight text-slate-900 hidden xs:block">AGROW</h1>
                            </Link>

                            {/* Desktop Welcome Text */}
                            <div className="hidden lg:block ml-4">
                            <h1 className="text-slate-900 font-semibold text-lg">
                                Welcome back, <span className="text-indigo-600">Tory</span> 👋
                            </h1>
                            </div>
                        </div>

                        {/* Right Section: Actions */}
                        <div className="flex items-center gap-x-2 sm:gap-x-3">
                            {/* Notification Button */}
                            <button className="relative p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all rounded-xl shadow-sm">
                            <IoMdNotifications className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>

                            {/* Connect Wallet Button */}
                            <button className="flex items-center gap-x-2 px-4 py-2.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-slate-200 transition-all active:scale-95 group">
                            <IoWallet className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-semibold hidden sm:block">Connect Wallet</span>
                            </button>

                            {/* Profile Button */}
                            <button className="p-1 border-2 border-transparent hover:border-indigo-100 rounded-full transition-all">
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                                <MdOutlineAccountCircle className="w-7 h-7" />
                            </div>
                            </button>
                        </div>
                    </header>
                    {/* <main className="w-full py-3 px-3 sm:px-6">{children}</main> */}
                    <main className="w-full">{children}</main>
                </div>
            </main>
        </div>
    );
}