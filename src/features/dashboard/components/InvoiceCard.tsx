"use client";

import { Invoice } from "@/shared/types/invoice.types";
import { cn } from "@/shared/lib/utils";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { Trash2, AlertTriangle, Calendar } from "lucide-react";
import { useState, useRef } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Tooltip } from "@/shared/components/ui/Tooltip";

interface Props {
    invoice: Invoice;
}

// Helpers para conversión de fechas
const toInputDate = (str: string) => {
    if (!str) return "";
    const parts = str.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    return str;
};

const fromInputDate = (str: string) => {
    if (!str) return "";
    const parts = str.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return str;
};

export function InvoiceCard({ invoice }: Props) {
    const { updateInvoice, selectedInvoiceId, setSelectedInvoiceId, toggleSelectInvoice, deleteInvoice, areas } = useInvoiceStore();
    const isSelected = selectedInvoiceId === invoice.id;
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Refs para pickers de fecha
    const regDateRef = useRef<HTMLInputElement>(null);
    const invDateRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof Invoice, value: any) => {
        updateInvoice(invoice.id, { [field]: value });
    };

    const handleNumberChange = (field: keyof Invoice, value: string) => {
        const parsed = parseFloat(value.replace(',', '.')) || 0;
        handleChange(field, parsed);
    };

    const formatDecimal = (num: number) => {
        return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                        onChange={() => { }}
                    />

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

                <div className="p-3 space-y-4 flex-1 overflow-hidden">
                    {/* Row 1: Registro e Identificación */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Fecha Registro</label>
                            <div className="relative">
                                <input
                                    className="editable-input pr-7"
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    value={invoice.registrationDate}
                                    onChange={(e) => handleChange("registrationDate", e.target.value)}
                                />
                                <div onClick={() => regDateRef.current?.showPicker()} className="absolute right-2 top-1.5 cursor-pointer text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <input ref={regDateRef} type="date" className="absolute inset-0 opacity-0 cursor-pointer" value={toInputDate(invoice.registrationDate)} onChange={(e) => handleChange("registrationDate", fromInputDate(e.target.value))} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Nº Registro</label>
                            <input className="editable-input" type="text" value={invoice.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Fecha Factura</label>
                            <div className="relative">
                                <input
                                    className={cn("editable-input pr-7", invoice.errors?.invoiceDate && "border-accent-red")}
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    value={invoice.invoiceDate}
                                    onChange={(e) => handleChange("invoiceDate", e.target.value)}
                                />
                                <div onClick={() => invDateRef.current?.showPicker()} className="absolute right-2 top-1.5 cursor-pointer text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <input ref={invDateRef} type="date" className="absolute inset-0 opacity-0 cursor-pointer" value={toInputDate(invoice.invoiceDate)} onChange={(e) => handleChange("invoiceDate", fromInputDate(e.target.value))} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Nº Factura</label>
                            <input className={cn("editable-input", invoice.errors?.invoiceNumber && "border-accent-red")} type="text" value={invoice.invoiceNumber} onChange={(e) => handleChange("invoiceNumber", e.target.value)} />
                        </div>
                    </div>

                    {/* Row 2: Emisor y Concepto */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">CIF/NIF Emisor</label>
                            <input className={cn("editable-input font-mono", invoice.errors?.supplierNIF && "border-accent-red")} type="text" value={invoice.supplierNIF} onChange={(e) => handleChange("supplierNIF", e.target.value)} />
                        </div>
                        <div className="space-y-1 md:col-span-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Razón Social</label>
                            <input className="editable-input" type="text" value={invoice.supplierName} onChange={(e) => handleChange("supplierName", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Concepto Resumen</label>
                            <Tooltip content={invoice.concept} maxWidth={500}>
                                <input className="editable-input" type="text" value={invoice.concept} onChange={(e) => handleChange("concept", e.target.value)} />
                            </Tooltip>
                        </div>
                    </div>

                    {/* Row 3: Destinación y Otros */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded border-l-2 border-primary/20">
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Oficina Sical</label>
                            <select
                                className="editable-input bg-transparent"
                                value={invoice.sicalOffice}
                                onChange={(e) => handleChange("sicalOffice", e.target.value)}
                            >
                                <option value="">Seleccionar oficina...</option>
                                <option value="92- Registro de Facturas">92- Registro de Facturas</option>
                                <option value="77- Cultura y Ciudadania [2019-2023]">77- Cultura y Ciudadania [2019-2023]</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase font-bold text-primary">Área Sical</label>
                            <select
                                className="editable-input bg-transparent"
                                value={invoice.sicalArea}
                                onChange={(e) => handleChange("sicalArea", e.target.value)}
                            >
                                <option value="">Seleccionar área...</option>
                                {areas.map((area: any) => (
                                    <option key={area.code} value={area.description}>{area.description}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Importes con 2 decimales */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Base Imponible</label>
                            <input className="editable-input text-right" type="number" step="0.01" value={invoice.baseAmount} onChange={(e) => handleNumberChange("baseAmount", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">% Impuesto</label>
                            <input className="editable-input text-right" type="number" step="0.01" value={invoice.taxPercent} onChange={(e) => handleNumberChange("taxPercent", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Importe Impuestos</label>
                            <input className="editable-input text-right" type="number" step="0.01" value={invoice.taxAmount} onChange={(e) => handleNumberChange("taxAmount", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Descuento</label>
                            <input className="editable-input text-right" type="number" step="0.01" value={invoice.discountAmount} onChange={(e) => handleNumberChange("discountAmount", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-extrabold text-brand-green uppercase">Total Factura</label>
                            <div className="relative">
                                <input
                                    className="editable-input text-right font-bold text-brand-green bg-brand-green/5 border-brand-green/30"
                                    type="number"
                                    step="0.01"
                                    value={invoice.totalAmount}
                                    onChange={(e) => handleNumberChange("totalAmount", e.target.value)}
                                />
                                <span className="absolute left-2 top-2 text-[10px] text-brand-green/50">€</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            Esta acción eliminará <span className="font-bold text-slate-700 dark:text-slate-200">"{invoice.pdfFileName}"</span> de forma permanente.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase">Volver</button>
                        <button onClick={() => { deleteInvoice(invoice.id); setIsConfirmingDelete(false); }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-all shadow-md uppercase">Borrar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
