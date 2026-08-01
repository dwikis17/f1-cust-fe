"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
	const pathname = usePathname();
	const target = href.split("?")[0].split("#")[0];
	const current = href.includes("#") ? false : target === "/" ? pathname === "/" : pathname === target;

	function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
		if (onClick) onClick(e);
		const details = e.currentTarget.closest<HTMLDetailsElement>("details.mobile-menu");
		if (details) {
			details.open = false;
		}
	}

	return <Link className={className} href={href} aria-current={current ? "page" : undefined} onClick={handleClick}>{children}</Link>;
}
