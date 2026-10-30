"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export type NavGroup = { title: string; items: { label: string; href: string }[] };

export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-5 py-3 kicker text-[0.6875rem] lg:hidden"
      >
        {open ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
        {open ? "Close menu" : "Menu"}
      </button>
      <nav aria-label="Admin" className={`${open ? "block" : "hidden"} px-3 pb-6 lg:block`}>
        {groups.map((g) => (
          <div key={g.title} className="mt-5">
            <p className="px-2 kicker text-[0.5625rem] text-paper/50">{g.title}</p>
            <ul className="mt-1.5 space-y-0.5">
              {g.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="block rounded px-2 py-1.5 text-sm text-paper/85 hover:bg-paper/10 hover:text-paper-white aria-[current=page]:bg-taxi aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="mt-6 border-t border-paper/20 px-2 pt-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-taxi underline underline-offset-4">
            View live site ↗
          </a>
        </div>
      </nav>
    </>
  );
}
