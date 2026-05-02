import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getDashboardGateSecret } from "@/lib/gate";
import { HELP_DESK_GATE_COOKIE, verifySessionToken } from "@/lib/gate-session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const secret = getDashboardGateSecret();
  if (secret) {
    const jar = await cookies();
    const token = jar.get(HELP_DESK_GATE_COOKIE)?.value;
    if (!token || !(await verifySessionToken(token, secret))) {
      redirect("/login");
    }
  }

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
