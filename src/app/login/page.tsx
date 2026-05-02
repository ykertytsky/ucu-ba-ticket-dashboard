import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getDashboardGateSecret } from "@/lib/gate";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!getDashboardGateSecret()) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <LoginForm />
    </div>
  );
}
