import React, { useRef, useState, useEffect, useLayoutEffect } from "react";

// Helper component for auto-scaling text
const AutoScalingText = ({ text, maxWidth, className }: { text: string; maxWidth: number; className: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  // useLayoutEffect runs before the browser paints, preventing "flicker"
  useLayoutEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current.offsetWidth;
      if (textWidth > maxWidth) {
        setScale(maxWidth / textWidth);
      } else {
        setScale(1);
      }
    }
  }, [text, maxWidth]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: `${maxWidth}px` }} 
      className="flex justify-center items-center overflow-hidden"
    >
      <span
        ref={textRef}
        className={className}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default AutoScalingText;