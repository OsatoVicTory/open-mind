"use client";

import Image from "next/image";
import logo from "../assets/agrow-no-bg-full.png";
import Link from "next/link";
import { useState } from "react";
import { GrMoney } from "react-icons/gr";
import { MdManageAccounts } from "react-icons/md";
import { RiDashboardLine, RiP2pLine, RiRefund2Line } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosCreate } from "react-icons/io";

export default function SideNavbar({ collapse, setCollapse }: { collapse: boolean, setCollapse: () => void }) {

    const navs = [
        { name: "Home", href: "/dashboard", icon: RiDashboardLine },
        { name: "Courses", href: "/courses", icon: RiP2pLine },
        { name: "Wallet", href: "/wallet", icon: RiRefund2Line },
        { name: "Create", href: "/create", icon: IoIosCreate },
        { name: "Account", href: "/account", icon: MdManageAccounts }
    ];
    const [route, setRoute] = useState(0);

    return (
        <aside 
  className={`h-screen sticky top-0 left-0 z-[60] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out hidden md:block
    ${collapse ? "w-20" : "w-64"}`}
>
  <div className="h-full flex flex-col p-4">
    {/* Logo Section */}
    <div className={`flex items-center mb-10 ${collapse ? "justify-center" : "px-2"}`}>
      <Link href="/" className="flex items-center gap-x-3 group">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-100 group-hover:rotate-6 transition-transform">
          <Image 
            src={logo} 
            alt="logo" 
            className="w-6 h-6 brightness-0 invert" 
          />
        </div>
        {!collapse && (
          <span className="font-bold text-xl tracking-tight text-slate-900 animate-in fade-in duration-500">
            OpenMind
          </span>
        )}
      </Link>
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 flex flex-col gap-y-2">
      {navs.map((navLink, navIndex) => {
        const isActive = route === navIndex;
        return (
          <Link
            href={navLink.href}
            key={`navLink-${navIndex}`}
            className={`group relative flex items-center transition-all duration-200 rounded-xl px-3 py-3
              ${isActive 
                ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            {/* Active Indicator Bar */}
            {isActive && (
              <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
            )}

            <navLink.icon 
              className={`w-6 h-6 transition-colors 
                ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} 
            />

            {!collapse && (
              <span className="ml-3 font-semibold text-[15px] whitespace-nowrap animate-in slide-in-from-left-2">
                {navLink.name}
              </span>
            )}

            {/* Simple CSS Tooltip for Collapsed State */}
            {collapse && (
               <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-900 text-white text-xs px-2 py-1 rounded md:block hidden z-50 pointer-events-none">
                 {navLink.name}
               </div>
            )}
          </Link>
        );
      })}
    </nav>

    {/* Optional: Bottom Profile/Settings section */}
    {!collapse && (
      <div className="mt-auto p-2 bg-slate-50 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
          T
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 leading-none">Tory Smith</span>
          <span className="text-[10px] text-slate-500">Free Plan</span>
        </div>
      </div>
    )}
  </div>
</aside>
    )
}