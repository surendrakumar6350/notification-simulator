import React from 'react';
import { X } from 'lucide-react';
import MobileProtectionForm from './MobileProtectionForm';

interface MobileProtectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitRequest: (request: {
        mobileNumber: string;
        message: string;
        screenshot?: File | null;
    }) => void;
}

const MobileProtectionModal: React.FC<MobileProtectionModalProps> = ({
    isOpen,
    onClose,
    onSubmitRequest
}) => {
    if (!isOpen) return null;

    const handleSubmit = (request: {
        mobileNumber: string;
        message: string;
        screenshot?: File | null;
    }) => {
        onSubmitRequest(request);
        onClose(); // Close modal after submission
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 scrollbar-custom">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 
        rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                    <X className="w-5 h-5 text-gray-600 dark:text-white" />
                </button>

                {/* Mobile Protection Form */}
                <MobileProtectionForm onSubmitRequest={handleSubmit} />
            </div>
        </div>
    );
};

export default MobileProtectionModal;