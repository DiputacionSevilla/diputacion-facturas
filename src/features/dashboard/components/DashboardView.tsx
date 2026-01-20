"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { SearchBar } from "./SearchBar";
import { InvoiceCard } from "./InvoiceCard";
import { PDFPreview } from "./PDFPreview";
import { SideralModal } from "./SideralModal";
import { Save, CheckCircle, GripVertical, Cloud } from "lucide-react";
import { getAreas } from "../services/areaService";

export function DashboardView() {
    const { getFilteredInvoices, toggleSelectAll, setAreas, selectedEntityCode } = useInvoiceStore();
    const filteredInvoices = getFilteredInvoices();

    // Estado para el montaje y el ancho del panel izquierdo
    const [mounted, setMounted] = useState(false);
    const [leftWidth, setLeftWidth] = useState(60);
    const [isSideralOpen, setIsSideralOpen] = useState(false);
    const isResizing = useRef(false);

    useEffect(() => {
        setMounted(true);
        // Cargar áreas filtradas por la entidad seleccionada
        getAreas(selectedEntityCode || undefined).then(setAreas);
    }, [setAreas, selectedEntityCode]);

    const handleSaveToSical = () => {
        alert("Simulando exportación a SICAL...\nContabilizando facturas validadas en el sistema económico.");
    };

    const handleSideralConfirm = (data: { office: string; area: string }) => {
        alert(`Simulando exportación a SIDERAL...\nOficina: ${data.office}\nÁrea: ${data.area}\nContabilizando y registrando automáticamente.`);
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
        const newWidth = (e.clientX / window.innerWidth) * 100;
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
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer"
                                checked={filteredInvoices.length > 0 && filteredInvoices.every((i: any) => i.selected)}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Marcar todo como validado</span>
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleSaveToSical}
                            disabled={filteredInvoices.length === 0}
                            className="bg-primary text-white p-4 rounded-sm shadow-lg flex items-center gap-4 hover:brightness-110 transition group justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                            title="Contabilizar facturas validadas"
                        >
                            <div className="border border-white/30 rounded p-1.5 group-hover:border-white/60 transition">
                                <Save className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm leading-tight uppercase">GRABAR EN SICAL</div>
                                <div className="text-[8px] opacity-70 uppercase tracking-tighter">
                                    Contabilizar facturas validadas
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsSideralOpen(true)}
                            disabled={filteredInvoices.length === 0}
                            className="bg-brand-green text-white p-4 rounded-sm shadow-lg flex items-center gap-4 hover:brightness-110 transition group justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-black/10"
                            title="Contabilizar facturas validadas y registro automático en Sideral"
                        >
                            <div className="border border-white/30 rounded p-1.5 group-hover:border-white/60 transition">
                                <Cloud className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm leading-tight uppercase">GRABAR EN SIDERAL</div>
                                <div className="text-[8px] opacity-70 uppercase tracking-tighter">
                                    Registro automático y contabilidad
                                </div>
                            </div>
                        </button>
                    </div>
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

            <SideralModal
                isOpen={isSideralOpen}
                onClose={() => setIsSideralOpen(false)}
                onConfirm={handleSideralConfirm}
            />
        </div>
    );
}
