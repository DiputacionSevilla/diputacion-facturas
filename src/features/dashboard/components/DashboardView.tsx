"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useInvoiceStore } from "../store/useInvoiceStore";
import { InvoiceCard } from "./InvoiceCard";
import { PDFPreview } from "./PDFPreview";
import { SideralModal } from "./SideralModal";
import { Modal } from "@/shared/components/ui/Modal";
import { Save, CheckCircle, GripVertical, Cloud, Upload, Loader2, RotateCcw, AlertTriangle, PanelLeft, PanelRight } from "lucide-react";
import { getAreas } from "../services/areaService";
import { processFileWithOCR } from "../services/ocrService";
import { Invoice } from "@/shared/types/invoice.types";

export function DashboardView() {
    const {
        getFilteredInvoices,
        toggleSelectAll,
        setAreas,
        selectedEntityCode,
        addInvoices,
        isProcessing,
        setIsProcessing,
        extractionSource,
        clearAllInvoices,
        invoices
    } = useInvoiceStore();
    const filteredInvoices = getFilteredInvoices();

    // Estado para el montaje y el ancho del panel izquierdo
    const [mounted, setMounted] = useState(false);
    const [leftWidth, setLeftWidth] = useState(60);
    const [isSideralOpen, setIsSideralOpen] = useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [isPdfLeft, setIsPdfLeft] = useState(false);
    const isResizing = useRef(false);

    useEffect(() => {
        setMounted(true);
        // Cargar preferencia de layout
        const savedLayout = localStorage.getItem('pdf-panel-position');
        if (savedLayout === 'left') setIsPdfLeft(true);
        // Cargar áreas filtradas por la entidad seleccionada
        getAreas(selectedEntityCode || undefined).then(setAreas);
    }, [setAreas, selectedEntityCode]);

    const togglePdfPosition = () => {
        const newPosition = !isPdfLeft;
        setIsPdfLeft(newPosition);
        localStorage.setItem('pdf-panel-position', newPosition ? 'left' : 'right');
    };

    // Dropzone para cargar facturas
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
            {mounted && (
                <>
                    <div className={`flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden shadow-sm min-h-[calc(100vh-200px)] ${isPdfLeft ? 'lg:flex-row-reverse' : ''}`}>
                        {/* Invoices Panel */}
                        <div
                            style={{ width: typeof window !== 'undefined' && window.innerWidth > 1024 ? calculatedLeftWidth : '100%' }}
                            className="p-4 lg:p-6 space-y-4"
                        >
                            {/* Toolbar: Botones de acción + checkbox */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
                                <div className="flex items-center gap-3">
                                    <div {...getRootProps()} className="cursor-pointer">
                                        <input {...getInputProps()} />
                                        <button className="bg-primary text-white h-8 px-3 rounded flex items-center gap-2 text-[10px] font-bold hover:brightness-110 transition-all uppercase">
                                            {isProcessing ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="w-3.5 h-3.5" />
                                            )}
                                            {isDragActive ? "Suelta aquí" : "Cargar Facturas"}
                                        </button>
                                    </div>

                                    {invoices.length > 0 && (
                                        <button
                                            onClick={() => setIsConfirmingClear(true)}
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-8 px-3 rounded flex items-center gap-2 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 uppercase"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Inicializar
                                        </button>
                                    )}

                                    <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

                                    <div className="hidden sm:flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer"
                                            checked={filteredInvoices.length > 0 && filteredInvoices.every((i: any) => i.selected)}
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                        />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Marcar todo</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 italic">
                                        {filteredInvoices.length} factura(s)
                                    </span>
                                    <button
                                        onClick={togglePdfPosition}
                                        className="hidden lg:flex items-center gap-1.5 h-8 px-2 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
                                        title={isPdfLeft ? "Mover PDF a la derecha" : "Mover PDF a la izquierda"}
                                    >
                                        {isPdfLeft ? <PanelRight className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
                                        <span className="uppercase">PDF {isPdfLeft ? "→" : "←"}</span>
                                    </button>
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
                            style={{ width: typeof window !== 'undefined' && window.innerWidth > 1024 ? calculatedRightWidth : '100%' }}
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

                    <Modal
                        isOpen={isConfirmingClear}
                        onClose={() => setIsConfirmingClear(false)}
                        title="Inicializar todo"
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 uppercase">¿Eliminar todas las facturas?</h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
                                    Se eliminarán <span className="font-bold text-slate-700 dark:text-slate-200">{invoices.length} factura(s)</span> cargadas. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setIsConfirmingClear(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { clearAllInvoices(); setIsConfirmingClear(false); }}
                                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded text-[10px] font-bold hover:bg-amber-700 transition-all shadow-md uppercase"
                                >
                                    Inicializar
                                </button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
}
