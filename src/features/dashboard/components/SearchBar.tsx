"use client";

import { Search, Upload, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { processFileWithOCR } from "../services/ocrService";
import { Invoice } from "@/shared/types/invoice.types";

export function SearchBar() {
    const { searchQuery, setSearchQuery, addInvoices, isProcessing, setIsProcessing, extractionSource } = useInvoiceStore();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);

        const newInvoices: Invoice[] = [];

        for (const file of acceptedFiles) {
            let ocrData: Partial<Invoice> = {};
            try {
                ocrData = await processFileWithOCR(file, extractionSource);
            } catch (error) {
                console.error("Error processing file:", error);
                ocrData = { hasErrors: true, concept: "Error de procesamiento." };
            }

            const invoice: Invoice = {
                id: Math.random().toString(36).substring(7),
                pdfFileName: file.name,
                pdfUrl: URL.createObjectURL(file),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'pending',

                // 14 Fields Initialization
                registrationDate: new Date().toLocaleDateString('es-ES'),
                registrationNumber: "",
                invoiceDate: "",
                invoiceNumber: "",
                supplierNIF: "",
                supplierName: "",
                concept: "",
                sicalOffice: "",
                sicalArea: "",
                baseAmount: 0,
                taxPercent: 21,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,

                ...ocrData,
            };
            newInvoices.push(invoice);
        }

        addInvoices(newInvoices);
        setIsProcessing(false);
    }, [addInvoices, setIsProcessing, extractionSource]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        }
    });

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800 flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Proveedor / CIF / Nº Factura..."
                        className="w-full h-9 border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded text-xs px-3 pr-10 outline-none focus:ring-1 focus:ring-primary/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
                <div {...getRootProps()} className="cursor-pointer">
                    <input {...getInputProps()} />
                    <button className="bg-primary text-white h-9 px-4 rounded flex items-center gap-2 text-xs font-bold hover:brightness-110 transition-all">
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        {isDragActive ? "Suelta aquí" : "Cargar Facturas"}
                    </button>
                </div>
            </div>
        </div>
    );
}
