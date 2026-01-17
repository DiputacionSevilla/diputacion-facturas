import { createWorker } from 'tesseract.js';
import { Invoice } from '@/shared/types/invoice.types';

export async function processFileWithOCR(file: File): Promise<Partial<Invoice>> {
    try {
        const worker = await createWorker('spa');

        // El motor Tesseract procesa mejor imágenes.
        // Si el archivo es PDF, puede fallar si no es un PDF de texto simple.
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        if (!text || text.trim().length === 0) {
            return { hasErrors: true, description: "OCR completado pero no se detectó texto legible." };
        }

        return parseInvoiceText(text);
    } catch (error) {
        console.error("Error en OCR:", error);
        return {
            hasErrors: true,
            description: "No se pudo procesar automáticamente. Por favor, revisa manualmente."
        };
    }
}

function parseInvoiceText(text: string): Partial<Invoice> {
    const data: Partial<Invoice> = {
        description: "Extraído mediante OCR",
        concept: "Factura procesada automáticamente",
    };

    // 1. Extraer NIF/CIF (B12345678, A12345678, 12345678A)
    const nifRegex = /([ABCDEFGHJKLMNPQRSUVW][0-9]{8}|[0-9]{8}[A-Z])/gi;
    const nifs = text.match(nifRegex);
    if (nifs && nifs.length > 0) {
        // El primero suele ser el emisor, el segundo el receptor (Diputación suele estar fija)
        data.supplierNIF = nifs[0].toUpperCase();
    }

    // 2. Extraer Importe Total (Busca números con coma/punto cerca de palabras clave)
    // Ejemplo: Total Factura 1.250,45
    const totalRegex = /(?:total|importe|total\s+factura|a\s+pagar)[\s:]*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2}))/gi;
    const totals = text.matchAll(totalRegex);
    let maxTotal = 0;
    for (const match of totals) {
        const value = parseFloat(match[1].replace('.', '').replace(',', '.'));
        if (value > maxTotal) maxTotal = value;
    }
    if (maxTotal > 0) {
        data.totalAmount = maxTotal;
        data.baseAmount = +(maxTotal / 1.21).toFixed(2);
        data.vatAmount = +(maxTotal - data.baseAmount).toFixed(2);
        data.vatRate = 21;
    }

    // 3. Extraer Fecha (DD/MM/YYYY)
    const dateRegex = /(\d{2})[\/\- ](\d{2})[\/\- ](\d{4})/g;
    const dates = text.match(dateRegex);
    if (dates && dates.length > 0) {
        data.invoiceDate = dates[0];
    }

    // 4. Extraer Número de Factura
    const numberRegex = /(?:factura|nº|numero|num|fact\.)[\s:]*([A-Z0-9\-\/]{3,})/gi;
    const numbers = text.matchAll(numberRegex);
    for (const match of numbers) {
        if (match[1] && !/total|fecha|nif/i.test(match[1])) {
            data.invoiceNumber = match[1];
            break;
        }
    }

    // Intentar sacar el nombre del proveedor (Suele estar al principio)
    const lines = text.split('\n').filter(l => l.trim().length > 5);
    if (lines.length > 0) {
        // Normalmente las primeras líneas contienen el nombre de la empresa
        data.supplierName = lines[0].trim();
    }

    return data;
}
