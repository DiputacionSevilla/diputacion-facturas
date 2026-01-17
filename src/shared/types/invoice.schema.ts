import { z } from "zod";

export const InvoiceSchema = z.object({
    id: z.string(),
    invoiceNumber: z.string().min(1, "El número de factura es obligatorio"),
    invoiceDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato de fecha inválido (DD/MM/YYYY)"),
    supplierName: z.string().min(3, "El nombre del proveedor es demasiado corto"),
    supplierNIF: z.string().regex(/^[ABCDEFGHJKLMNPQRSUVW][0-9]{8}$|^[0-9]{8}[A-Z]$/i, "NIF/CIF inválido"),
    receiverName: z.string().default("Diputación de Sevilla"),
    receiverNIF: z.string().default("P4100000I"),
    totalAmount: z.number().positive("El importe debe ser mayor que 0"),
    baseAmount: z.number(),
    vatAmount: z.number(),
    vatRate: z.number().default(21),
    status: z.enum(['pending', 'validated', 'rejected']).default('pending'),
    hasErrors: z.boolean().default(false),
    description: z.string().optional(),
    concept: z.string().optional(),
    pdfUrl: z.string().optional(),
    pdfFileName: z.string().optional(),
    ocrText: z.string().optional(),
});

export type InvoiceValidations = z.infer<typeof InvoiceSchema>;
