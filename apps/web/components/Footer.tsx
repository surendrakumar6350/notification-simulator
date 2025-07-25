import React from 'react';
import { Shield } from 'lucide-react';
import FeedbackTrigger from './FeedbackTrigger';
import MobileProtectionTrigger from './MobileProtectionTrigger';

type FooterProps = {
  setIsFeedbackModalOpen: (open: boolean) => void;
  setIsMobileProtectionModalOpen: (open: boolean) => void;
};

const Footer: React.FC<FooterProps> = ({ setIsFeedbackModalOpen, setIsMobileProtectionModalOpen }) => {
  return (
    <footer className="w-full px-4 py-6 border-t border-white/20 dark:border-gray-700/20 backdrop-blur-sm bg-white/5 dark:bg-gray-900/5">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* Top Section: Info + Buttons */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
          {/* Left side text */}
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 opacity-80" />
            <span className="text-xs md:text-sm text-zinc-400 font-light tracking-wide italic">
              Built for educational use only
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            <span className="text-xs md:text-sm text-zinc-400 font-light tracking-wide italic flex items-center gap-1">
              Made with <span className="text-red-400 animate-pulse">❤️</span> by developers
            </span>
          </div>


          {/* Button container */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <FeedbackTrigger onClick={() => setIsFeedbackModalOpen(true)} />
            <MobileProtectionTrigger onClick={() => setIsMobileProtectionModalOpen(true)} />
          </div>
        </div>


        {/* Bottom Section: Copyright */}
        <div className="pt-4 border-t border-white/10 dark:border-gray-700/10 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 SMS Blaster Pro. Use responsibly and in accordance with local laws.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
