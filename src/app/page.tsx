import { Shell } from "@/shared/components/layout/Shell";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export default function Home() {
  return (
    <Shell>
      <DashboardView />
    </Shell>
  );
}
