"use client";

import { Moon, Sun, User, Cpu, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useInvoiceStore } from "@/features/dashboard/store/useInvoiceStore";

export function Header() {
    const [isDark, setIsDark] = useState(false);
    const extractionSource = useInvoiceStore((state) => state.extractionSource);
    const setExtractionSource = useInvoiceStore((state) => state.setExtractionSource);
    const selectedEntityName = useInvoiceStore((state) => state.selectedEntityName);
    const userName = useInvoiceStore((state) => state.userName);

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
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                            src="/logo-dipu.png"
                            alt="Logo Diputación de Sevilla"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
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
                </div>

                <div className="flex items-center gap-4">
                    {/* Extraction Source Selector */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setExtractionSource('tesseract')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${extractionSource === 'tesseract'
                                ? 'bg-white dark:bg-slate-700 text-brand-green shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            title="Usar OCR Local (Tesseract)"
                        >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>OCR Local</span>
                        </button>
                        <button
                            onClick={() => setExtractionSource('azure')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${extractionSource === 'azure'
                                ? 'bg-white dark:bg-slate-700 text-brand-green shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            title="Usar Azure Document Intelligence"
                        >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Azure AI</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-none">Usuario Conectado</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] font-medium">{userName || "admin@dipusevilla.es"}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 dark:border-primary/40 shadow-inner">
                            <User className="w-5 h-5 text-primary dark:text-primary-foreground" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Context Bar (Sub-header) */}
            {selectedEntityName && (
                <div className="bg-primary/5 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-extrabold text-primary dark:text-primary-foreground uppercase tracking-widest">Trabajando en:</span>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{selectedEntityName}</span>
                    </div>
                    <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                        Sesión iniciada: {new Date().toLocaleDateString('es-ES')}
                    </div>
                </div>
            )}
        </header>
    );
}
