import { z } from "zod";

export const InvoiceSchema = z.object({
    id: z.string(),

    // 14 Fields
    registrationDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido (DD/MM/YYYY)").or(z.string().length(0)),
    registrationNumber: z.string().optional(),
    invoiceDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido (DD/MM/YYYY)").min(1, "La fecha de factura es obligatoria"),
    invoiceNumber: z.string().min(1, "El número de factura es obligatorio"),
    supplierNIF: z.string().regex(/^[ABCDEFGHJKLMNPQRSUVW][0-9]{8}$|^[0-9]{8}[A-Z]$/i, "NIF/CIF inválido"),
    supplierName: z.string().min(1, "La razón social es obligatoria"),
    concept: z.string().min(1, "El concepto es obligatorio"),
    sicalOffice: z.string().optional(),
    sicalArea: z.string().min(1, "El área Sical es obligatoria"),

    // Numeric fields with 2 decimal precision (handled via number, validation can check precision if needed)
    baseAmount: z.number().describe("Base Imponible"),
    taxPercent: z.number().min(0).max(100).describe("% Impuesto"),
    taxAmount: z.number().describe("Importe Impuestos"),
    discountAmount: z.number().default(0).describe("Importe Descuento"),
    totalAmount: z.number().positive("El total debe ser mayor que 0").describe("Total Factura"),

    status: z.enum(['pending', 'validated', 'exported']).default('pending'),
    pdfFileName: z.string(),
    hasErrors: z.boolean().default(false),
});

export type InvoiceValidations = z.infer<typeof InvoiceSchema>;
