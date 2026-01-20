import { Shell } from "@/shared/components/layout/Shell";
import { AuthGuard } from "@/shared/components/layout/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <Shell>
        {children}
      </Shell>
    </AuthGuard>
  )
}
