"use client";

import { Search, Upload, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { processFileWithOCR } from "../services/ocrService";
import { Invoice } from "@/shared/types/invoice.types";

export function SearchBar() {
    const { searchQuery, setSearchQuery, addInvoices, isProcessing, setIsProcessing } = useInvoiceStore();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);

        const newInvoices: Invoice[] = [];

        for (const file of acceptedFiles) {
            try {
                const ocrData = await processFileWithOCR(file);
                const invoice: Invoice = {
                    id: Math.random().toString(36).substring(7),
                    pdfFileName: file.name,
                    pdfUrl: URL.createObjectURL(file), // Real PDF preview would use this
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'pending',
                    supplierName: "",
                    supplierNIF: "",
                    receiverName: "Diputación de Sevilla",
                    receiverNIF: "P4100000I",
                    invoiceNumber: "",
                    invoiceDate: "",
                    description: "",
                    concept: "",
                    baseAmount: 0,
                    vatRate: 21,
                    vatAmount: 0,
                    totalAmount: 0,
                    ...ocrData,
                };
                newInvoices.push(invoice);
            } catch (error) {
                console.error("Error processing file:", error);
                // Fallback or alert could be added here
            }
        }

        addInvoices(newInvoices);
        setIsProcessing(false);
    }, [addInvoices, setIsProcessing]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
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
