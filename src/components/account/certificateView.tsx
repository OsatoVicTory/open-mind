"use client";

import { useRef, useState } from "react";
import logo from "../../assets/agrow-no-bg-full.png";
import Image from "next/image";
// import { toPng } from "html-to-image";


export default function CertificateViewer({ selectedCert }: { selectedCert: any }) {
  const certificateRef = useRef<HTMLDivElement>(null);
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
        className="relative w-full max-w-[800px] aspect-[1.314/1] bg-white text-gray-800 py-12 flex flex-col items-center justify-between shadow-2xl overflow-hidden"
        style={{ borderColor: "#D4AF37" }} // Gold Border
      >
        <div className="w-full h-full">
            <Image 
                src={logo}
                // src={selectedCert.certificateUrl} 
                alt={"certificate"} 
                fill
                className="object-cover"
            />
        </div>
      </div>
    </div>
  );
}