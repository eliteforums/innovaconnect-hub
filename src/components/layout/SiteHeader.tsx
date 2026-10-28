"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { primaryNav } from "@/content/navigation";

export function SiteHeader({ cta }: { cta: { label: string; href: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="headline text-[1.6rem] leading-none tracking-tight">INNOVAHACK</span>
          <span className="bg-taxi px-1.5 py-0.5 kicker text-[0.625rem] text-ink">Ch. 02</span>
          <span className="sr-only">— home</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-3">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative block px-2 py-2 label text-[0.75rem] text-ink transition-colors hover:text-burgundy aria-[current=page]:text-burgundy"
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span aria-hidden className="absolute inset-x-2 -bottom-[1px] h-[3px] bg-taxi" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={cta.href}
            className="group hidden min-h-11 items-center gap-2 border-2 border-ink bg-ink px-4 label text-[0.75rem] text-paper-white transition-colors hover:bg-burgundy hover:border-burgundy sm:inline-flex"
          >
            {cta.label}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center border-2 border-ink lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        hidden={!open}
        className="border-t border-ink bg-paper-white lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-[1440px] px-4 pb-6 pt-2 sm:px-6">
          <ul className="divide-y divide-rule">
            {primaryNav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-baseline justify-between py-3 aria-[current=page]:text-burgundy"
                >
                  <span className="headline text-2xl">{item.label}</span>
                  <span className="kicker text-muted">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-12 items-center justify-center gap-2 bg-burgundy label text-paper-white"
          >
            {cta.label}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
