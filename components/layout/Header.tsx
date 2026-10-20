"use client";

import { NAV_ITEMS } from "@/lib/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SpenVoltLogo from "@/components/spenvolt_logo";

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-10 w-10 rounded-full bg-white p-1 text-dark-blue"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.178a8.002 8.002 0 0115.998 0"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        "bg-bg/80 backdrop-blur-md border-b border-border-soft bg-dark-blue text-white"
      }`}
    >
      <div className="relative mx-5 section-shell flex h-20 items-center justify-between">
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            ) : (
              <path
                strokeLinecap="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>

        <div className="flex max-w-sm flex-1 items-center justify-center gap-2 lg:flex-none lg:justify-start">
          <Link
            href="/"
            aria-label="SpenVolt - Início"
            className="font-display text-xl font-bold tracking-tight bg-linear-to-r from-purple-soft via-purple to-blue bg-clip-text text-transparent"
          >
            <SpenVoltLogo className="h-10 w-auto lg:mx-5 lg:h-13" />
          </Link>
          <h2 className="text-xl font-bold leading-tight lg:mx-5 lg:text-3xl">
            Spen<span className="text-yellow">Volt</span>
          </h2>
        </div>

        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow lg:hidden"
        >
          <ProfileIcon />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 lg:flex"
        >
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
                    <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-linear-to-r from-purple to-blue" />
                  )}
                </Link>
              </li>
            ))}
            <li key="profile">
              <Link
                href="/profile"
                aria-label="Perfil"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
              >
                <ProfileIcon />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Navegação móvel"
        className={`${isMenuOpen ? "block" : "hidden"} border-t border-white/10 bg-dark-blue px-5 py-3 shadow-lg lg:hidden`}
      >
        <ul className="section-shell flex flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-lg px-3 py-3 font-body text-sm transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-yellow"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="bg-yellow " style={{ height: '4px' }}></div>
    </header>
  );
}