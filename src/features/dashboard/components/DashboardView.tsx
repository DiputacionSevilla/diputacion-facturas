"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { SearchBar } from "./SearchBar";
import { InvoiceCard } from "./InvoiceCard";
import { PDFPreview } from "./PDFPreview";
import { Save, CheckCircle, GripVertical } from "lucide-react";

export function DashboardView() {
    const { getFilteredInvoices } = useInvoiceStore();
    const filteredInvoices = getFilteredInvoices();

    // Estado para el montaje y el ancho del panel izquierdo
    const [mounted, setMounted] = useState(false);
    const [leftWidth, setLeftWidth] = useState(60);
    const isResizing = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSaveToSical = () => {
        alert("Simulando exportación a SICAL...\nLos datos y los PDFs serían enviados al servicio web externo.");
    };

    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const onResize = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;

        // Calcular nuevo porcentaje basado en el ancho de la ventana
        const newWidth = (e.clientX / window.innerWidth) * 100;

        // Límites de seguridad (25% - 75%)
        if (newWidth > 20 && newWidth < 80) {
            setLeftWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onResize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [onResize, stopResizing]);

    // Calcular anchos solo tras el montaje
    const calculatedLeftWidth = mounted ? `${leftWidth}%` : '60%';
    const calculatedRightWidth = mounted ? `${100 - leftWidth}%` : '40%';

    return (
        <div className="flex flex-col gap-4 w-full">
            <SearchBar />

            <div className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden shadow-sm min-h-[calc(100vh-200px)]">
                {/* Left Column: List of Invoices */}
                <div
                    style={{ width: mounted && typeof window !== 'undefined' && window.innerWidth > 1024 ? calculatedLeftWidth : '100%' }}
                    className="p-4 lg:p-6 space-y-4"
                >
                    <div className="flex justify-between items-center px-1">
                        <div className="flex gap-3 text-[10px] font-bold">
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-accent-green rounded-full"></span>
                                <span className="text-slate-500 uppercase">Correcto</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-accent-red rounded-full"></span>
                                <span className="text-slate-500 uppercase">Revisión Requerida</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                            {filteredInvoices.length} factura(s) encontradas
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceCard key={invoice.id} invoice={invoice} />
                        ))}

                        {filteredInvoices.length === 0 && (
                            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                                <CheckCircle className="w-12 h-12 opacity-10" />
                                <p className="text-xs uppercase tracking-widest font-bold">Carga archivos PDF para comenzar</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSaveToSical}
                        disabled={filteredInvoices.length === 0}
                        className="bg-primary text-white p-4 rounded-sm shadow-lg flex items-center gap-4 hover:brightness-110 transition group w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="border-2 border-white/30 rounded p-1 group-hover:border-white/60 transition">
                            <Save className="w-5 h-5 font-bold" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-sm leading-tight uppercase">GRABAR EN SICAL</div>
                            <div className="text-[9px] opacity-80 uppercase tracking-tighter">
                                CONTABILIZAR FACTURAS VALIDADAS
                            </div>
                        </div>
                    </button>
                </div>

                {/* Divisor / Resizer */}
                <div
                    onMouseDown={startResizing}
                    className="hidden lg:flex w-1.5 hover:w-2 cursor-col-resize bg-slate-200 dark:bg-slate-800 hover:bg-primary/40 transition-all items-center justify-center border-x border-slate-300/30 dark:border-slate-700/30 shrink-0"
                >
                    <GripVertical className="w-4 h-4 text-slate-400/50" />
                </div>

                {/* Right Column: PDF Preview */}
                <div
                    style={{ width: mounted && typeof window !== 'undefined' && window.innerWidth > 1024 ? calculatedRightWidth : '100%' }}
                    className="p-4 lg:p-6 bg-white dark:bg-slate-900 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 min-h-[900px]"
                >
                    <div className="lg:sticky lg:top-[120px]">
                        <PDFPreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
