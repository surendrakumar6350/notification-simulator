import React from 'react';
import { Shield } from 'lucide-react';

interface MobileProtectionTriggerProps {
    onClick: () => void;
}

const MobileProtectionTrigger: React.FC<MobileProtectionTriggerProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium 
        transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] 
        shadow-md hover:shadow-lg overflow-hidden"
        >
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 
        opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm">Request Mobile Protection</span>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
        bg-gradient-to-r from-transparent via-white/20 to-transparent 
        transition-transform duration-700 ease-out rounded-lg" />
        </button>
    );
};

export default MobileProtectionTrigger;
