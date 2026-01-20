"use client";

import { Modal } from "@/shared/components/ui/Modal";
import { Copy, Terminal } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    text: string;
    fileName: string;
}

export function OCRDebugModal({ isOpen, onClose, text, fileName }: Props) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        alert("Texto copiado al portapapeles");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Depuración OCR - Datos Extraídos">
            <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" />
                        Archivo: {fileName}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-all"
                    >
                        <Copy className="w-3 h-3" />
                        Copiar Todo
                    </button>
                </div>

                <div className="bg-slate-900 rounded-md p-4 font-mono text-xs text-brand-green border border-brand-green/20 leading-relaxed whitespace-pre-wrap min-h-[300px]">
                    {text || "--- No se detectó texto en este archivo ---"}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 text-blue-700 dark:text-blue-300 text-[10px] leading-relaxed">
                    <strong>Nota:</strong> Este es el texto bruto extraído por {text.includes("Azure") ? "Azure Document Intelligence" : "Tesseract.js"}. Si ves el contenido de la factura aquí pero los campos de la tabla están vacíos, es necesario ajustar las reglas de extracción.
                </div>
            </div>
        </Modal>
    );
}
