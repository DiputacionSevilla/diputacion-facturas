import { Header } from "./Header";
import { Footer } from "./Footer";

interface ShellProps {
    children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Header />
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h2 className="text-[10px] font-bold text-brand-green tracking-wide capitalize">
                        VALIDACIÓN E INSCRIPCIÓN
                    </h2>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        MODO EDICIÓN
                    </span>
                </div>
            </div>
            <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-2 lg:p-4 gap-4">
                {children}
            </main>
            <Footer />
        </div>
    );
}
