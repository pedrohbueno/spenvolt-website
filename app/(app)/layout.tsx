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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        {children}
      </main>
    </AuthSession>;
}
