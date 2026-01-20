import { LoginForm } from "@/features/auth/components/LoginForm";
import { LoginHeader } from "@/shared/components/LoginHeader";
import { LoginFooter } from "@/shared/components/LoginFooter";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <LoginHeader />

      <main className="flex-1 flex items-center justify-center p-6 bg-white shadow-inner">
        <LoginForm />
      </main>

      <LoginFooter />
    </div>
  );
}
