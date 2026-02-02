export type InvoiceStatus = 'pending' | 'validated' | 'exported';

export interface BoundingBox {
    pageNumber: number;
    polygon: number[]; // [x1, y1, x2, y2, x3, y3, x4, y4]
}

export interface PageDimension {
    width: number;
    height: number;
    unit: string;
}

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
    searchablePdfUrl?: string;  // PDF con texto buscable generado por Azure
    ocrText?: string;
    createdAt: string;
    updatedAt: string;
    hasErrors?: boolean;
    errors?: Record<string, string>;
    selected?: boolean;

    // Bounding boxes para visualización sobre el PDF
    fieldBounds?: Record<string, BoundingBox>;
    pagesDimensions?: PageDimension[];
}
