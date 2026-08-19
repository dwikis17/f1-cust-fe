import { SUPPORT_MAILTO_URL, SUPPORT_WHATSAPP_URL } from "@/lib/support";

export function SupportContactLinks({
	whatsappLabel,
	emailLabel,
}: {
	whatsappLabel: string;
	emailLabel: string;
}) {
	return (
		<div className="support-contact-links">
			<a className="faq-contact-link" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">
				{whatsappLabel}
			</a>
			<a className="faq-contact-link faq-contact-link-secondary" href={SUPPORT_MAILTO_URL}>
				{emailLabel}
			</a>
		</div>
	);
}
