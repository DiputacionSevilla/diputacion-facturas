"use client";

import { useInvoiceStore } from "../store/useInvoiceStore";
import { FileText, Download, Eye, Verified } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function PDFPreview() {
    const { getSelectedInvoice } = useInvoiceStore();
    const selectedInvoice = getSelectedInvoice();

    if (!selectedInvoice) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm flex flex-col h-[400px] lg:h-auto items-center justify-center p-8 text-slate-400 italic text-xs">
                <FileText className="w-12 h-12 mb-2 opacity-20" />
                Selecciona una factura para previsualizar
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm flex flex-col h-[400px] lg:h-auto lg:sticky lg:top-[120px]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <FileText className="w-3.5 h-3.5" />
                    Miniatura: {selectedInvoice.pdfFileName || "Factura"}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <Eye className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600 transition-colors" />
                    <Download className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600 transition-colors" />
                </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 flex flex-col items-center justify-center overflow-auto custom-scrollbar">
                {/* Visual representation of a PDF document */}
                <div className="w-full max-w-[180px] aspect-a4 bg-white dark:bg-slate-800 shadow-xl p-3 rounded-sm relative border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-5 h-5 bg-green-50 dark:bg-green-900/30 rounded flex items-center justify-center">
                            <span className="text-[10px] text-brand-green font-bold">D</span>
                        </div>
                        <div className="text-right">
                            <div className="h-1 w-8 bg-slate-200 dark:bg-slate-700 rounded-full mb-1"></div>
                            <div className="h-1 w-10 bg-brand-green/30 rounded-full"></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-1 w-2/3 bg-slate-100 dark:bg-slate-700 rounded-full"></div>

                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 space-y-1">
                            <div className="flex justify-between">
                                <div className="h-1 w-8 bg-slate-50 dark:bg-slate-700/50 rounded-full"></div>
                                <div className="h-1 w-6 bg-slate-50 dark:bg-slate-700/50 rounded-full"></div>
                            </div>
                            <div className="flex justify-between">
                                <div className="h-1 w-8 bg-slate-50 dark:bg-slate-700/50 rounded-full"></div>
                                <div className="h-1 w-6 bg-slate-50 dark:bg-slate-700/50 rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                <div className="h-1 w-10 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                                <div className="h-1 w-8 bg-brand-green/40 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-10">
                        <Verified className="w-8 h-8" />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm cursor-pointer">
                        <span className="text-[8px] font-bold text-primary uppercase">Ver Completo</span>
                    </div>
                </div>
                <p className="mt-4 text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                    Previsualización IA
                </p>
            </div>
        </div>
    );
}
