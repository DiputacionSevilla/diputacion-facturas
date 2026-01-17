"use client";

import { Invoice } from "@/shared/types/invoice.types";
import { cn } from "@/shared/lib/utils";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";

interface Props {
    invoice: Invoice;
}

export function InvoiceCard({ invoice }: Props) {
    const { updateInvoice, selectedInvoiceId, setSelectedInvoiceId, toggleSelectInvoice, deleteInvoice } = useInvoiceStore();
    const isSelected = selectedInvoiceId === invoice.id;
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleChange = (field: keyof Invoice, value: any) => {
        updateInvoice(invoice.id, { [field]: value });
    };

    return (
        <div
            onClick={() => setSelectedInvoiceId(invoice.id)}
            className={cn(
                "bg-white dark:bg-slate-900 border-l-4 border border-slate-200 dark:border-slate-800 rounded shadow-sm overflow-hidden transition-all cursor-pointer animate-invoice-entry",
                invoice.hasErrors ? "border-l-accent-red" : "border-l-accent-green",
                isSelected && "ring-2 ring-primary/20 bg-slate-50 dark:bg-slate-800/50"
            )}
        >
            <div className="flex items-stretch overflow-hidden">
                {/* Select Checkbox Section */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectInvoice(invoice.id);
                    }}
                    className={cn(
                        "w-12 flex flex-col items-center justify-center gap-4 border-r border-slate-200 dark:border-slate-800 transition-colors",
                        invoice.selected ? "bg-brand-green/10" : "bg-white dark:bg-slate-900"
                    )}
                >
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer"
                        checked={!!invoice.selected}
                        onChange={() => { }} // Handle handled by parent div for larger click area
                    />

                    {/* Trash Icon */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsConfirmingDelete(true);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-colors group"
                        title="Eliminar factura"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3 space-y-3 flex-1 overflow-hidden">
                    {/* Row 1: Key Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Nº Factura</label>
                            <input
                                className={cn(
                                    "editable-input",
                                    invoice.errors?.invoiceNumber && "border-accent-red dark:border-red-900 focus:ring-accent-red"
                                )}
                                type="text"
                                value={invoice.invoiceNumber}
                                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                            />
                            {invoice.errors?.invoiceNumber && (
                                <span className="text-[7px] text-accent-red font-bold mt-0.5 block">{invoice.errors.invoiceNumber}</span>
                            )}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Fecha</label>
                            <input
                                className={cn(
                                    "editable-input",
                                    invoice.errors?.invoiceDate && "border-accent-red dark:border-red-900 focus:ring-accent-red"
                                )}
                                type="text"
                                value={invoice.invoiceDate}
                                onChange={(e) => handleChange("invoiceDate", e.target.value)}
                            />
                            {invoice.errors?.invoiceDate && (
                                <span className="text-[7px] text-accent-red font-bold mt-0.5 block">{invoice.errors.invoiceDate}</span>
                            )}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">CIF/NIF</label>
                            <input
                                className={cn(
                                    "editable-input",
                                    invoice.errors?.supplierNIF && "border-accent-red dark:border-red-900 focus:ring-accent-red"
                                )}
                                type="text"
                                value={invoice.supplierNIF}
                                onChange={(e) => handleChange("supplierNIF", e.target.value)}
                            />
                            {invoice.errors?.supplierNIF && (
                                <span className="text-[7px] text-accent-red font-bold mt-0.5 block">{invoice.errors.supplierNIF}</span>
                            )}
                        </div>
                        <div className="col-span-1 md:col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Razón Social</label>
                            <input
                                className="editable-input"
                                type="text"
                                value={invoice.supplierName}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Importe Total</label>
                            <div className="relative">
                                <input
                                    className={cn(
                                        "editable-input font-bold text-brand-green pr-4",
                                        invoice.errors?.totalAmount && "border-accent-red dark:border-red-900 focus:ring-accent-red text-accent-red"
                                    )}
                                    type="text"
                                    value={invoice.totalAmount}
                                    onChange={(e) => handleChange("totalAmount", parseFloat(e.target.value) || 0)}
                                />
                                <span className="absolute right-2 top-1 text-[10px] text-brand-green">€</span>
                                {invoice.errors?.totalAmount && (
                                    <span className="text-[7px] text-accent-red font-bold mt-0.5 block">{invoice.errors.totalAmount}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded ml-1 border-l-2 border-slate-200 dark:border-slate-700">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Concepto Resumen</label>
                            <input
                                className="editable-input"
                                type="text"
                                value={invoice.concept}
                                onChange={(e) => handleChange("concept", e.target.value)}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Impuestos (IVA)</label>
                            <input
                                className="editable-input"
                                type="text"
                                value={invoice.vatAmount}
                                onChange={(e) => handleChange("vatAmount", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Base Imponible</label>
                            <input
                                className="editable-input"
                                type="text"
                                value={invoice.baseAmount}
                                onChange={(e) => handleChange("baseAmount", parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Área Destino</label>
                            <input
                                className="editable-input"
                                type="text"
                                value={invoice.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                title="Confirmar eliminación"
            >
                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase">¿Eliminar esta factura?</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
                            Esta acción eliminará <span className="font-bold text-slate-700 dark:text-slate-200">"{invoice.pdfFileName}"</span> de forma permanente de esta lista.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setIsConfirmingDelete(false)}
                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase"
                        >
                            Volver
                        </button>
                        <button
                            onClick={() => {
                                deleteInvoice(invoice.id);
                                setIsConfirmingDelete(false);
                            }}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-all shadow-md uppercase"
                        >
                            Borrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
