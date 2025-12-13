
import React from "react";

interface LoadingSpinnerIconProps {
  className?: string;
}

const LoadingSpinnerIcon: React.FC<LoadingSpinnerIconProps> = ({ className }) => {
  return (
    <div className={`flex gap-4 flex-wrap justify-center items-center ${className || ''}`}>
      <img
        className="w-5 h-5 animate-spin"
        src="https://www.svgrepo.com/show/173880/loading-arrows.svg"
        alt="Loading icon"
      />
    </div>
  );
};

export default LoadingSpinnerIcon;
