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
                    <a
                        href={selectedInvoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-600 transition-colors"
                        title="Ver en pantalla completa"
                    >
                        <Eye className="w-3.5 h-3.5 cursor-pointer" />
                    </a>
                    <a
                        href={selectedInvoice.pdfUrl}
                        download={selectedInvoice.pdfFileName || "factura.pdf"}
                        className="hover:text-slate-600 transition-colors"
                        title="Descargar PDF"
                    >
                        <Download className="w-3.5 h-3.5 cursor-pointer" />
                    </a>
                </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                {selectedInvoice.pdfUrl ? (
                    <iframe
                        src={`${selectedInvoice.pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                        <FileText className="w-12 h-12 opacity-20" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">No hay archivo disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
}
