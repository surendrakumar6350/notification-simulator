import React, { useState } from 'react';
import { Shield, Phone, MessageCircle, Upload, AlertCircle, Mail } from 'lucide-react';

interface MobileProtectionFormProps {
    onSubmitRequest: (request: {
        mobileNumber: string;
        message: string;
        screenshot?: File | null;
    }) => void;
}

const MobileProtectionForm: React.FC<MobileProtectionFormProps> = ({ onSubmitRequest }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [message, setMessage] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mobileNumber.trim() || !message.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmitRequest({
                mobileNumber: mobileNumber.trim(),
                message: message.trim(),
                screenshot
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setScreenshot(file);
        }
    };

    const removeScreenshot = () => {
        setScreenshot(null);
        // Reset the file input
        const fileInput = document.getElementById('screenshot') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Number Protection Request
                </h2>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-blue-700 dark:text-blue-300">
                            An instant email will be sent to our team for review. If your request is genuine,
                            your number will be added to the protection list immediately.
                        </p>
                    </div>
                </div>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mobile Number */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="w-4 h-4" />
                        Mobile Number *
                    </label>
                    <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter your 10-digit mobile number"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                    />
                </div>

                {/* Message */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MessageCircle className="w-4 h-4" />
                        How are you affected? *
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe how you are being affected by spam/harassment messages. Include details about frequency, content, and impact..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        rows={5}
                        maxLength={1000}
                        required
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.length}/1000 characters
                    </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Upload className="w-4 h-4" />
                        Screenshot Evidence (Optional)
                    </label>

                    {!screenshot ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Upload a screenshot of spam/harassment messages
                            </p>
                            <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                                Choose File
                                <input
                                    id="screenshot"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScreenshotChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {screenshot.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(screenshot.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeScreenshot}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                                Important Notice
                            </p>
                            <p className="text-amber-700 dark:text-amber-300">
                                Please ensure all information provided is accurate. False reports may result in
                                rejection of your protection request.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!mobileNumber.trim() || !message.trim() || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
            disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
            text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 
            transform hover:scale-[1.02] active:scale-[0.98]
            flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting Request...
                        </>
                    ) : (
                        <>
                            <Shield className="w-4 h-4" />
                            Submit Protection Request
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default MobileProtectionForm;