import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Invoice } from "@/shared/types/invoice.types";
import { InvoiceSchema } from "@/shared/types/invoice.schema";
import { Area } from "../services/areaService";

interface InvoiceState {
    invoices: Invoice[];
    selectedInvoiceId: string | null;
    searchQuery: string;
    isProcessing: boolean;
    areas: Area[];
    selectedEntityCode: string | null;
    selectedEntityName: string | null;
    userName: string | null;
    extractionSource: 'tesseract' | 'azure';

    // Actions
    setInvoices: (invoices: Invoice[]) => void;
    addInvoices: (newInvoices: Invoice[]) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    setSelectedInvoiceId: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    toggleSelectInvoice: (id: string) => void;
    toggleSelectAll: (selected: boolean) => void;
    deleteInvoice: (id: string) => void;
    setAreas: (areas: Area[]) => void;
    setSelectedEntity: (code: string | null, name: string | null) => void;
    setUserName: (name: string | null) => void;
    setExtractionSource: (source: 'tesseract' | 'azure') => void;

    // Selectors
    getSelectedInvoice: () => Invoice | undefined;
    getFilteredInvoices: () => Invoice[];
    exportToCSV: () => void;
}

export const useInvoiceStore = create<InvoiceState>()(
    persist(
        (set: any, get: any) => ({
            invoices: [] as Invoice[],
            selectedInvoiceId: null as string | null,
            searchQuery: "",
            isProcessing: false as boolean,
            areas: [] as Area[],
            selectedEntityCode: null as string | null,
            selectedEntityName: null as string | null,
            userName: null as string | null,
            extractionSource: 'tesseract' as 'tesseract' | 'azure',

            setInvoices: (invoices: Invoice[]) => set({ invoices }),

            addInvoices: (newInvoices: Invoice[]) => set((state: InvoiceState) => ({
                invoices: [...state.invoices, ...newInvoices]
            })),

            updateInvoice: (id: string, updates: Partial<Invoice>) => set((state: InvoiceState) => ({
                invoices: state.invoices.map((inv: Invoice) => {
                    if (inv.id !== id) return inv;

                    const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };

                    // Validar con Zod
                    const validation = InvoiceSchema.safeParse(updated);

                    return {
                        ...updated,
                        hasErrors: !validation.success,
                        errors: !validation.success
                            ? validation.error.flatten().fieldErrors as any
                            : {}
                    };
                })
            })),

            setSelectedInvoiceId: (id: string | null) => set({ selectedInvoiceId: id }),

            setSearchQuery: (query: string) => set({ searchQuery: query }),

            setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

            toggleSelectInvoice: (id: string) => set((state: InvoiceState) => ({
                invoices: state.invoices.map((inv: Invoice) =>
                    inv.id === id ? { ...inv, selected: !inv.selected } : inv
                )
            })),

            toggleSelectAll: (selected: boolean) => set((state: InvoiceState) => ({
                invoices: state.invoices.map((inv: Invoice) => ({ ...inv, selected }))
            })),

            deleteInvoice: (id: string) => set((state: InvoiceState) => ({
                invoices: state.invoices.filter((inv: Invoice) => inv.id !== id),
                selectedInvoiceId: state.selectedInvoiceId === id ? null : state.selectedInvoiceId
            })),

            setAreas: (areas: Area[]) => set({ areas }),

            setSelectedEntity: (code: string | null, name: string | null) => set({
                selectedEntityCode: code,
                selectedEntityName: name
            }),

            setUserName: (name: string | null) => set({ userName: name }),

            setExtractionSource: (source: 'tesseract' | 'azure') => set({ extractionSource: source }),

            getSelectedInvoice: () => {
                const { invoices, selectedInvoiceId } = get();
                return invoices.find((inv: Invoice) => inv.id === selectedInvoiceId);
            },

            getFilteredInvoices: () => {
                const { invoices, searchQuery } = get();
                if (!searchQuery) return invoices;

                const lowerQuery = searchQuery.toLowerCase();
                return invoices.filter((inv: Invoice) =>
                    inv.supplierName.toLowerCase().includes(lowerQuery) ||
                    inv.supplierNIF.toLowerCase().includes(lowerQuery) ||
                    inv.invoiceNumber.toLowerCase().includes(lowerQuery)
                );
            },

            exportToCSV: () => {
                const { invoices } = get();
                if (invoices.length === 0) return;

                const headers = [
                    "Fecha Registro", "Nº Registro", "Fecha Factura", "Nº Factura",
                    "CIF/NIF", "Razon Social", "Concepto resumen", "Oficina Sical",
                    "Area Sical", "Base Imponible", "% Impuesto", "Importe Impuestos",
                    "Importe Descuento", "Total Factura"
                ];

                const rows = invoices.map((inv: Invoice) => [
                    inv.registrationDate,
                    inv.registrationNumber,
                    inv.invoiceDate,
                    inv.invoiceNumber,
                    inv.supplierNIF,
                    inv.supplierName,
                    inv.concept,
                    inv.sicalOffice,
                    inv.sicalArea,
                    inv.baseAmount.toFixed(2),
                    inv.taxPercent.toFixed(2),
                    inv.taxAmount.toFixed(2),
                    inv.discountAmount.toFixed(2),
                    inv.totalAmount.toFixed(2)
                ]);

                const csvContent = [
                    headers.join(";"),
                    ...rows.map((row: any[]) => row.join(";"))
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `facturas-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }),
        {
            name: "invoice-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
