import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface FeedbackTriggerProps {
  onClick: () => void;
}

const FeedbackTrigger: React.FC<FeedbackTriggerProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 
        hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium 
        transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] 
        shadow-md hover:shadow-lg overflow-hidden"
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-blue-300 
        opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">Share Feedback</span>
        <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
        bg-gradient-to-r from-transparent via-white/20 to-transparent 
        transition-transform duration-700 ease-out rounded-lg" />
    </button>
  );
};

export default FeedbackTrigger;
