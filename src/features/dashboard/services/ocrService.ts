import { Invoice } from "@/shared/types/invoice.types";

/**
 * Simulates OCR extraction. In a real app, this would use Tesseract.js 
 * or an external API and then parse the text with regex or LLM.
 */
export async function simulateOCR(file: File): Promise<Partial<Invoice>> {
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const randomId = Math.floor(Math.random() * 1000).toString();
    const isError = Math.random() > 0.8;

    return {
        supplierName: isError ? "" : "Suministros Globales S.L.",
        supplierNIF: isError ? "ERROR-NIF" : "B41223344",
        invoiceNumber: `EXP-2024-${randomId.padStart(3, '0')}`,
        invoiceDate: new Date().toLocaleDateString('es-ES'),
        totalAmount: 1250.50,
        baseAmount: 1033.47,
        vatAmount: 217.03,
        vatRate: 21,
        description: "Material de oficina y fungibles",
        concept: "Consumibles Trimestre 1",
        status: isError ? 'pending' : 'pending', // Both pending but one with errors
        hasErrors: isError,
        receiverName: "Diputación de Sevilla",
        receiverNIF: "P4100000I",
    };
}
