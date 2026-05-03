"use client";

import { FormatTokenPrice, Skeleton, Spinner } from "@/components/ui/loading";
import useScrollThrottle from "@/hooks/useScroll";
import { LoadingType } from "@/types";
import { formatValue } from "@/utils/helpers";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BiEditAlt } from "react-icons/bi";
import { IoFilterSharp } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineGeneratingTokens, MdOutlineWbTwilight, MdWhatshot } from "react-icons/md";
import { RiMedalLine } from "react-icons/ri";
import { TiArrowSortedDown } from "react-icons/ti";
import logo from "@/assets/python-course.png";
import Image from "next/image";
import { IoMdCheckmark } from "react-icons/io";
import { useOpenMind } from "@/hooks/useOpenMind";
import { SendTransactionError } from "@solana/web3.js";

export default function CoursesPage() {

    const pageSize = 20;
    const { getProgram, userPublicKey } = useOpenMind();
    // const [loading, setLoading] = useState<LoadingType>({ loading: true, error: false, loaded: false, state: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [scrollChange, setScrollChange] = useState(0);
    const lstId = useRef<string>("");
    const filtersRef = useRef<any>({ cap: 0, cat: [0] });
    const loadedRef = useRef(false);
    const stopScrollFetchingRef = useRef(false);

    const [showFilter, setShowFilter] = useState(false);

    const [courses, setCourses] = useState<any[]>([]); /*Array(10).fill(0). map((_, i) => {
        const mul = (i && i%3 === 0) ? -1.0 : 1.0;
        const [name, price, total_supply, img, public_id, creator_account_id, meta_data, one_day_volume] = [
            `Agrow-${i}`, 0.00102, 900000, "", "", "", "", 10000
        ];
        const [one_hr, one_day, thirty_days] = [
            {change: 3.21 * mul }, { change: 41.87 * mul }, { change: 125.89 * mul }
        ];
        return { 
            _id: i, img: logo, name: "100 Days of Code: The Complete python bootcamp", 
            instructor: "Dr Angela Yen - Chief Instructor", price: "$35"
        };
    }); */

    const [topFilter, setTopFilter] = useState("Trending");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSkilDropdown, setShowSkilDropdown] = useState(false);
    const skillInputRef = useRef<HTMLInputElement | null>(null);

    const [filters, setFilters] = useState({ prices: 0, duration: [0], levels: [0], skills: [0] });
    const prices = ["< $10", "$10 - $30", "$30 - $50", "$50 - $100", "$100 - $150", "$150 - $200", "$200+"];
    const duration = ["< 10 Hrs", "10 - 30 Hrs", "30 - 50 Hrs", "50 - 100 Hrs", "100+ Hrs"];
    const levels = ["Beginner", "Intermediate", "Expert"];
    const skills = ["ALL", "Software development", "Agriculture", "Real Eloading Mgt.", "Digital Arts", "Start ups", "Music", "Agriculture", "Agriculture", "Agriculture", "Agriculture"];

    const handleToggleSkill = (s_idx: number) => {
        const f = [];
        let ok = false;
        for(let fi of filters.skills) {
            if(fi === s_idx) ok = true;
            else f.push(fi);
        }
        if(!ok) f.push(s_idx);
        setFilters({ ...filters, skills: f });
    }

    const fetchAllCourses = async () => {
      setLoading(true);
      try {
        
        const program = getProgram();
        if (!program || !userPublicKey) {
            throw new Error("Wallet not connected or Program failed to load.");
            return;
        }
        
        const coursess = await (program.account as any).course.all();
        const courses_ = coursess.map((c: any) => {
          return { ...c.account, instructor: c.account.instructor.toString() };
        });
        console.log("c", courses_);
        setCourses(courses_);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    }

    useEffect(() => {
      fetchAllCourses();
    }, []);

    return (
        <div className="flex w-full min-h-screen bg-white">
  {/* Sidebar Filter - Hidden on mobile unless toggled */}
  <aside 
    className={`w-full md:w-[300px] h-[calc(100vh-69px)] overflow-hidden ${!showFilter ? "max-md:hidden" : ""} sticky left-0 top-[69px] z-3 sm:border-r sm:border-r-[var(--border)]/21`}
  >
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 shadow-sm sticky top-0 left-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-indigo-600">
            <IoFilterSharp className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-xl text-slate-900">Filters</h2>
        </div>
        <button 
          className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
          onClick={() => setShowFilter(false)}
        >
          <AiOutlineClose className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin">
        {/* Course Prices */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Course Prices</h3>
          <div className="flex flex-wrap gap-2">
            {["All", ...prices].map((price, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${filters.prices === idx 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "bg-slate-100/65 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {price}
              </button>
            ))}
          </div>
        </section>

        {/* Course Levels */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Course Level</h3>
          <div className="flex flex-wrap gap-2">
            {["All", ...levels].map((lev, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${filters.levels.includes(idx) 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-slate-100/65 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {lev}
              </button>
            ))}
          </div>
        </section>

        {/* Skills Search */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skills</h3>
            <div className="relative group">
                <input 
                className="w-full px-3 py-3 bg-slate-50 text-black/81 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                placeholder="Search skills..."
                onFocus={() => !showSkilDropdown && setShowSkilDropdown(true)}
                />
                <MdKeyboardArrowDown onClick={() => setShowSkilDropdown(!showSkilDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 w-5 h-5 ${!showSkilDropdown ? "rotate-0" : "rotate-180"}`} />
            </div>

            <div className={`dropdown dropdown_${showSkilDropdown} mt-2 border border-slate-100 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                <div className="bg-white max-h-[250px] overflow-y-auto w-full">
                    {skills.map((skill, skill_idx) => {
                        // Replace 'selectedSkills' with your actual state array
                        const isSelected = filters.skills.includes(skill_idx);

                        return (
                        <button 
                            key={`skill_id_${skill_idx}`}
                            type="button"
                            onClick={() => handleToggleSkill(skill_idx)} // Logic to add/remove from array
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-all border-b last:border-0 border-slate-50 group
                            ${isSelected ? "bg-indigo-50/60 text-indigo-700" : "hover:bg-slate-50 text-slate-600"}
                            `}
                        >
                            <div className="flex items-center gap-x-3">
                            {/* Custom Checkbox UI */}
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all
                                ${isSelected 
                                ? "bg-indigo-600 border-indigo-600 shadow-sm" 
                                : "bg-white border-slate-300 group-hover:border-indigo-400"
                                }`}
                            >
                                {isSelected && <IoMdCheckmark className="text-white w-3.5 h-3.5 stroke-[2px]" />}
                            </div>
                            
                            <span className={`font-medium ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                                {skill}
                            </span>
                            </div>

                            {/* Optional: Simple dot or count indicator if needed */}
                            {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            )}
                        </button>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Course Levels */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Course Level</h3>
          <div className="flex flex-wrap gap-2">
            {["All", ...duration].map((lev, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${filters.duration.includes(idx) 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-slate-100/65 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {lev}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Apply Footer (Sticky) */}
      <div className="p-5 border-t border-t-[var(--border)]/15 bg-slate-50/50">
        <button className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95">
          <BiEditAlt className="w-5 h-5" />
          Apply Filters
        </button>
      </div>
    </div>
  </aside>

  {/* Main Content */}
  <main className={`flex-1 min-w-0 ${showFilter ? "max-md:hidden" : ""}`}>
    {/* Sub-header */}
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowFilter(true)}
          className="md:hidden p-2 bg-slate-50 border border-slate-200 rounded-lg"
        >
          <IoFilterSharp className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-extrabold text-slate-900">Courses</h2>
      </div>

      <div className="flex gap-2">
        {[
          { name: 'Trending', icon: MdWhatshot },
          { name: 'New', icon: MdOutlineWbTwilight },
          { name: 'Top', icon: RiMedalLine }
        ].map((btn) => (
          <button 
            key={btn.name}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${topFilter === btn.name 
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
          onClick={() => setTopFilter(btn.name)}
          >
            <btn.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{btn.name}</span>
          </button>
        ))}
      </div>
    </header>

    {/* Course Grid */}
    <div className="p-6">
      {
        loading ?
        <div className="text-md text-black">Loading...</div>
        :
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
                alt={course.courseName} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                 <span className="text-xs font-bold text-indigo-600">{course.courseAmount}</span>
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
      }
    </div>
  </main>
</div>
    )
}