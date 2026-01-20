export type InvoiceStatus = 'pending' | 'validated' | 'exported';

export interface Invoice {
    id: string;

    // 14 Required Fields
    registrationDate: string;    // Fecha Registro
    registrationNumber: string;  // Nº Registro
    invoiceDate: string;         // Fecha Factura
    invoiceNumber: string;       // Nº Factura
    supplierNIF: string;         // CIF/NIF
    supplierName: string;        // Razon Social
    concept: string;            // Concepto resumen
    sicalOffice: string;         // Oficina Sical
    sicalArea: string;           // Area Sical
    baseAmount: number;          // Base Imponible
    taxPercent: number;          // % Impuesto
    taxAmount: number;           // Importe Impuestos
    discountAmount: number;      // Importe Descuento
    totalAmount: number;         // Total Factura

    // Metadata & UI
    status: InvoiceStatus;
    pdfFileName: string;
    pdfUrl?: string;
    ocrText?: string;
    createdAt: string;
    updatedAt: string;
    hasErrors?: boolean;
    errors?: Record<string, string>;
    selected?: boolean;
}
