"use client";

import React, { useEffect, useRef } from 'react';

const CertificateModal = (
    { isOpen, onClose, title, children } 
    : 
    { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode;}
) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // 1. Click Outside Logic
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // If the modal is open and the click target is NOT inside the modalRef
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 2. Escape Key Logic
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is active
      document.body.style.overflow = 'hidden';
    } 

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`${!isOpen && "hidden"} fixed inset-0 w-screen h-screen overflow-y-auto bg-black/70 backdrop-blur-[4px] z-[9999] flex justify-center`}>
      <div 
        className="bg-gray-900 border border-gray-700 py-5 px-6 w-8/10 shadow-2xl shadow-black/50 flex flex-col"
        ref={modalRef} 
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4 w-full py-2 px-4 sticky top-3 right-0 z-12 bg-gray-900">
          <h3 className="m-0 text-gray-50 font-semibold text-xl">{title}</h3>
          <button onClick={onClose} className="bg-none border-none text-[#9CA3AF] text-[28px] cursor-pointer leading-none">
            &times;
          </button>
        </div>
        <div className="text-gray-300 w-full h-fit mt-1">
          {children}
        </div>
      </div>
    </div>
  );
};


export default CertificateModal;