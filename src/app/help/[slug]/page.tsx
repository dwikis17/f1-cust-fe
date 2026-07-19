import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocale } from "@/lib/locale";

const documents = {
	"shipping-returns": {
		en: { title: "Shipping & returns", intro: "Clear delivery expectations before you place an order.", sections: [["Delivery", "Tracked Indonesian delivery options and prices are calculated from your postcode during checkout."], ["Dispatch", "In-stock merchandise is prepared after payment confirmation. Tracking details are sent to the checkout email address."], ["Returns", "Unused merchandise may be returned within 14 days of delivery in its original packaging. Contact support before returning an item so the return can be identified."]] },
		id: { title: "Pengiriman & pengembalian", intro: "Informasi pengiriman yang jelas sebelum Anda memesan.", sections: [["Pengiriman", "Pilihan dan biaya pengiriman terlacak di Indonesia dihitung dari kode pos Anda saat checkout."], ["Persiapan", "Produk yang tersedia disiapkan setelah pembayaran terkonfirmasi. Detail pelacakan dikirim ke email checkout."], ["Pengembalian", "Produk yang belum digunakan dapat dikembalikan dalam 14 hari setelah diterima dengan kemasan asli. Hubungi dukungan sebelum mengirimkannya."]] },
	},
	contact: {
		en: { title: "Contact", intro: "We are here to help with products, delivery, and existing orders.", sections: [["Order support", "Include your order ID, checkout email, and a short description when requesting help."], ["Response time", "Support requests are reviewed during Indonesian business hours. Never send card numbers or payment credentials."], ["Start a request", "Email support@valdye.com with the subject ‘Order support’."]] },
		id: { title: "Kontak", intro: "Kami siap membantu terkait produk, pengiriman, dan pesanan.", sections: [["Dukungan pesanan", "Sertakan ID pesanan, email checkout, dan penjelasan singkat saat meminta bantuan."], ["Waktu respons", "Permintaan ditinjau pada jam kerja Indonesia. Jangan pernah mengirim nomor kartu atau kredensial pembayaran."], ["Mulai permintaan", "Kirim email ke support@valdye.com dengan subjek ‘Dukungan pesanan’."]] },
	},
	accessibility: {
		en: { title: "Accessibility", intro: "VALDYE is designed to support keyboard, screen-reader, zoom, and reduced-motion use.", sections: [["Using the site", "Interactive controls have visible keyboard focus and motion respects your system preference."], ["Need assistance?", "If something prevents you from browsing or checking out, contact support and name the page, device, and assistive technology involved."]] },
		id: { title: "Aksesibilitas", intro: "VALDYE dirancang untuk penggunaan keyboard, pembaca layar, zoom, dan pengurangan gerakan.", sections: [["Menggunakan situs", "Kontrol interaktif memiliki fokus keyboard yang terlihat dan gerakan mengikuti preferensi sistem Anda."], ["Butuh bantuan?", "Jika ada kendala saat berbelanja, hubungi dukungan dan sebutkan halaman, perangkat, serta teknologi bantu yang digunakan."]] },
	},
	privacy: {
		en: { title: "Privacy policy", intro: "We collect only the information required to operate the storefront and fulfil orders.", sections: [["Information used", "Checkout details are used for payment, delivery, fraud prevention, and order communication."], ["Local storage", "Cart contents and language preference are stored in your browser so they survive a return visit."], ["Payments", "Payment information is handled by the connected payment provider and is not stored by this storefront."]] },
		id: { title: "Kebijakan privasi", intro: "Kami hanya mengumpulkan informasi yang diperlukan untuk menjalankan toko dan memenuhi pesanan.", sections: [["Informasi yang digunakan", "Detail checkout digunakan untuk pembayaran, pengiriman, pencegahan penipuan, dan komunikasi pesanan."], ["Penyimpanan lokal", "Isi keranjang dan pilihan bahasa disimpan di browser agar tetap tersedia saat Anda kembali."], ["Pembayaran", "Informasi pembayaran diproses oleh penyedia pembayaran dan tidak disimpan oleh toko ini."]] },
	},
	terms: {
		en: { title: "Terms of service", intro: "The terms that apply when browsing and ordering through VALDYE.", sections: [["Catalog", "Prices, stock, and product information may change before an order is confirmed."], ["Orders", "An order is accepted after payment confirmation. Orders may be cancelled and refunded if stock or delivery becomes unavailable."], ["Fair use", "Do not interfere with the storefront, attempt unauthorized access, or misuse checkout and promotion systems."]] },
		id: { title: "Ketentuan layanan", intro: "Ketentuan yang berlaku saat menjelajah dan memesan melalui VALDYE.", sections: [["Katalog", "Harga, stok, dan informasi produk dapat berubah sebelum pesanan dikonfirmasi."], ["Pesanan", "Pesanan diterima setelah pembayaran terkonfirmasi. Pesanan dapat dibatalkan dan dikembalikan dananya jika stok atau pengiriman tidak tersedia."], ["Penggunaan wajar", "Jangan mengganggu toko, mencoba akses tanpa izin, atau menyalahgunakan checkout dan sistem promosi."]] },
	},
} as const;

type HelpSlug = keyof typeof documents;
export function generateStaticParams() { return Object.keys(documents).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const locale = await getLocale(); const document = documents[slug as HelpSlug]?.[locale]; return document ? { title: document.title } : {}; }

export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const locale = await getLocale();
	const document = documents[slug as HelpSlug]?.[locale];
	if (!document) notFound();
	return <main className="page-shell help-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">VALDYE</Link><span>/</span><strong>{document.title}</strong></nav><header><h1>{document.title}</h1><p>{document.intro}</p></header><div className="help-content">{document.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p>{slug === "contact" && title === (locale === "id" ? "Mulai permintaan" : "Start a request") ? <a className="text-link" href="mailto:support@valdye.com">support@valdye.com</a> : null}</section>)}</div></main>;
}
