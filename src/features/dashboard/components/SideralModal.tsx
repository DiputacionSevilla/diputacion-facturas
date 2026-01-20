"use client";

import { useInvoiceStore } from "../store/useInvoiceStore";
import { Modal } from "@/shared/components/ui/Modal";
import { useState, useEffect, useMemo } from "react";
import { Save } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { office: string; area: string }) => void;
}

export function SideralModal({ isOpen, onClose, onConfirm }: Props) {
    const areas = useInvoiceStore((state) => state.areas);
    const selectedEntityCode = useInvoiceStore((state) => state.selectedEntityCode);
    const selectedEntityName = useInvoiceStore((state) => state.selectedEntityName);

    const [office, setOffice] = useState("");
    const [area, setArea] = useState("");

    // Oficinas de registro filtradas por entidad
    const entityOffices: Record<string, string[]> = {
        "01": [
            "Registro General - Diputación de Sevilla",
            "Oficina de Atención al Ciudadano (OAC)",
            "Registro Auxiliar de Hacienda Provincial",
            "Registro de Recursos Humanos"
        ],
        "02": [
            "Registro OPAEF - Sede Central",
            "Oficina de Recaudación y Gestión Tributaria",
            "Registro Auxiliar OPAEF - Lora del Río"
        ],
        "03": [
            "Registro Consorcio de Extinción de Incendios",
            "Servicios Operativos - Parque Central"
        ],
        "04": [
            "Registro Casa de la Provincia"
        ]
    };

    const currentOffices = useMemo(() => {
        if (!selectedEntityCode) return [];
        return entityOffices[selectedEntityCode] || ["Registro General - Oficina Local"];
    }, [selectedEntityCode]);

    useEffect(() => {
        if (isOpen) {
            if (currentOffices.length > 0) setOffice(currentOffices[0]);
            if (areas.length > 0) setArea(areas[0].description);
        }
    }, [isOpen, currentOffices, areas]);

    const handleConfirm = () => {
        if (!office || !area) {
            alert("Por favor, seleccione la Oficina y el Área.");
            return;
        }
        onConfirm({ office, area });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registro Automático en SIDERAL">
            <div className="p-6 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-bold tracking-wider mb-1">Entidad Seleccionada</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedEntityName || <span className="text-red-500 italic">No seleccionada (Re-inicie sesión)</span>}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Oficina de Registro</label>
                        <select
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                            value={office}
                            onChange={(e) => setOffice(e.target.value)}
                        >
                            <option value="">Seleccione oficina...</option>
                            {currentOffices.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Área Sical Correspondiente</label>
                        <select
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                        >
                            <option value="">Seleccione área...</option>
                            {areas.map(a => <option key={a.code} value={a.description}>{a.description}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-800 uppercase"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:brightness-110 shadow-lg flex items-center justify-center gap-2 uppercase"
                        disabled={!selectedEntityCode}
                    >
                        <Save className="w-4 h-4" />
                        Grabar en Sideral
                    </button>
                </div>
            </div>
        </Modal>
    );
}
