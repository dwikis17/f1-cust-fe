"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";

export function MobileMenu({
	openMenuLabel,
	children,
}: {
	openMenuLabel: string;
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const detailsRef = useRef<HTMLDetailsElement>(null);

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// Listen for ESC key
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
				if (detailsRef.current) {
					detailsRef.current.open = false;
				}
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
		setIsOpen(e.currentTarget.open);
	}

	function handleNavClick(e: React.MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest("a") || target.closest("button")) {
			setIsOpen(false);
			if (detailsRef.current) {
				detailsRef.current.open = false;
			}
		}
	}

	function closeMenu() {
		setIsOpen(false);
		if (detailsRef.current) {
			detailsRef.current.open = false;
		}
	}

	return (
		<details
			key={pathname}
			ref={detailsRef}
			className="mobile-menu"
			open={isOpen}
			onToggle={handleToggle}
		>
			<summary aria-label={openMenuLabel}>
				<MenuIcon />
			</summary>
			{isOpen && <div className="mobile-menu-backdrop" onClick={closeMenu} aria-hidden="true" />}
			<nav aria-label="Mobile navigation" onClick={handleNavClick}>
				{children}
			</nav>
		</details>
	);
}
