"use server";

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
}

const AZURE_ENDPOINT = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "";
const AZURE_KEY = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY || "";
const MODEL_ID = "prebuilt-invoice";

export async function extractWithAzure(formData: FormData): Promise<AzureExtractorResponse> {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No se ha proporcionado ningún archivo.");

    console.log(`[Azure AI] Procesando factura: ${file.name} (${file.size} bytes)`);

    try {
        // 1. Enviar el documento para análisis
        const analyzeUrl = `${AZURE_ENDPOINT}formrecognizer/documentModels/${MODEL_ID}:analyze?api-version=2023-07-31`;

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
            const error = await response.text();
            console.error("[Azure AI] Error en el envío:", error);
            throw new Error(`Error de comunicación con Azure: ${response.statusText}`);
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
        const document = result.analyzeResult.documents[0];
        const fields = document.fields;

        const getFieldValue = (field: any) => {
            if (!field) return undefined;
            if (field.type === "string") return field.valueString;
            if (field.type === "date") return field.valueDate;
            if (field.type === "number") return field.valueNumber;
            if (field.type === "currency") return field.valueCurrency?.amount;
            return field.content;
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

        const data: AzureExtractorResponse = {
            registrationDate: new Date().toLocaleDateString('es-ES'),
            invoiceDate: formatDate(getFieldValue(fields.InvoiceDate)),
            invoiceNumber: getFieldValue(fields.InvoiceId),
            supplierNIF: getFieldValue(fields.VendorTaxId)?.replace(/[^a-zA-Z0-9]/g, ''),
            supplierName: getFieldValue(fields.VendorName),
            concept: getFieldValue(fields.Items)?.[0]?.valueObject?.Description?.valueString || "Factura extraída por Azure AI",
            baseAmount: getFieldValue(fields.SubTotal) || 0,
            taxAmount: getFieldValue(fields.TotalTax) || 0,
            totalAmount: getFieldValue(fields.InvoiceTotal) || 0,
            discountAmount: 0,
            taxPercent: 21 // Por defecto, o intentar extraer de campos específicos si existen
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

        console.log("[Azure AI] Datos extraídos:", data);
        return data;

    } catch (error) {
        console.error("[Azure AI] Excepción:", error);
        throw error;
    }
}
