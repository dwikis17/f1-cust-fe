"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
	const pathname = usePathname();
	const target = href.split("?")[0].split("#")[0];
	const current = href.includes("#") ? false : target === "/" ? pathname === "/" : pathname === target;
	return <Link className={className} href={href} aria-current={current ? "page" : undefined}>{children}</Link>;
}
