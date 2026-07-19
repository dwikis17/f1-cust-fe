"use client";

import { useFormStatus } from "react-dom";

export function PendingSubmitButton({ idle, pending, className }: { idle: string; pending: string; className?: string }) {
	const status = useFormStatus();
	return <button className={className} type="submit" disabled={status.pending}>{status.pending ? pending : idle}</button>;
}

export function AutoSubmitSelect({ label, name, defaultValue, options, pendingLabel, applyLabel }: {
	label: string;
	name: string;
	defaultValue: string;
	options: Array<{ value: string; label: string }>;
	pendingLabel: string;
	applyLabel: string;
}) {
	const status = useFormStatus();
	return <>
		<label>{label}<select name={name} defaultValue={defaultValue} disabled={status.pending} onChange={(event) => event.currentTarget.form?.requestSubmit()}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
		<span className="catalog-pending" role="status">{status.pending ? pendingLabel : ""}</span>
		<noscript><button type="submit">{applyLabel}</button></noscript>
	</>;
}
