import React from 'react';

export const StarBorder = ({ children, className = "", onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-block overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-neutral-900 ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl transition-colors hover:bg-blue-700">
        {children}
      </span>
    </button>
  );
};
