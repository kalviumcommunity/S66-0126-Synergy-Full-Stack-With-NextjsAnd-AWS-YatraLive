'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Train, Settings, Star } from 'lucide-react';
import Link from 'next/link';

/**
 * Mobile navigation menu
 */
export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Menu button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                        />

                        {/* Menu panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-50 md:hidden"
                        >
                            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                                <h2 className="font-semibold">Menu</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="p-4">
                                <MobileNavItem
                                    href="/"
                                    icon={<Home />}
                                    label="Home"
                                    onClick={() => setIsOpen(false)}
                                />
                                <MobileNavItem
                                    href="/trains"
                                    icon={<Train />}
                                    label="All Trains"
                                    onClick={() => setIsOpen(false)}
                                />
                                <MobileNavItem
                                    href="/favorites"
                                    icon={<Star />}
                                    label="Favorites"
                                    onClick={() => setIsOpen(false)}
                                />
                                <MobileNavItem
                                    href="/admin"
                                    icon={<Settings />}
                                    label="Admin"
                                    onClick={() => setIsOpen(false)}
                                />
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

interface MobileNavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

function MobileNavItem({ href, icon, label, onClick }: MobileNavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <span className="w-5 h-5">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
