"use client";

import { useInvoiceStore } from "../store/useInvoiceStore";
import { SearchBar } from "./SearchBar";
import { InvoiceCard } from "./InvoiceCard";
import { PDFPreview } from "./PDFPreview";
import { Save, CheckCircle } from "lucide-react";

export function DashboardView() {
    const { getFilteredInvoices } = useInvoiceStore();
    const filteredInvoices = getFilteredInvoices();

    const handleSaveToSical = () => {
        alert("Simulando exportación a SICAL...\nLos datos y los PDFs serían enviados al servicio web externo.");
    };

    return (
        <div className="flex flex-col gap-4">
            <SearchBar />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: List of Invoices */}
                <div className="lg:col-span-2 space-y-4">
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

                {/* Right Column: PDF Preview Sidebar */}
                <div className="space-y-4">
                    <PDFPreview />
                </div>
            </div>
        </div>
    );
}
