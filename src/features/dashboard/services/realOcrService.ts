import { createWorker } from "tesseract.js";

export async function performOCR(file: File) {
    const worker = await createWorker('spa'); // Spanish

    // Convert File to Buffer/Blob URL for Tesseract
    const url = URL.createObjectURL(file);

    const { data: { text } } = await worker.recognize(url);

    await worker.terminate();
    URL.revokeObjectURL(url);

    return text;
}

/**
 * Very basic parser for invoice text. 
 * In a real scenario, this would use more complex Regex or an LLM.
 */
export function parseInvoiceText(text: string) {
    const lines = text.split('\n');

    // Example regex for NIF (Spanish)
    const nifRegex = /[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-Z]/i;
    const dateRegex = /\d{2}[\/-]\d{2}[\/-]\d{4}/;

    const nifMatch = text.match(nifRegex);
    const dateMatch = text.match(dateRegex);

    return {
        supplierNIF: nifMatch ? nifMatch[0] : "",
        invoiceDate: dateMatch ? dateMatch[0] : "",
        rawText: text
    };
}
