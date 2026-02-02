"use server";

export interface BoundingBox {
    pageNumber: number;
    polygon: number[]; // [x1, y1, x2, y2, x3, y3, x4, y4] en puntos (72 DPI)
}

export interface FieldWithBounds {
    value: string | number | undefined;
    bounds?: BoundingBox;
}

export interface AzureExtractorResponse {
    registrationDate?: string;
    invoiceDate?: string;
    invoiceNumber?: string;
    supplierNIF?: string;
    supplierName?: string;
    concept?: string;
    baseAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount?: number;
    // Coordenadas de los campos extraídos
    fieldBounds?: Record<string, BoundingBox>;
    // Dimensiones de las páginas del documento
    pagesDimensions?: Array<{ width: number; height: number; unit: string }>;
    // PDF con texto buscable (base64 data URL)
    searchablePdfUrl?: string;
}

const AZURE_ENDPOINT = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "";
const AZURE_KEY = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY || "";
const MODEL_ID = "prebuilt-invoice";

function validateConfig() {
    if (!AZURE_ENDPOINT) {
        throw new Error("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT no está configurada en las variables de entorno.");
    }
    if (!AZURE_KEY) {
        throw new Error("AZURE_DOCUMENT_INTELLIGENCE_KEY no está configurada en las variables de entorno.");
    }
}

/**
 * Genera un PDF con texto buscable usando el modelo prebuilt-read de Azure
 * Este PDF mantiene la imagen original pero añade una capa de texto invisible
 */
async function generateSearchablePdfFromAzure(fileContent: ArrayBuffer, contentType: string): Promise<string | undefined> {
    const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;

    // Usar prebuilt-read con output=pdf para generar PDF searchable
    const analyzeUrl = `${baseUrl}/formrecognizer/documentModels/prebuilt-read:analyze?output=pdf&api-version=2024-11-30`;

    console.log("[Azure AI] Llamando a prebuilt-read para PDF searchable...");

    const response = await fetch(analyzeUrl, {
        method: "POST",
        headers: {
            "Ocp-Apim-Subscription-Key": AZURE_KEY,
            "Content-Type": contentType || "application/pdf"
        },
        body: fileContent
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de Azure prebuilt-read: ${response.status} - ${errorText}`);
    }

    const operationLocation = response.headers.get("operation-location");
    if (!operationLocation) {
        throw new Error("No se recibió la ubicación de la operación para PDF searchable.");
    }

    // Polling para esperar el resultado
    let result: any = null;
    let attempts = 0;
    const maxAttempts = 30; // Más tiempo porque genera el PDF

    while (attempts < maxAttempts) {
        const resultResponse = await fetch(operationLocation, {
            headers: { "Ocp-Apim-Subscription-Key": AZURE_KEY }
        });

        if (!resultResponse.ok) {
            throw new Error("Error al obtener el PDF searchable de Azure.");
        }

        result = await resultResponse.json();

        if (result.status === "succeeded") {
            break;
        } else if (result.status === "failed") {
            throw new Error(`Azure falló al generar PDF searchable: ${JSON.stringify(result.error)}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!result || result.status !== "succeeded") {
        throw new Error("Tiempo de espera agotado para PDF searchable.");
    }

    // El PDF viene en base64 en analyzeResult.pdf.content
    // Nota: La estructura puede variar según la versión de la API
    console.log("[Azure AI] Estructura de respuesta:", JSON.stringify(Object.keys(result.analyzeResult || {})));

    const pdfContent = result.analyzeResult?.pdf;
    console.log("[Azure AI] Contenido PDF:", pdfContent ? `encontrado (keys: ${Object.keys(pdfContent)})` : "no encontrado");

    const pdfBase64 = pdfContent?.content;
    if (!pdfBase64) {
        console.warn("[Azure AI] No se recibió el PDF searchable en la respuesta.");
        console.warn("[Azure AI] analyzeResult.pdf:", JSON.stringify(pdfContent));
        return undefined;
    }

    console.log("[Azure AI] PDF base64 recibido, longitud:", pdfBase64.length);

    // Convertir a data URL para poder usarlo directamente
    return `data:application/pdf;base64,${pdfBase64}`;
}


export async function extractWithAzure(formData: FormData): Promise<AzureExtractorResponse> {
    const file = formData.get("file") as File;
    const generateSearchablePdf = formData.get("generateSearchablePdf") === "true";
    if (!file) throw new Error("No se ha proporcionado ningún archivo.");

    console.log(`[Azure AI] Procesando factura: ${file.name} (${file.size} bytes)`);
    console.log(`[Azure AI] Generar PDF searchable: ${generateSearchablePdf}`);

    try {
        validateConfig();

        // 1. Enviar el documento para análisis
        // Limpiar el endpoint para asegurar que no termina en / y que tiene el formato correcto
        const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;
        const analyzeUrl = `${baseUrl}/formrecognizer/documentModels/${MODEL_ID}:analyze?api-version=2023-07-31`;

        console.log(`[Azure AI] Usando endpoint: ${baseUrl}`);

        const fileContent = await file.arrayBuffer();

        const response = await fetch(analyzeUrl, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_KEY,
                "Content-Type": file.type || "application/pdf"
            },
            body: fileContent
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Error de Azure (${response.status} ${response.statusText})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage += `: ${errorJson.error?.message || errorText}`;
            } catch {
                errorMessage += `: ${errorText}`;
            }
            console.error("[Azure AI] Error en el envío:", errorText);
            throw new Error(errorMessage);
        }

        const operationLocation = response.headers.get("operation-location");
        if (!operationLocation) {
            throw new Error("No se recibió la ubicación de la operación de Azure.");
        }

        // 2. Polling (Esperar a que termine el análisis)
        let result: any = null;
        let attempts = 0;
        const maxAttempts = 20;

        console.log("[Azure AI] Esperando resultados...");

        while (attempts < maxAttempts) {
            const resultResponse = await fetch(operationLocation, {
                headers: { "Ocp-Apim-Subscription-Key": AZURE_KEY }
            });

            if (!resultResponse.ok) {
                throw new Error("Error al obtener los resultados de Azure.");
            }

            result = await resultResponse.json();

            if (result.status === "succeeded") {
                console.log("[Azure AI] Procesamiento completado con éxito.");
                break;
            } else if (result.status === "failed") {
                throw new Error(`Azure falló al procesar el documento: ${JSON.stringify(result.error)}`);
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar 1.5s entre reintentos
        }

        if (!result || result.status !== "succeeded") {
            throw new Error("Tiempo de espera agotado esperando a Azure.");
        }

        // 3. Parsear resultados
        const analyzeResult = result.analyzeResult;
        const document = analyzeResult.documents[0];
        const fields = document.fields;

        // Extraer dimensiones de las páginas
        const pagesDimensions = analyzeResult.pages?.map((page: any) => ({
            width: page.width,
            height: page.height,
            unit: page.unit || 'inch'
        })) || [];

        const getFieldValue = (field: any) => {
            if (!field) return undefined;
            if (field.type === "string") return field.valueString;
            if (field.type === "date") return field.valueDate;
            if (field.type === "number") return field.valueNumber;
            if (field.type === "currency") return field.valueCurrency?.amount;
            return field.content;
        };

        // Extraer bounding box de un campo
        const getFieldBounds = (field: any): BoundingBox | undefined => {
            if (!field?.boundingRegions?.[0]) return undefined;
            const region = field.boundingRegions[0];
            return {
                pageNumber: region.pageNumber,
                polygon: region.polygon
            };
        };

        const formatDate = (dateValue: any) => {
            if (!dateValue) return "";
            try {
                // Azure suele devolver "YYYY-MM-DD"
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return dateValue;
                return date.toLocaleDateString('es-ES');
            } catch (e) {
                return dateValue;
            }
        };

        // Extraer coordenadas de todos los campos relevantes
        const fieldBounds: Record<string, BoundingBox> = {};
        const fieldMappings: Record<string, string> = {
            'InvoiceDate': 'invoiceDate',
            'InvoiceId': 'invoiceNumber',
            'VendorTaxId': 'supplierNIF',
            'VendorName': 'supplierName',
            'SubTotal': 'baseAmount',
            'TotalTax': 'taxAmount',
            'InvoiceTotal': 'totalAmount'
        };

        for (const [azureField, localField] of Object.entries(fieldMappings)) {
            const bounds = getFieldBounds(fields[azureField]);
            if (bounds) {
                fieldBounds[localField] = bounds;
            }
        }

        // Extraer todos los ítems para construir el concepto resumen
        const items = fields.Items?.valueArray || [];
        const descriptions = items
            .map((item: any) => {
                const desc = item.valueObject?.Description;
                return (desc?.valueString || desc?.content || "").trim();
            })
            .filter((v: string) => v.length > 0);

        // Eliminar duplicados consecutivos (falsos positivos de OCR)
        const uniqueDescriptions = descriptions.filter((v: string, i: number) => i === 0 || v !== descriptions[i - 1]);

        const conceptSummary = uniqueDescriptions.length > 0
            ? uniqueDescriptions.join("; ").substring(0, 500)
            : "Factura extraída por Azure AI";

        const data: AzureExtractorResponse = {
            registrationDate: new Date().toLocaleDateString('es-ES'),
            invoiceDate: formatDate(getFieldValue(fields.InvoiceDate)),
            invoiceNumber: getFieldValue(fields.InvoiceId),
            supplierNIF: getFieldValue(fields.VendorTaxId)?.replace(/[^a-zA-Z0-9]/g, ''),
            supplierName: getFieldValue(fields.VendorName),
            concept: conceptSummary,
            baseAmount: getFieldValue(fields.SubTotal) || 0,
            taxAmount: getFieldValue(fields.TotalTax) || 0,
            totalAmount: getFieldValue(fields.InvoiceTotal) || 0,
            discountAmount: 0,
            taxPercent: 21, // Por defecto
            fieldBounds: Object.keys(fieldBounds).length > 0 ? fieldBounds : undefined,
            pagesDimensions: pagesDimensions.length > 0 ? pagesDimensions : undefined
        };

        // Si tenemos total y base pero no impuesto, intentar calcularlo
        if (data.totalAmount && data.baseAmount && !data.taxAmount) {
            data.taxAmount = data.totalAmount - data.baseAmount;
        }

        // Calcular % impuesto si es posible
        if (data.baseAmount && data.baseAmount > 0 && data.taxAmount) {
            data.taxPercent = Math.round((data.taxAmount / data.baseAmount) * 100);
        } else {
            data.taxPercent = 21; // Por defecto
        }

        // Si se solicita, generar PDF searchable con prebuilt-read
        if (generateSearchablePdf) {
            try {
                console.log("[Azure AI] Generando PDF searchable...");
                const searchablePdfUrl = await generateSearchablePdfFromAzure(fileContent, file.type);
                if (searchablePdfUrl) {
                    data.searchablePdfUrl = searchablePdfUrl;
                    console.log("[Azure AI] PDF searchable generado correctamente.");
                }
            } catch (pdfError) {
                console.error("[Azure AI] Error al generar PDF searchable:", pdfError);
                // No lanzamos error, simplemente continuamos sin el PDF searchable
            }
        }

        console.log("[Azure AI] Datos extraídos:", data);
        return data;

    } catch (error) {
        console.error("[Azure AI] Excepción:", error);
        throw error;
    }
}
