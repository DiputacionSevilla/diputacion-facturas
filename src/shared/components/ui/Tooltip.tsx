"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface TooltipProps {
    content: string;
    children: ReactNode;
    delay?: number;
    maxWidth?: number;
    className?: string;
}

export function Tooltip({
    content,
    children,
    delay = 300,
    maxWidth = 400,
    className
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<"top" | "bottom">("top");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            // Calcular si hay espacio arriba o abajo
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceAbove = rect.top;
                const spaceBelow = window.innerHeight - rect.bottom;
                setPosition(spaceAbove > spaceBelow ? "top" : "bottom");
            }
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // No mostrar tooltip si el contenido está vacío
    if (!content || content.trim().length === 0) {
        return <>{children}</>;
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative inline-block w-full", className)}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={cn(
                        "absolute z-50 px-3 py-2 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-lg shadow-lg",
                        "animate-in fade-in-0 zoom-in-95 duration-200",
                        "left-0 right-0",
                        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
                    )}
                    style={{ maxWidth: `${maxWidth}px` }}
                >
                    {/* Flecha */}
                    <div
                        className={cn(
                            "absolute left-4 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45",
                            position === "top" ? "bottom-[-4px]" : "top-[-4px]"
                        )}
                    />

                    {/* Contenido con scroll si es muy largo */}
                    <div className="relative max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}
