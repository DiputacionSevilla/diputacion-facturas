import { create } from "zustand";
import { Invoice } from "@/shared/types/invoice.types";

interface InvoiceState {
    invoices: Invoice[];
    selectedInvoiceId: string | null;
    searchQuery: string;
    isProcessing: boolean;

    // Actions
    setInvoices: (invoices: Invoice[]) => void;
    addInvoices: (newInvoices: Invoice[]) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    setSelectedInvoiceId: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setIsProcessing: (isProcessing: boolean) => void;

    // Selectors
    getSelectedInvoice: () => Invoice | undefined;
    getFilteredInvoices: () => Invoice[];
    exportToCSV: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
    invoices: [],
    selectedInvoiceId: null,
    searchQuery: "",
    isProcessing: false,

    setInvoices: (invoices) => set({ invoices }),

    addInvoices: (newInvoices) => set((state) => ({
        invoices: [...state.invoices, ...newInvoices]
    })),

    updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
        )
    })),

    setSelectedInvoiceId: (id) => set({ selectedInvoiceId: id }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    setIsProcessing: (isProcessing) => set({ isProcessing }),

    getSelectedInvoice: () => {
        const { invoices, selectedInvoiceId } = get();
        return invoices.find((inv) => inv.id === selectedInvoiceId);
    },

    getFilteredInvoices: () => {
        const { invoices, searchQuery } = get();
        if (!searchQuery) return invoices;

        const lowerQuery = searchQuery.toLowerCase();
        return invoices.filter((inv) =>
            inv.supplierName.toLowerCase().includes(lowerQuery) ||
            inv.supplierNIF.toLowerCase().includes(lowerQuery) ||
            inv.invoiceNumber.toLowerCase().includes(lowerQuery)
        );
    },

    exportToCSV: () => {
        const { invoices } = get();
        if (invoices.length === 0) return;

        const headers = ["Nº Factura", "Fecha", "CIF/NIF Emisor", "Razón Social Emisor", "Importe Total", "Concepto"];
        const rows = invoices.map(inv => [
            inv.invoiceNumber,
            inv.invoiceDate,
            inv.supplierNIF,
            inv.supplierName,
            inv.totalAmount,
            inv.concept
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
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
