"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useInvoiceStore } from "@/features/dashboard/store/useInvoiceStore";

interface Props {
    children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
    const { userName } = useInvoiceStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Si no hay usuario y no estamos en login/signup, redirigir a login
        if (!userName && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
            router.push("/login");
        }
    }, [userName, pathname, router, mounted]);

    // Evitar parpadeos de contenido protegido durante la hidratación inicial
    if (!mounted) {
        return null; // O un spinner
    }

    // Si no hay usuario y no estamos en rutas públicas, no renderizamos nada (el useEffect se encarga de la redirección)
    if (!userName && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
        return null;
    }

    return <>{children}</>;
}
