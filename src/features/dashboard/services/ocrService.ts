import { createWorker } from 'tesseract.js';
import { Invoice } from '@/shared/types/invoice.types';
import { extractWithAzure } from './azureExtractor';



export async function processFileWithOCR(
    file: File,
    source: 'tesseract' | 'azure'
): Promise<Partial<Invoice>> {
    try {
        if (typeof window === 'undefined') return {};

        if (source === 'azure') {
            const formData = new FormData();
            formData.append("file", file);
            const azureData = await extractWithAzure(formData);
            return {
                ...azureData,
                status: 'pending',
                hasErrors: false,
                ocrText: "Extraído mediante Azure Document Intelligence"
            };
        }

        // --- Tesseract Logic ---
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

        let imageData: string | Uint8Array | File = file;

        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas
                }).promise;
                imageData = canvas.toDataURL('image/png');
            }
        } else {
            imageData = new Uint8Array(await file.arrayBuffer());
        }

        const worker = await createWorker('spa');
        const { data: { text } } = await worker.recognize(imageData as unknown as any);
        await worker.terminate();

        if (!text || text.trim().length === 0) {
            return { hasErrors: true, concept: "OCR: No se detectó texto legible." };
        }

        const parsedData = parseInvoiceText(text);
        return { ...parsedData, ocrText: text };

    } catch (error) {
        console.error("Error en extracción:", error);
        return {
            hasErrors: true,
            concept: `Error: ${String(error)}`
        };
    }
}

function parseInvoiceText(text: string): Partial<Invoice> {
    const data: Partial<Invoice> = {
        concept: "Factura procesada automáticamente",
        registrationDate: new Date().toLocaleDateString('es-ES'),
        registrationNumber: "",
        sicalOffice: "",
        sicalArea: "",
        discountAmount: 0,
        taxPercent: 21
    };

    // 1. Extraer NIF/CIF
    const nifRegex = /([ABCDEFGHJKLMNPQRSUVW][0-9]{8}|[0-9]{8}[A-Z])/gi;
    const nifs = text.match(nifRegex);
    if (nifs && nifs.length > 0) {
        data.supplierNIF = nifs[0].toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
    }

    // 2. Extraer Importe Total
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
        data.taxAmount = +(maxTotal - data.baseAmount).toFixed(2);
    } else {
        data.totalAmount = 0;
        data.baseAmount = 0;
        data.taxAmount = 0;
    }

    // 3. Extraer Fecha
    const dateRegex = /(\d{2})[\/\- ](\d{2})[\/\- ](\d{4})/g;
    const dates = text.match(dateRegex);
    if (dates && dates.length > 0) {
        data.invoiceDate = dates[0];
    } else {
        data.invoiceDate = "";
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
    if (!data.invoiceNumber) data.invoiceNumber = "PTE";

    // Razon Social (primera línea con contenido)
    const lines = text.split('\n').filter(l => l.trim().length > 5);
    data.supplierName = lines.length > 0 ? lines[0].trim() : "Desconocido";

    return data;
}
