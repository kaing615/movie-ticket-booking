import React from "react";

function Logo({ className = "", ...props }) {
  return (
    <div
      className={`flex items-center space-x-2 ${className}`}
      {...props}
    >
      <span className="text-2xl font-bold text-[#F26B38] tracking-widest">
        CINEMA
      </span>
      <span className="text-2xl font-bold text-blue-700 tracking-widest">
        GATE
      </span>
    </div>
  );
}

export default Logo;
