import { Shell } from "@/shared/components/layout/Shell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Shell>
      {children}
    </Shell>
  )
}
