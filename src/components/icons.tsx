import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 };

export function BagIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="M5.5 8.5h13l-.6 12h-11.8l-.6-12Z" /><path d="M9 9V6.5a3 3 0 0 1 6 0V9" /></svg>;
}

export function UserIcon(props: IconProps) {
	return <svg {...base} {...props}><circle cx="12" cy="8" r="3" /><path d="M5.8 20c.5-4 2.6-6 6.2-6s5.7 2 6.2 6" /></svg>;
}

export function MenuIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function ArrowRightIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="M4 12h15M14 7l5 5-5 5" /></svg>;
}

export function ChevronDownIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="m7 9 5 5 5-5" /></svg>;
}

export function GridIcon(props: IconProps) {
	return <svg {...base} {...props}><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>;
}

export function VerifiedIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="m12 3 2 1.4 2.5-.1.7 2.4 2.1 1.4-.8 2.4.8 2.4-2.1 1.4-.7 2.4-2.5-.1-2 1.4-2-1.4-2.5.1-.7-2.4-2.1-1.4.8-2.4-.8-2.4 2.1-1.4.7-2.4 2.5.1L12 3Z" /><path d="m9 11.5 2 2 4-4" /></svg>;
}

export function CubeIcon(props: IconProps) {
	return <svg {...base} {...props}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" /></svg>;
}
