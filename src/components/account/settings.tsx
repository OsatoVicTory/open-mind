"use client";

import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID, useOpenMind } from "@/hooks/useOpenMind";
import { useRouter } from "next/navigation";

export const AccountSettings = ({ headerName, setShowFilter }: { headerName: string, setShowFilter: (val: boolean) => void }) => {

    const { getProgram, userPublicKey, getUserPDA } = useOpenMind();
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const editUserRef = [
        "user_name",
        "first_name", 
        "last_name", 
        "description", 
        "img_url",   
        "enrolled_courses_count",
        "linkedin_url",   
        "instagram_url",   
        "twitter_url", 
        "instructor",
        "created_courses_count", 
        "certifications"
    ];
    

    const ref = [
        "user_name",
        "first_name", 
        "last_name", 
        "description", 
        "img_url",   
        "enrolled_courses_count",
        "linkedin_url",   
        "instagram_url",   
        "twitter_url", 
        "instructor",
        "created_courses_count",
    ];

    const handleEditUser = async () => {
        if(loading) return;
        setLoading(true);
        try {
            const program = getProgram();
            if (!program || !userPublicKey) {
                throw new Error("Wallet not connected or Program failed to load.");
            }

            const userPDA = getUserPDA();
            const d = { ...data };
            d["img_url"] = "none just vibez";
            d["instructor"] = true;
            console.log(d);

            // 2. Initialize Campaign
            await program.methods.editUser(
                ...editUserRef.map(_r => {
                    if(d[_r]) return d[_r];
                    else return 0;
                })
            ).accounts({
                signer: userPublicKey,
                user: userPDA,
                systemProgram: SystemProgram.programId,
            } as any).rpc();
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    const handleGetUser = async () => {
        try {
            const program = getProgram();
            if (!program || !userPublicKey) {
                throw new Error("Wallet not connected or Program failed to load.");
            }

            const userPDA = getUserPDA(userPublicKey); 
            console.log(!userPDA ? "null" : userPDA.toString());
            const user = await (program.account as any).user.fetch(userPDA);
            console.log("user", user);
        } catch (err) {
          console.log(err)
        }
    }
  
    return (
    <>
  {/* Header Section */}
  <div className="w-full sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="w-full px-6 py-4 flex items-center gap-x-4">
      <button 
        onClick={() => setShowFilter(true)}
        className="md:hidden p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <IoFilterSharp className="w-5 h-5 text-slate-700" />
      </button>
      <h2 className="text-xl font-bold text-slate-900">{headerName}</h2>
    </div>
  </div>

  <div className="sm:w-8/10 lg:w-[calc(100%-240px)] mt-3 px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
    
    {/* Left Column: Profile Picture */}
    <aside className="flex flex-col items-center w-full lg:w-64 shrink-0">
      <div className="relative group">
        <div className="w-44 h-44 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-black overflow-hidden relative">
          OV
          {/* Subtle Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-tighter">Change Photo</span>
          </div>
        </div>
        <button className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all border-2 border-white">
          <MdEdit className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
        Profile Image
      </p>
    </aside>

    {/* Right Column: Form Fields */}
    <main className="flex-1 space-y-6">
      
      {/* Public Profile Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">Public Profile</h2>
          <p className="text-slate-500 text-sm mt-1">Manage how your information appears to others.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basics Input Group */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Basics</h3>
            <div className="space-y-4">
              {["User Name", "First Name", "Last Name"].map((placeholder) => (
                <div key={placeholder} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">{placeholder}</label>
                  <input 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder={placeholder} onChange={(e) => {
                        const key = placeholder.toLowerCase().split(" ").join("_");
                        setData({ ...data, [key]: e.target.value })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Biography Group */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Biography</h3>
            <div className="space-y-1.5 h-full">
              <label className="text-xs font-bold text-slate-700 ml-1">About You</label>
              <textarea 
                className="w-full bg-white border border-slate-200 rounded-xl resize-none px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 min-h-[145px] resize-none"
                placeholder="Tell us a bit about your background and interests..." 
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Social Links Section */}
      <section className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Social Links</h3>
          <p className="text-xs text-slate-400 mt-1">Connect your profiles to build your network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["LinkedIn", "Twitter", "Instagram"].map((platform) => (
            <div key={platform} className="space-y-2">
              <div className="flex items-stretch group">
                <div className="bg-slate-50 border border-r-0 border-slate-200 px-4 flex items-center rounded-l-xl text-xs font-bold text-slate-500 group-focus-within:border-indigo-500 group-focus-within:bg-indigo-50 transition-colors">
                  {platform}
                </div>
                <input 
                  className="flex-1 bg-white border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                  placeholder={`${platform} profile URL`} onChange={(e) => {
                        const key = platform.toLowerCase() + "_url";
                        setData({ ...data, [key]: e.target.value })
                    }}
                />
              </div>
              <span className="block text-[10px] text-slate-400 italic ml-2">
                Example: {platform.toLowerCase()}.com/username
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="pt-6 flex justify-end items-center gap-4 border-t border-slate-100">
        <button className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        onClick={handleGetUser}>
          Discard Changes
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2"
        onClick={handleEditUser}>
          <LuUpload className="w-5 h-5" />
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </main>
  </div>
</>
    )
};