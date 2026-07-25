import type { SVGProps } from "react";

export type FlagProps = SVGProps<SVGSVGElement> & {
	width?: number;
	height?: number;
};

export function GbFlag({ className = "", width = 20, height = 14, ...props }: FlagProps) {
	return (
		<svg
			className={`flag-icon ${className}`.trim()}
			width={width}
			height={height}
			viewBox="0 0 60 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<g clipPath="url(#gb-flag-clip)">
				{/* Navy Blue Base */}
				<rect width="60" height="40" fill="#012169" />
				{/* St Andrew White Saltire */}
				<path d="M-5 -5L65 45M65 -5L-5 45" stroke="#FFFFFF" strokeWidth="9" />
				{/* St Patrick Red Saltire */}
				<path d="M-5 -5L65 45" stroke="#C8102E" strokeWidth="3" />
				<path d="M65 -5L-5 45" stroke="#C8102E" strokeWidth="3" />
				{/* St George White Cross */}
				<path d="M30 -5V45M-5 20H65" stroke="#FFFFFF" strokeWidth="13" />
				{/* St George Red Cross */}
				<path d="M30 -5V45M-5 20H65" stroke="#C8102E" strokeWidth="7" />
			</g>
			<rect x="0.5" y="0.5" width="59" height="39" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
			<defs>
				<clipPath id="gb-flag-clip">
					<rect width="60" height="40" rx="3" />
				</clipPath>
			</defs>
		</svg>
	);
}

export function IdFlag({ className = "", width = 20, height = 14, ...props }: FlagProps) {
	return (
		<svg
			className={`flag-icon ${className}`.trim()}
			width={width}
			height={height}
			viewBox="0 0 60 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<g clipPath="url(#id-flag-clip)">
				<rect width="60" height="40" fill="#FFFFFF" />
				<rect width="60" height="20" fill="#E70011" />
			</g>
			<rect x="0.5" y="0.5" width="59" height="39" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
			<defs>
				<clipPath id="id-flag-clip">
					<rect width="60" height="40" rx="3" />
				</clipPath>
			</defs>
		</svg>
	);
}
