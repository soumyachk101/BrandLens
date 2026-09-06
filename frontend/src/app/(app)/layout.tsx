import { Providers } from "@/app/providers";
import { DashboardShell } from "@/components/features/dashboard-shell";

export default function AppLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <Providers>
 <DashboardShell>
 {children}
 </DashboardShell>
 </Providers>
 );
}
