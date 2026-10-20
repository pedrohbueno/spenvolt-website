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
      <main className="px-4 pb-8 pt-20 sm:px-8 lg:px-16">
        {children}
      </main>
    </AuthSession>;
}
