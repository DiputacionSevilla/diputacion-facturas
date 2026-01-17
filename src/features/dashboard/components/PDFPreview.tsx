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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm flex flex-col h-[900px] min-h-[900px] lg:sticky lg:top-[120px] transition-all duration-300">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <FileText className="w-3.5 h-3.5" />
                    Doc: {selectedInvoice.pdfFileName || "Factura"}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    {selectedInvoice.ocrText && (
                        <button
                            onClick={() => alert(`TEXTO EXTRAÍDO (OCR):\n\n${selectedInvoice.ocrText}`)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[9px] font-bold rounded text-slate-700 dark:text-slate-200 transition-all uppercase"
                        >
                            <Eye className="w-3 h-3" />
                            Debug OCR
                        </button>
                    )}
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

            <div className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-start overflow-hidden p-2">
                {selectedInvoice.pdfUrl ? (
                    <div className="w-full h-full shadow-lg border border-slate-300 dark:border-slate-700 bg-white rounded-sm">
                        <iframe
                            src={`${selectedInvoice.pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                            className="w-full h-full border-none"
                            title="PDF Preview"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <FileText className="w-12 h-12 opacity-20" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">No hay archivo disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
}
