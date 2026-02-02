"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BoundingBox, PageDimension } from "@/shared/types/invoice.types";
import { cn } from "@/shared/lib/utils";

// Configuración de colores por tipo de campo
const FIELD_COLORS: Record<string, { stroke: string; fill: string; label: string }> = {
    invoiceDate: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.2)", label: "Fecha Factura" },
    invoiceNumber: { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.2)", label: "Nº Factura" },
    supplierNIF: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.2)", label: "CIF/NIF" },
    supplierName: { stroke: "#f97316", fill: "rgba(249, 115, 22, 0.2)", label: "Razón Social" },
    baseAmount: { stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.2)", label: "Base Imponible" },
    taxAmount: { stroke: "#14b8a6", fill: "rgba(20, 184, 166, 0.2)", label: "Impuestos" },
    totalAmount: { stroke: "#eab308", fill: "rgba(234, 179, 8, 0.25)", label: "Total" },
};

interface Props {
    pdfUrl: string;
    fieldBounds?: Record<string, BoundingBox>;
    pagesDimensions?: PageDimension[];
    onFieldClick?: (fieldName: string) => void;
}

export function PDFViewerWithBounds({ pdfUrl, fieldBounds, pagesDimensions, onFieldClick }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredField, setHoveredField] = useState<string | null>(null);

    // Calcular dimensiones del contenedor
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                // Mantener aspect ratio A4 (aprox 1:1.414)
                const height = Math.min(width * 1.414, 800);
                setViewerSize({ width, height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    // Convertir coordenadas de Azure (pulgadas) a porcentajes del contenedor
    const convertBoundsToPercent = (bounds: BoundingBox, pageDimensions?: PageDimension) => {
        const polygon = bounds.polygon;
        if (!polygon || polygon.length < 8) return null;

        // Azure devuelve coordenadas en pulgadas (por defecto A4: 8.27 x 11.69 pulgadas)
        const pageWidth = pageDimensions?.width || 8.27;
        const pageHeight = pageDimensions?.height || 11.69;

        // Extraer las esquinas del polígono
        const x1 = polygon[0];
        const y1 = polygon[1];
        const x2 = polygon[2];
        const y2 = polygon[3];
        const x3 = polygon[4];
        const y3 = polygon[5];
        const x4 = polygon[6];
        const y4 = polygon[7];

        // Calcular bounding box rectangular en pulgadas
        const minX = Math.min(x1, x2, x3, x4);
        const maxX = Math.max(x1, x2, x3, x4);
        const minY = Math.min(y1, y2, y3, y4);
        const maxY = Math.max(y1, y2, y3, y4);

        // Convertir a porcentajes
        return {
            left: (minX / pageWidth) * 100,
            top: (minY / pageHeight) * 100,
            width: ((maxX - minX) / pageWidth) * 100,
            height: ((maxY - minY) / pageHeight) * 100,
        };
    };

    const firstPageDimension = pagesDimensions?.[0];
    const hasFieldBounds = fieldBounds && Object.keys(fieldBounds).length > 0;

    // URL para el iframe con parámetros para ocultar toolbar
    const iframeSrc = pdfUrl ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH` : '';

    return (
        <div ref={containerRef} className="relative w-full bg-slate-100 dark:bg-slate-950 rounded overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950 z-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-500">Cargando PDF...</span>
                    </div>
                </div>
            )}

            {/* Contenedor del PDF con overlay */}
            <div
                className="relative bg-white shadow-lg"
                style={{
                    width: viewerSize.width || '100%',
                    height: viewerSize.height || 800
                }}
            >
                {/* iframe del PDF */}
                {pdfUrl && (
                    <iframe
                        ref={iframeRef}
                        src={iframeSrc}
                        className="absolute inset-0 w-full h-full border-none"
                        title="PDF Preview"
                        onLoad={handleIframeLoad}
                    />
                )}

                {/* Overlay SVG con los bounding boxes */}
                {!isLoading && hasFieldBounds && (
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {Object.entries(fieldBounds).map(([fieldName, bounds]) => {
                            const percentBounds = convertBoundsToPercent(bounds, firstPageDimension);
                            if (!percentBounds) return null;

                            const colors = FIELD_COLORS[fieldName] || {
                                stroke: "#6b7280",
                                fill: "rgba(107, 114, 128, 0.2)",
                                label: fieldName
                            };

                            const isHovered = hoveredField === fieldName;

                            return (
                                <g key={fieldName} style={{ pointerEvents: 'auto' }}>
                                    <rect
                                        x={percentBounds.left}
                                        y={percentBounds.top}
                                        width={percentBounds.width}
                                        height={percentBounds.height}
                                        fill={colors.fill}
                                        stroke={colors.stroke}
                                        strokeWidth={isHovered ? 0.4 : 0.25}
                                        className="cursor-pointer transition-all"
                                        onMouseEnter={() => setHoveredField(fieldName)}
                                        onMouseLeave={() => setHoveredField(null)}
                                        onClick={() => onFieldClick?.(fieldName)}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                )}

                {/* Tooltips para campos hovereados */}
                {!isLoading && hasFieldBounds && hoveredField && (
                    <div className="absolute top-2 left-2 z-30">
                        {(() => {
                            const colors = FIELD_COLORS[hoveredField];
                            if (!colors) return null;
                            return (
                                <div
                                    className="px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg"
                                    style={{ backgroundColor: colors.stroke }}
                                >
                                    {colors.label}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Leyenda de colores */}
            {!isLoading && hasFieldBounds && (
                <div className="bg-white/95 dark:bg-slate-800/95 p-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-[8px] font-bold text-slate-500 uppercase mb-1.5">Campos detectados</div>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(fieldBounds).map(([fieldName]) => {
                            const colors = FIELD_COLORS[fieldName];
                            if (!colors) return null;
                            return (
                                <div
                                    key={fieldName}
                                    className={cn(
                                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer transition-all",
                                        hoveredField === fieldName ? "ring-2 ring-offset-1" : ""
                                    )}
                                    style={{
                                        backgroundColor: colors.fill,
                                        color: colors.stroke,
                                        ringColor: colors.stroke,
                                    }}
                                    onMouseEnter={() => setHoveredField(fieldName)}
                                    onMouseLeave={() => setHoveredField(null)}
                                    onClick={() => onFieldClick?.(fieldName)}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: colors.stroke }}
                                    />
                                    {colors.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
