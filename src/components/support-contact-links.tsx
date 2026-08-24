import { getSupportContent } from "@/lib/support";

export async function SupportContactLinks({
	whatsappLabel,
	emailLabel,
}: {
	whatsappLabel: string;
	emailLabel: string;
}) {
	const support = await getSupportContent();
	return (
		<div className="support-contact-links">
			<a className="faq-contact-link" href={support.whatsappUrl} target="_blank" rel="noreferrer">
				{whatsappLabel}
			</a>
			<a className="faq-contact-link faq-contact-link-secondary" href={support.mailtoUrl}>
				{emailLabel}
			</a>
		</div>
	);
}
