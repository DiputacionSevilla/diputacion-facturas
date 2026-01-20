"use client";

import { useEffect, useState } from "react";
import { useInvoiceStore } from "@/features/dashboard/store/useInvoiceStore";

interface Entity {
    code: string;
    name: string;
}

export function LoginForm() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [selectedEntityCode, setSelectedEntityCode] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const setSelectedEntity = useInvoiceStore((state) => state.setSelectedEntity);
    const setUserName = useInvoiceStore((state) => state.setUserName);

    useEffect(() => {
        // Load entities from CSV
        const loadEntities = async () => {
            try {
                const response = await fetch("/areas.csv");
                const text = await response.text();

                const lines = text.split("\n").filter(line => line.trim() !== "");
                const uniqueEntitiesMap = new Map<string, string>();

                lines.forEach(line => {
                    const [entCode, entName] = line.split(";");
                    if (entCode && entName) {
                        uniqueEntitiesMap.set(entCode.trim(), entName.trim());
                    }
                });

                const entityList = Array.from(uniqueEntitiesMap.entries()).map(([code, name]) => ({
                    code,
                    name
                }));

                setEntities(entityList);
            } catch (err) {
                console.error("Error loading entities:", err);
            }
        };

        loadEntities();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEntityCode || !username) {
            setError("Por favor, seleccione una entidad e introduzca un usuario.");
            return;
        }

        const entity = entities.find(e => e.code === selectedEntityCode);
        if (entity) {
            setSelectedEntity(entity.code, entity.name);
        }
        setUserName(username);

        // Save mock user name to local session-like handling if needed, 
        // but for now we'll just use "username" from the form in the header if we want it dynamic.
        // We'll trust the store for the entity.

        setError(null);
        window.location.href = "/dashboard";
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[600px] mx-auto animate-in fade-in duration-500">
            {/* Visual Header inspired by the reference image */}
            <div className="w-full bg-gradient-to-r from-gray-600 to-gray-800 p-4 flex items-center justify-center space-x-4 rounded-t-lg shadow-lg border-b border-gray-500">
                <div className="bg-white rounded-full p-2 shadow-inner">
                    <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l1-1 1-1 .257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-white text-xl md:text-2xl font-semibold tracking-wide">
                    Registro Intermedio de Facturas
                </h2>
            </div>

            {/* Form Content */}
            <form
                onSubmit={handleSubmit}
                className="w-full bg-white p-6 md:p-12 shadow-2xl rounded-b-lg space-y-6 border-x border-b border-gray-200"
            >
                <div className="space-y-4">
                    {/* Entity Selection */}
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="entity" className="text-gray-700 font-medium ml-1">
                            Entidad:
                        </label>
                        <div className="w-full relative">
                            <select
                                id="entity"
                                value={selectedEntityCode}
                                onChange={(e) => setSelectedEntityCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none pr-10"
                            >
                                <option value="">Seleccione una entidad...</option>
                                {entities.map((entity) => (
                                    <option key={entity.code} value={entity.code}>
                                        {entity.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="username" className="text-gray-700 font-medium ml-1">
                            Usuario:
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="password" className="text-gray-700 font-medium ml-1">
                            Clave:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-12 py-3 bg-white border border-gray-400 text-gray-800 rounded hover:bg-gray-100 hover:border-gray-500 transition-colors shadow-sm font-bold text-lg"
                    >
                        Entrar
                    </button>
                </div>

                {/* Error Message Section */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded flex items-center space-x-3 text-red-700 animate-in slide-in-from-top-2">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </form>
        </div>
    );
}
