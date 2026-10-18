"use client";

import { NAV_ITEMS } from "@/lib/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SpenVoltLogo from "@/components/spenvolt_logo";

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        "bg-bg/80 backdrop-blur-md border-b border-border-soft bg-dark-blue text-white"
      }`}
    >
      <div className="mx-5 section-shell flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
            <Link
                href="/"
                className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-purple-soft via-purple to-blue bg-clip-text text-transparent"
            >
                < SpenVoltLogo className="h-13 w-auto mx-5" />
            </Link>
            <h2 className="mx-5 text-3xl font-bold leading-tight">
                Spen<span className="text-yellow">Volt</span>
            </h2>
        </div>
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`relative font-body text-sm transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-yellow"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-purple to-blue" />
                  )}
                </Link>
              </li>
            ))}
            <li key="profile">
              <Link
                href="/profile"
                className=""
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-10 w-10 mx-10 bg-white rounded-full p-1 text-dark-blue"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.178a8.002 8.002 0 0115.998 0"
                  />
                </svg>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}