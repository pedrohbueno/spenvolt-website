import type { ReactNode } from "react";
import AuthSession from "@/components/auth-session";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthSession>{children}</AuthSession>;
}
