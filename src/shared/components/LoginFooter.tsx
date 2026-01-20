export function LoginFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-4 bg-[#f0f0f0] border-t border-gray-300 mt-auto">
            <div className="max-w-[1200px] mx-auto px-8">
                <p className="text-gray-600 text-sm">
                    Copyright &copy; {currentYear} Diputación de Sevilla - Registro Intermedio de Facturas
                </p>
            </div>
        </footer>
    );
}
