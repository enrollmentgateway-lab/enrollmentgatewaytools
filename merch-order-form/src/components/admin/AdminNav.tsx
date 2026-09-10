"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Catalog" },
  { href: "/admin/catalog", label: "Catalog PDF" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-brand border px-3 py-2 font-subheading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
              isActive
                ? "border-brand-gold text-brand-gold"
                : "border-brand-white/25 text-brand-white/70 hover:border-brand-white hover:text-brand-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-brand border border-brand-white/25 px-3 py-2 font-subheading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-white/70 transition-colors hover:border-brand-rust hover:text-brand-rust"
      >
        Sign out
      </button>
    </nav>
  );
}
