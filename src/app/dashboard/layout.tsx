import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <Topbar />
        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
