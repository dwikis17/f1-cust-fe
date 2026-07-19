"use client";

import { useRef } from "react";

import { useDictionary } from "@/components/i18n-provider";
import type { ProductVariant } from "@/lib/catalog";
import { buildSizingRows } from "@/lib/sizing-guide";

export function SizingGuide({ variants, note }: { variants: ProductVariant[]; note: string | null }) {
	const messages = useDictionary();
	const dialog = useRef<HTMLDialogElement>(null);
	const rows = buildSizingRows(variants);
	if (rows.length === 0) return null;
	const unit = rows[0].unit;
	function openDialog() {
		const element = dialog.current;
		if (!element) return;
		try {
			element.showModal();
		} catch {
			element.setAttribute("open", "");
		}
	}
	function closeDialog() {
		const element = dialog.current;
		if (!element) return;
		if (typeof element.close === "function") element.close();
		else element.removeAttribute("open");
	}

	return (
		<div className="sizing-guide-control">
			<button className="sizing-guide-link" type="button" onClick={openDialog}>
				{messages.product.sizingGuide}
			</button>
			<dialog
				className="sizing-guide-dialog"
				ref={dialog}
				aria-labelledby="sizing-guide-title"
				onCancel={(event) => {
					event.preventDefault();
					closeDialog();
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") closeDialog();
				}}
				onClick={(event) => event.target === event.currentTarget && closeDialog()}
			>
				<div className="sizing-guide-dialog-body">
					<header>
						<h2 id="sizing-guide-title">{messages.product.sizingGuide}</h2>
						<button type="button" aria-label={messages.product.closeSizingGuide} onClick={closeDialog}>×</button>
					</header>
					<div className="sizing-guide-table-wrap">
						<table>
							<thead><tr><th>{messages.product.size}</th><th>{messages.product.length} ({unit})</th><th>{messages.product.chestWidth} ({unit})</th><th>{messages.product.waistWidth} ({unit})</th></tr></thead>
							<tbody>{rows.map((row) => <tr key={row.size}><th scope="row">{row.size}</th><td>{row.length}</td><td>{row.chestWidth}</td><td>{row.waistWidth}</td></tr>)}</tbody>
						</table>
					</div>
					{note ? <p className="sizing-guide-note">{note}</p> : null}
				</div>
			</dialog>
		</div>
	);
}
