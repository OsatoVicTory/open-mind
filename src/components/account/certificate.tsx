"use client";

import { useRef, useState } from "react";
import logo from "../../assets/agrow-no-bg-full.png";
import AutoScalingText from "../ui/scaleText";
import Image from "next/image";
// import { toPng } from "html-to-image";

interface CertificateData {
  name: string;
  course: string;
  date: string;
  id: string;
}

export default function CertificateGenerator() {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CertificateData>({
    name: "Johnny Doelingwaret",
    course: "Solana Blockchain Development",
    date: new Date().toLocaleDateString(),
    id: "OM-99283-X",
  });

  const downloadCertificate = async () => {
    if (certificateRef.current === null) return;

    try {
      // Increase pixel ratio for high-quality (2x or 3x)
    //   const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
      
    //   const link = document.createElement("a");
    //   link.download = `${data.name.replace(/\s+/g, "_")}_Certificate.png`;
    //   link.href = dataUrl;
    //   link.click();
    } catch (err) {
      console.error("Oops, something went wrong!", err);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-fit text-white">
      {/* Control Panel */}
      <div className="mb-8 space-x-4">
        <button
          onClick={downloadCertificate}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition"
        >
          Download PNG
        </button>
      </div>

      {/* The Certificate DOM Element */}
      <div
        ref={certificateRef}
        className="relative w-full max-w-[800px] aspect-[1.314/1] bg-white text-gray-800 py-12 flex flex-col items-center justify-between border-[16px] border-double border-gold-500 shadow-2xl overflow-hidden"
        style={{ borderColor: "#D4AF37" }} // Gold Border
      >
        {/* Background Watermark/Pattern Decor */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-gold-500" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-gold-500" />
        </div>
        
        <div className="flex items-center gap-x-3 absolute top-6 left-8 z-1">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-100 group-hover:rotate-6 transition-transform">
                <Image 
                src={logo} 
                alt="logo" 
                className="w-6 h-6 brightness-0 invert" 
                />
            </div>
        </div>

        <div className="text-center mt-1">
          <h1 className="text-5xl font-serif mb-2 uppercase tracking-widest text-gray-900">
            Certificate of Completion
          </h1>
          <p className="text-lg italic text-gray-600">This is to certify that</p>
        </div>

        <div className="text-center w-full">
          <div className="text-6xl font-bold border-b-2 border-gray-300 inline-block px-12 py-2 mb-4 font-serif text-blue-900">
            {/* {data.name || "Your Name Here"} */}
            <AutoScalingText
                text={data.name} 
                maxWidth={600} // Set the max width the name can take
                className="text-6xl font-bold font-serif text-blue-900 px-2"
            />
          </div>
          <p className="text-xl">has successfully completed the course</p>
          <div className="text-3xl font-semibold mt-2 text-gray-700">
            <AutoScalingText 
                text={data.course} 
                maxWidth={700} // Slightly wider allowed for course titles
                className="text-3xl font-semibold text-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-between w-full mt-8 px-12 items-end">
          <div className="text-center border-t border-gray-400 pt-2 w-48">
            <p className="text-sm font-bold">Authorized Signature</p>
            <p className="text-xs text-gray-500">Program Director</p>
          </div>
          
          {/* Mock Seal */}
          <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-500 flex items-center justify-center text-yellow-700 font-bold text-center text-[10px] transform -rotate-12 shadow-lg">
             OFFICIAL <br/> OPENMIND <br/> SEAL
          </div>

          <div className="text-center border-t border-gray-400 pt-2 w-48">
            <p className="text-sm font-bold">{data.date}</p>
            <p className="text-xs text-gray-500">Date Issued</p>
          </div>
        </div>

        <p className="absolute bottom-4 text-[10px] text-gray-400 uppercase tracking-tighter">
          Verification ID: {data.id}
        </p>
      </div>
    </div>
  );
}