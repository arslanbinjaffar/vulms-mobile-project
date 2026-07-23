import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-[var(--bg)]">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </AuthGate>
  );
}
