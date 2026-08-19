import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl } from "@/lib/seo";
import { SUPPORT_EMAIL, SUPPORT_MAILTO_URL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/support";

const documents = {
	"shipping-returns": {
		en: { title: "Shipping & returns", intro: "Clear delivery expectations before you place an order.", sections: [["Delivery", "Tracked Indonesian delivery options and prices are calculated from your postcode during checkout."], ["Dispatch", "In-stock merchandise is prepared after payment confirmation. Tracking details are sent to the checkout email address."], ["Returns", "Unused merchandise may be returned within 14 days of delivery in its original packaging. Contact support before returning an item so the return can be identified."]] },
		id: { title: "Pengiriman & pengembalian", intro: "Informasi pengiriman yang jelas sebelum Anda memesan.", sections: [["Pengiriman", "Pilihan dan biaya pengiriman terlacak di Indonesia dihitung dari kode pos Anda saat checkout."], ["Persiapan", "Produk yang tersedia disiapkan setelah pembayaran terkonfirmasi. Detail pelacakan dikirim ke email checkout."], ["Pengembalian", "Produk yang belum digunakan dapat dikembalikan dalam 14 hari setelah diterima dengan kemasan asli. Hubungi dukungan sebelum mengirimkannya."]] },
	},
	contact: {
		en: { title: "Contact", intro: "We are here to help with products, delivery, and existing orders.", sections: [["Order support", "Include your order ID, checkout email, and a short description when requesting help."], ["Response time", "Support requests are reviewed during Indonesian business hours. Never send card numbers or payment credentials."], ["Telephone", "Telephone support opens a WhatsApp chat at +62 851-2156-5774."], ["Email", "Email support@valydejersey.com with the subject ‘Order support’."]] },
		id: { title: "Kontak", intro: "Kami siap membantu terkait produk, pengiriman, dan pesanan.", sections: [["Dukungan pesanan", "Sertakan ID pesanan, email checkout, dan penjelasan singkat saat meminta bantuan."], ["Waktu respons", "Permintaan ditinjau pada jam kerja Indonesia. Jangan pernah mengirim nomor kartu atau kredensial pembayaran."], ["Telepon", "Dukungan telepon diarahkan ke percakapan WhatsApp di +62 851-2156-5774."], ["Email", "Kirim email ke support@valydejersey.com dengan subjek ‘Dukungan pesanan’."]] },
	},
	accessibility: {
		en: { title: "Accessibility", intro: "Valyde Jersey is designed to support keyboard, screen-reader, zoom, and reduced-motion use.", sections: [["Using the site", "Interactive controls have visible keyboard focus and motion respects your system preference."], ["Need assistance?", "If something prevents you from browsing or checking out, contact support and name the page, device, and assistive technology involved."]] },
		id: { title: "Aksesibilitas", intro: "Valyde Jersey dirancang untuk penggunaan keyboard, pembaca layar, zoom, dan pengurangan gerakan.", sections: [["Menggunakan situs", "Kontrol interaktif memiliki fokus keyboard yang terlihat dan gerakan mengikuti preferensi sistem Anda."], ["Butuh bantuan?", "Jika ada kendala saat berbelanja, hubungi dukungan dan sebutkan halaman, perangkat, serta teknologi bantu yang digunakan."]] },
	},
	privacy: {
		en: { title: "Privacy policy", intro: "We collect only the information required to operate the storefront and fulfil orders.", sections: [["Information used", "Checkout details are used for payment, delivery, fraud prevention, and order communication."], ["Local storage", "Cart contents and language preference are stored in your browser so they survive a return visit."], ["Payments", "Payment information is handled by the connected payment provider and is not stored by this storefront."]] },
		id: { title: "Kebijakan privasi", intro: "Kami hanya mengumpulkan informasi yang diperlukan untuk menjalankan toko dan memenuhi pesanan.", sections: [["Informasi yang digunakan", "Detail checkout digunakan untuk pembayaran, pengiriman, pencegahan penipuan, dan komunikasi pesanan."], ["Penyimpanan lokal", "Isi keranjang dan pilihan bahasa disimpan di browser agar tetap tersedia saat Anda kembali."], ["Pembayaran", "Informasi pembayaran diproses oleh penyedia pembayaran dan tidak disimpan oleh toko ini."]] },
	},
	terms: {
		en: { title: "Terms of service", intro: "The terms that apply when browsing and ordering through Valyde Jersey.", sections: [["Catalog", "Prices, stock, and product information may change before an order is confirmed."], ["Orders", "An order is accepted after payment confirmation. Orders may be cancelled and refunded if stock or delivery becomes unavailable."], ["Fair use", "Do not interfere with the storefront, attempt unauthorized access, or misuse checkout and promotion systems."]] },
		id: { title: "Ketentuan layanan", intro: "Ketentuan yang berlaku saat menjelajah dan memesan melalui Valyde Jersey.", sections: [["Katalog", "Harga, stok, dan informasi produk dapat berubah sebelum pesanan dikonfirmasi."], ["Pesanan", "Pesanan diterima setelah pembayaran terkonfirmasi. Pesanan dapat dibatalkan dan dikembalikan dananya jika stok atau pengiriman tidak tersedia."], ["Penggunaan wajar", "Jangan mengganggu toko, mencoba akses tanpa izin, atau menyalahgunakan checkout dan sistem promosi."]] },
	},
} as const;

type HelpSlug = keyof typeof documents;
export function generateStaticParams() { return Object.keys(documents).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale: value, slug } = await params; const locale = parseLocale(value); if (!locale) return {}; const document = documents[slug as HelpSlug]?.[locale]; const basePath = `/help/${slug}`; return document ? { title: document.title, description: document.intro, alternates: { canonical: localizedPath(locale, basePath), ...localeAlternates(basePath) } } : {}; }

export default async function HelpPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
	const { locale: value, slug } = await params;
	const locale = parseLocale(value);
	if (!locale) notFound();
	const document = documents[slug as HelpSlug]?.[locale];
	if (!document) notFound();
	const homePath = localizedPath(locale);
	const helpPath = localizedPath(locale, `/help/${slug}`);
	const phoneSection = locale === "id" ? "Telepon" : "Telephone";
	return <main className="page-shell help-page"><StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Valyde Jersey", item: absoluteUrl(homePath) }, { "@type": "ListItem", position: 2, name: document.title, item: absoluteUrl(helpPath) }] }} /><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={homePath}>Valyde Jersey</Link><span>/</span><strong>{document.title}</strong></nav><header><h1>{document.title}</h1><p>{document.intro}</p></header><div className="help-content">{document.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p>{slug === "contact" && title === phoneSection ? <a className="text-link" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">{SUPPORT_PHONE_DISPLAY}</a> : null}{slug === "contact" && title === "Email" ? <a className="text-link" href={SUPPORT_MAILTO_URL}>{SUPPORT_EMAIL}</a> : null}</section>)}</div></main>;
}
