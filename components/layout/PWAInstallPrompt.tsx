'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA install prompt component
 *
 * Shows when the app is installable
 */
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show our custom install prompt
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        // Clear the saved prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold">Install Train Tracker</h3>
                        </div>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Install this app on your device for quick access to live train updates, even offline.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Install
                        </button>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
