"use client";

import { Skeleton } from "@/components/ui/loading";
import { useEffect, useMemo, useState } from "react";
import { IoTimerOutline } from "react-icons/io5";
import { LuBadgeCheck } from "react-icons/lu";
import { MdOutlineGeneratingTokens } from "react-icons/md";
import { PiCertificate } from "react-icons/pi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

export default function Dashboard() {
  const [cardDataLoading, setCardDataLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setCardDataLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const cardArr = [
    { name: "Active Courses", value: "10", icon: IoTimerOutline, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Completed Courses", value: "3", icon: LuBadgeCheck, color: "text-green-600", bg: "bg-green-50" },
    { name: "Certifications", value: "30", icon: PiCertificate, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Wallet Balance", value: "100.00", icon: RiMoneyDollarCircleLine, tk: "$AGR", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50/50 px-4 md:px-8 pb-10 text-slate-900">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pt-8 pb-6 gap-4">
        <div>
          <h1 className="text-slate-500 text-sm font-medium mb-1">Welcome back, Tory 👋</h1>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Overview</h2>
        </div>
        
        <button className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-xl py-3 px-6 shadow-lg shadow-indigo-200 font-semibold text-sm">
          <MdOutlineGeneratingTokens className="w-5 h-5" />
          <span>Tokenize Asset</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cardDataLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-8" />
                </div>
              </div>
            ))
          : cardArr.map((card, index) => (
              <div
                key={index}
                className="group bg-white hover:bg-slate-50 transition-all duration-300 border border-slate-200 hover:border-indigo-200 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col gap-4">
                  <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{card.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{card.value}</span>
                      {card.tk && <span className="text-xs font-bold text-slate-400">{card.tk}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Chart Placeholder */}
        <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Storage Usage Over Time</h3>
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div className="w-full h-[250px] bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 italic">
             Bar Chart Component Here
          </div>
        </section>

        {/* Activity Feed */}
        <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {[
              { title: "Asset Tokenized", desc: "Green Farms was tokenized", time: "2h ago", icon: "💎" },
              { title: "Asset Added", desc: "Green Farms added to assets", time: "3h ago", icon: "📂" },
              { title: "Payment Processed", desc: "Loan payment completed", time: "1d ago", icon: "✅" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Assets Table/Section */}
      <section className="mt-8">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
            <h3 className="text-lg font-bold">Your Assets</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline">
              View All Assets
            </button>
          </div>
          <div className="p-12 text-center text-slate-400">
            {/* List or Table component would go here */}
            <p>No asset records to display in detailed view.</p>
          </div>
        </div>
      </section>
    </div>
  );
}