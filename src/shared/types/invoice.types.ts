export type InvoiceStatus = 'pending' | 'validated' | 'exported';

export interface Invoice {
    id: string;

    // PDF Data
    pdfFileName: string;
    pdfUrl?: string;
    ocrText?: string;

    // Emisor
    supplierName: string;
    supplierNIF: string;
    supplierAddress?: string;

    // Receptor
    receiverName: string;
    receiverNIF: string;
    receiverAddress?: string;

    // Invoice Details
    invoiceNumber: string;
    invoiceSeries?: string;
    invoiceDate: string;

    // Financials
    description: string;
    concept: string;
    baseAmount: number;
    vatRate: number;
    vatAmount: number;
    irpfRate?: number;
    irpfAmount?: number;
    totalAmount: number;

    // Status
    status: InvoiceStatus;
    createdAt: string;
    updatedAt: string;

    // UI Helpers
    hasErrors?: boolean;
    errors?: Record<string, string>;
    selected?: boolean;
}
