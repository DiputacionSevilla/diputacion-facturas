"use client";

import { Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains("dark")) {
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
        setIsDark(!isDark);
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 sticky top-0 z-50">
            <div className="w-full flex justify-between items-center gap-2">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-brand-green flex flex-wrap items-center">
                        PaperToSic@l{" "}
                        <span className="text-[8px] font-normal text-slate-400 ml-1 tracking-widest uppercase">
                            @AI-Powered
                        </span>
                    </h1>
                    <span className="text-[9px] text-slate-500 font-bold uppercase truncate">
                        Diputación Provincial de Sevilla
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
                        <User className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
            </div>
        </header>
    );
}
