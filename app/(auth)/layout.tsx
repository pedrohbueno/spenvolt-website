export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 border-t-4 border-[#FFD43B] bg-[#0E1A2B] px-4 py-10 text-white">
      {children}
    </main>
  );
}