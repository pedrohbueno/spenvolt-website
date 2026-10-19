import type { ReactNode } from "react";
import AuthSession from "@/components/auth-session";
import Header from "@/components/layout/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthSession>
      <Header />
      <main className="p-8">
        {children}
      </main>
    </AuthSession>;
}
