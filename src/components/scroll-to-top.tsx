"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

function scrollToTop() {
	window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function ScrollToTop() {
	const pathname = usePathname();
	const skip = useRef(true);
	const isPop = useRef(false);

	useLayoutEffect(() => {
		const onPop = () => {
			isPop.current = true;
		};
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, []);

	useLayoutEffect(() => {
		if (skip.current) {
			skip.current = false;
			return;
		}
		if (isPop.current) {
			isPop.current = false;
			return;
		}
		if (window.location.hash) return;

		scrollToTop();
		const frame = requestAnimationFrame(scrollToTop);
		return () => cancelAnimationFrame(frame);
	}, [pathname]);

	return null;
}
