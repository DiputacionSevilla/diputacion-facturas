import { create } from "zustand";
import { Invoice } from "@/shared/types/invoice.types";
import { InvoiceSchema } from "@/shared/types/invoice.schema";
import { Area } from "../services/areaService";

interface InvoiceState {
    invoices: Invoice[];
    selectedInvoiceId: string | null;
    searchQuery: string;
    isProcessing: boolean;
    areas: Area[];

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

    // Selectors
    getSelectedInvoice: () => Invoice | undefined;
    getFilteredInvoices: () => Invoice[];
    exportToCSV: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set: any, get: any) => ({
    invoices: [],
    selectedInvoiceId: null,
    searchQuery: "",
    isProcessing: false,
    areas: [],

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

        const headers = ["Nº Factura", "Fecha", "CIF/NIF Emisor", "Razón Social Emisor", "Importe Total", "Concepto"];
        const rows = invoices.map((inv: Invoice) => [
            inv.invoiceNumber,
            inv.invoiceDate,
            inv.supplierNIF,
            inv.supplierName,
            inv.totalAmount,
            inv.concept
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row: any[]) => row.join(","))
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
}));
