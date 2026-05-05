"use client";

import Image from "next/image";
import logo from "../../assets/agrow-no-bg-full.png";

export const Spinner = ({ className }: { className?: string }) => {
    return (
        <div className={`${className||""} loading-spinner`}></div>
    )
};


export const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`${className||""} Skeleton`}></div>
    );
};

export const FormatTokenPrice = ({ price }: { price: any }) => {
    const [f, s] = String(price).split(".");
    let spl = s || "";
    let i = 0;

    if(s) {
        while(i < s.length && s[i] == "0") i++;
        if(i > 3) spl = s.slice(i, i+4);
    }

    return (
        <span title={price}>
            {f}
            {s && <>
                {"."}
                {i > 3 && <sub>{`(${i})`}</sub>}
                {spl}
            </>}
        </span>
    )
};

export const PageLoader = () => {

    return (
        <div className="flex w-full justify-center min-h-[60vh] items-center flex-col gap-x-3">
            <div className="relative group">
                {/* 1. Outer Glow Aura */}
                <div className="absolute inset-0 bg-indigo-500/40 rounded-xl blur-xl animate-pulse" />

                {/* 2. Rotating Border Frame */}
                <div className="absolute -inset-1 border border-indigo-400/20 rounded-xl animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* 3. Main Logo Container */}
                <div className="relative bg-indigo-600 p-7 rounded-xl shadow-md shadow-indigo-100 group-hover:rotate-6 transition-all duration-500 ease-in-out hover:shadow-indigo-400/50">
                    
                    {/* 4. Shimmer Sweep Effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                    </div>

                    <Image 
                        src={logo} 
                        alt="logo" 
                        className="w-15 h-15 brightness-0 invert relative z-10 animate-[pulse_3s_ease-in-out_infinite]" 
                    />
                </div>
            </div>
            
            {/* Optional: Text that appears/pulses next to it */}
            <p className="text-xl mt-6 font-bold tracking-widest text-indigo-400 uppercase animate-pulse">
                Loading...
            </p>


        </div>
    )
};