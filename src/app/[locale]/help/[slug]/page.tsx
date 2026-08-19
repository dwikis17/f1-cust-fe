import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { SupportContactLinks } from "@/components/support-contact-links";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl } from "@/lib/seo";
import { SUPPORT_EMAIL, SUPPORT_MAILTO_URL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/support";

type HelpSection = {
	id?: string;
	title: string;
	body: string;
	items?: readonly string[];
};

type HelpFact = {
	label: string;
	value: string;
};

type HelpDocument = {
	title: string;
	intro: string;
	sections: readonly HelpSection[];
	facts?: readonly HelpFact[];
};

const documents: Record<string, { en: HelpDocument; id: HelpDocument }> = {
	"shipping-returns": {
		en: {
			title: "Shipping & returns",
			intro: "How Valyde Jersey processes orders, delivers across Indonesia, and handles returns or exchanges.",
			facts: [
				{ label: "Delivery", value: "Tracked rates at checkout" },
				{ label: "Return window", value: "3 calendar days" },
				{ label: "Condition", value: "Unused, tagged, with unboxing video" },
			],
			sections: [
				{
					id: "products-prices",
					title: "Products and prices",
					body: "We aim to show products accurately, including photos, size, colour, materials, and other details. Colour on screen can still differ slightly from the item because of lighting, device, or display settings. Prices, stock, promotions, and discounts may change at any time.",
				},
				{
					id: "orders-payment",
					title: "Orders and payment",
					body: "An order is processed after checkout is completed and payment is received in full. Available methods may include bank transfer, e-wallet, card, or other options shown at checkout. Valyde Jersey may cancel an order if payment is not completed within the stated time.",
				},
				{
					id: "shipping",
					title: "Shipping",
					body: "Orders are sent with the courier or logistics partner available at checkout. Delivery estimates vary by destination, service, and the courier’s operating conditions. Live tracked rates are calculated from your Indonesian delivery address; the amount shown at checkout is the shipping fee you pay.",
				},
				{
					id: "after-dispatch",
					title: "After dispatch",
					body: "Once the parcel is handed to the courier, the shipment is the courier’s responsibility. After it is marked delivered to the address you provided, later loss or damage is your responsibility, unless the courier’s policy or applicable law says otherwise. Tracking details are sent to your checkout email, and you can also follow the shipment from Track your order.",
				},
				{
					id: "returns-exchanges",
					title: "Returns and exchanges",
					body: "A return or exchange request must be submitted within 3 calendar days of delivery. The item must meet all of the following:",
					items: [
						"It has not been washed or worn.",
						"It is in the same condition as when it arrived.",
						"Original labels or tags are still attached.",
						"You include an unboxing video from when the parcel was first opened.",
					],
				},
				{
					id: "return-shipping",
					title: "Return shipping",
					body: "You cover shipping for a return or exchange, unless Valyde Jersey sent the wrong size, colour, or product, or the item has a defect that is our responsibility. Requests that do not meet these conditions may be declined.",
				},
				{
					id: "how-to-request",
					title: "How to request",
					body: "Contact us on WhatsApp or email before sending anything back. Include your order ID, checkout email, the item, and your unboxing video so we can confirm the next step.",
				},
			],
		},
		id: {
			title: "Pengiriman & pengembalian",
			intro: "Cara Valyde Jersey memproses pesanan, mengirim ke seluruh Indonesia, dan menangani pengembalian atau penukaran.",
			facts: [
				{ label: "Pengiriman", value: "Tarif terlacak di checkout" },
				{ label: "Batas pengembalian", value: "3 hari kalender" },
				{ label: "Kondisi", value: "Belum digunakan, tag terpasang, dengan video unboxing" },
			],
			sections: [
				{
					id: "products-prices",
					title: "Produk dan harga",
					body: "Valyde Jersey berusaha menampilkan informasi produk secara akurat, termasuk foto, ukuran, warna, bahan, dan detail lainnya. Warna pada foto tetap dapat sedikit berbeda dari barang aslinya karena pencahayaan, perangkat, atau pengaturan layar. Harga, stok, promosi, dan diskon dapat berubah sewaktu-waktu.",
				},
				{
					id: "orders-payment",
					title: "Pemesanan dan pembayaran",
					body: "Pesanan diproses setelah checkout selesai dan pembayaran diterima secara penuh. Metode yang tersedia dapat berupa transfer bank, e-wallet, kartu, atau opsi lain yang tampil di halaman checkout. Valyde Jersey berhak membatalkan pesanan jika pembayaran tidak diselesaikan dalam batas waktu yang ditentukan.",
				},
				{
					id: "shipping",
					title: "Pengiriman",
					body: "Pesanan dikirim melalui ekspedisi atau mitra logistik yang tersedia saat pemesanan. Estimasi tiba dapat berbeda tergantung lokasi tujuan, layanan yang dipilih, dan kondisi operasional ekspedisi. Tarif terlacak dihitung dari alamat pengiriman di Indonesia; jumlah yang tampil di checkout adalah biaya kirim yang Anda bayar.",
				},
				{
					id: "after-dispatch",
					title: "Setelah paket dikirim",
					body: "Setelah paket diserahkan kepada ekspedisi, proses pengiriman menjadi tanggung jawab pihak ekspedisi. Jika paket telah dinyatakan terkirim ke alamat yang Anda berikan, risiko kehilangan atau kerusakan setelah itu menjadi tanggung jawab pelanggan, kecuali ditentukan lain oleh kebijakan ekspedisi atau hukum yang berlaku. Detail pelacakan dikirim ke email checkout, dan kiriman juga dapat diikuti di Lacak pesanan.",
				},
				{
					id: "returns-exchanges",
					title: "Pengembalian dan penukaran",
					body: "Permintaan pengembalian atau penukaran dapat diajukan paling lambat 3 hari kalender setelah produk diterima. Produk harus memenuhi seluruh ketentuan berikut:",
					items: [
						"Belum dicuci atau digunakan.",
						"Kondisinya sama seperti saat diterima.",
						"Label atau tag asli masih terpasang.",
						"Anda menyertakan video unboxing saat paket pertama kali dibuka.",
					],
				},
				{
					id: "return-shipping",
					title: "Biaya pengembalian",
					body: "Biaya kirim untuk pengembalian atau penukaran ditanggung pelanggan, kecuali kesalahan ada di pihak Valyde Jersey, seperti salah ukuran, warna, atau produk, atau terdapat cacat yang menjadi tanggung jawab kami. Pengajuan yang tidak memenuhi ketentuan ini dapat ditolak.",
				},
				{
					id: "how-to-request",
					title: "Cara mengajukan",
					body: "Hubungi kami melalui WhatsApp atau email sebelum mengirim barang kembali. Sertakan ID pesanan, email checkout, barang yang diajukan, dan video unboxing agar kami dapat mengonfirmasi langkah berikutnya.",
				},
			],
		},
	},
	contact: {
		en: { title: "Contact", intro: "We are here to help with products, delivery, and existing orders.", sections: [{ title: "Order support", body: "Include your order ID, checkout email, and a short description when requesting help." }, { title: "Response time", body: "Support requests are reviewed during Indonesian business hours. Never send card numbers or payment credentials." }, { title: "Telephone", body: "Telephone support opens a WhatsApp chat at +62 851-2156-5774." }, { title: "Email", body: "Email support@valydejersey.com with the subject ‘Order support’." }] },
		id: { title: "Kontak", intro: "Kami siap membantu terkait produk, pengiriman, dan pesanan.", sections: [{ title: "Dukungan pesanan", body: "Sertakan ID pesanan, email checkout, dan penjelasan singkat saat meminta bantuan." }, { title: "Waktu respons", body: "Permintaan ditinjau pada jam kerja Indonesia. Jangan pernah mengirim nomor kartu atau kredensial pembayaran." }, { title: "Telepon", body: "Dukungan telepon diarahkan ke percakapan WhatsApp di +62 851-2156-5774." }, { title: "Email", body: "Kirim email ke support@valydejersey.com dengan subjek ‘Dukungan pesanan’." }] },
	},
	accessibility: {
		en: { title: "Accessibility", intro: "Valyde Jersey is designed to support keyboard, screen-reader, zoom, and reduced-motion use.", sections: [{ title: "Using the site", body: "Interactive controls have visible keyboard focus and motion respects your system preference." }, { title: "Need assistance?", body: "If something prevents you from browsing or checking out, contact support and name the page, device, and assistive technology involved." }] },
		id: { title: "Aksesibilitas", intro: "Valyde Jersey dirancang untuk penggunaan keyboard, pembaca layar, zoom, dan pengurangan gerakan.", sections: [{ title: "Menggunakan situs", body: "Kontrol interaktif memiliki fokus keyboard yang terlihat dan gerakan mengikuti preferensi sistem Anda." }, { title: "Butuh bantuan?", body: "Jika ada kendala saat berbelanja, hubungi dukungan dan sebutkan halaman, perangkat, serta teknologi bantu yang digunakan." }] },
	},
	privacy: {
		en: { title: "Privacy policy", intro: "We collect only the information required to operate the storefront and fulfil orders.", sections: [{ title: "Information used", body: "Checkout details are used for payment, delivery, fraud prevention, and order communication." }, { title: "Local storage", body: "Cart contents and language preference are stored in your browser so they survive a return visit." }, { title: "Payments", body: "Payment information is handled by the connected payment provider and is not stored by this storefront." }] },
		id: { title: "Kebijakan privasi", intro: "Kami hanya mengumpulkan informasi yang diperlukan untuk menjalankan toko dan memenuhi pesanan.", sections: [{ title: "Informasi yang digunakan", body: "Detail checkout digunakan untuk pembayaran, pengiriman, pencegahan penipuan, dan komunikasi pesanan." }, { title: "Penyimpanan lokal", body: "Isi keranjang dan pilihan bahasa disimpan di browser agar tetap tersedia saat Anda kembali." }, { title: "Pembayaran", body: "Informasi pembayaran diproses oleh penyedia pembayaran dan tidak disimpan oleh toko ini." }] },
	},
	terms: {
		en: {
			title: "Terms and conditions",
			intro: "By using this site you confirm that you have read, understood, and agreed to these terms.",
			sections: [
				{
					title: "General",
					body: "Welcome to Valyde Jersey. Users must be at least 17 years old, or use this site with the guidance and consent of a parent or guardian.",
				},
				{
					title: "Products and prices",
					body: "Valyde Jersey aims to present products accurately, including photos, size, colour, materials, and other details. Colour on screen can still differ slightly from the item because of lighting, device, or display settings. Prices, stock, promotions, and discounts may change at any time.",
				},
				{
					title: "Orders and payment",
					body: "Orders are processed after checkout is completed and payment is received in full. Payment methods may include bank transfer, e-wallet, card, or other options shown at checkout. Valyde Jersey may cancel an order if payment is not completed within the stated time.",
				},
				{
					title: "Shipping",
					body: "Orders are sent with the courier or logistics partner available at the time of order. Delivery estimates vary by destination, service, and the courier’s operating conditions. Once the parcel is handed to the courier, the shipment is the courier’s responsibility. After it is marked delivered to the address you provided, later loss or damage is your responsibility, unless the courier’s policy or applicable law says otherwise.",
				},
				{
					title: "Returns and exchanges",
					body: "A return or exchange request must be submitted within 3 calendar days of delivery. The item must not have been washed or worn, must be in the same condition as received, must still have original labels or tags attached, and must be accompanied by an unboxing video from when the parcel was first opened. You cover return or exchange shipping unless Valyde Jersey sent the wrong size, colour, or product, or the item has a defect that is our responsibility. Requests that do not meet these conditions may be declined.",
				},
				{
					title: "Intellectual property",
					body: "All content on the Valyde Jersey site, including but not limited to the logo, store name, product photos, text, design, graphics, and other materials, is owned by Valyde Jersey or used with permission. Copying, reproducing, distributing, modifying, or reusing any part of this content without written permission from Valyde Jersey is not allowed and may be pursued under applicable law.",
				},
			],
		},
		id: {
			title: "Syarat dan ketentuan",
			intro: "Dengan mengakses dan menggunakan situs ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.",
			sections: [
				{
					title: "Ketentuan umum",
					body: "Selamat datang di Valyde Jersey. Pengguna situs wajib berusia minimal 17 tahun, atau menggunakan situs ini dengan pendampingan dan persetujuan orang tua atau wali.",
				},
				{
					title: "Produk dan harga",
					body: "Valyde Jersey berusaha menampilkan informasi produk secara akurat, termasuk foto, ukuran, warna, bahan, dan detail lainnya. Warna pada foto tetap dapat sedikit berbeda dari barang aslinya karena pencahayaan, perangkat, atau pengaturan layar. Harga, stok, promosi, dan diskon dapat berubah sewaktu-waktu.",
				},
				{
					title: "Pemesanan dan pembayaran",
					body: "Pesanan diproses setelah checkout selesai dan pembayaran diterima secara penuh. Metode pembayaran dapat berupa transfer bank, e-wallet, kartu, atau opsi lain yang tersedia di halaman checkout. Valyde Jersey berhak membatalkan pesanan jika pembayaran tidak diselesaikan dalam batas waktu yang ditentukan.",
				},
				{
					title: "Pengiriman",
					body: "Pesanan dikirim melalui jasa ekspedisi atau mitra logistik yang tersedia pada saat pemesanan. Estimasi waktu pengiriman dapat berbeda tergantung lokasi tujuan, jenis layanan yang dipilih, dan kondisi operasional pihak ekspedisi. Setelah paket diserahkan kepada ekspedisi, proses pengiriman menjadi tanggung jawab pihak ekspedisi. Untuk pesanan yang telah dinyatakan terkirim ke alamat yang diberikan pelanggan, risiko kehilangan atau kerusakan setelah itu menjadi tanggung jawab pelanggan, kecuali ditentukan lain oleh kebijakan ekspedisi atau hukum yang berlaku.",
				},
				{
					title: "Pengembalian dan penukaran",
					body: "Permintaan pengembalian atau penukaran dapat diajukan paling lambat 3 hari kalender setelah produk diterima. Produk belum boleh dicuci atau digunakan, kondisinya harus sama seperti saat diterima, label atau tag masih terpasang, dan pelanggan wajib menyertakan video unboxing saat paket pertama kali dibuka. Biaya kirim pengembalian atau penukaran menjadi tanggung jawab pelanggan, kecuali kesalahan terjadi dari pihak Valyde Jersey, seperti salah ukuran, warna, atau produk, atau terdapat cacat produk yang menjadi tanggung jawab kami. Pengajuan yang tidak memenuhi persyaratan ini dapat ditolak.",
				},
				{
					title: "Hak kekayaan intelektual",
					body: "Seluruh konten pada situs Valyde Jersey, termasuk namun tidak terbatas pada logo, nama toko, foto produk, teks, desain, grafis, dan materi lainnya, merupakan hak milik Valyde Jersey atau digunakan secara sah oleh kami. Dilarang menyalin, menggandakan, mendistribusikan, memodifikasi, atau menggunakan kembali sebagian maupun seluruh konten tanpa izin tertulis dari Valyde Jersey. Penggunaan konten tanpa izin dapat ditindak sesuai ketentuan hukum yang berlaku.",
				},
			],
		},
	},
};

type HelpSlug = keyof typeof documents;

export function generateStaticParams() {
	return Object.keys(documents).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
	const { locale: value, slug } = await params;
	const locale = parseLocale(value);
	if (!locale) return {};
	const document = documents[slug as HelpSlug]?.[locale];
	const basePath = `/help/${slug}`;
	return document ? { title: document.title, description: document.intro, alternates: { canonical: localizedPath(locale, basePath), ...localeAlternates(basePath) } } : {};
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
	const { locale: value, slug } = await params;
	const locale = parseLocale(value);
	if (!locale) notFound();
	const document = documents[slug as HelpSlug]?.[locale];
	if (!document) notFound();
	const messages = dictionary(locale);
	const homePath = localizedPath(locale);
	const helpPath = localizedPath(locale, `/help/${slug}`);
	const isShippingReturns = slug === "shipping-returns";
	const phoneSection = locale === "id" ? "Telepon" : "Telephone";
	const requestSection = locale === "id" ? "Cara mengajukan" : "How to request";
	const contentsTitle = locale === "id" ? "Di halaman ini" : "On this page";
	const factsTitle = locale === "id" ? "Ringkasan" : "At a glance";
	const content = (
		<div className={`help-content${isShippingReturns ? " shipping-returns-content" : ""}`}>
			{document.sections.map((section) => {
				const headingId = section.id ? `${section.id}-title` : undefined;
				const isRequestSection = isShippingReturns && section.title === requestSection;
				return (
					<section className={isRequestSection ? "shipping-request-section" : undefined} id={section.id} aria-labelledby={headingId} key={section.title}>
						<h2 id={headingId}>{section.title}</h2>
						<p>{section.body}</p>
						{section.items ? (
							<ul>
								{section.items.map((item) => <li key={item}>{item}</li>)}
							</ul>
						) : null}
						{slug === "contact" && section.title === phoneSection ? <a className="text-link" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">{SUPPORT_PHONE_DISPLAY}</a> : null}
						{slug === "contact" && section.title === "Email" ? <a className="text-link" href={SUPPORT_MAILTO_URL}>{SUPPORT_EMAIL}</a> : null}
						{isRequestSection ? (
							<SupportContactLinks whatsappLabel={messages.footer.whatsapp} emailLabel={messages.footer.email} />
						) : null}
					</section>
				);
			})}
		</div>
	);

	return (
		<main className={`page-shell help-page${isShippingReturns ? " shipping-returns-page" : ""}`}>
			<StructuredData data={{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: "Valyde Jersey", item: absoluteUrl(homePath) },
					{ "@type": "ListItem", position: 2, name: document.title, item: absoluteUrl(helpPath) },
				],
			}} />
			<nav className="breadcrumbs" aria-label="Breadcrumb">
				<Link href={homePath}>Valyde Jersey</Link><span>/</span><strong>{document.title}</strong>
			</nav>
			{isShippingReturns ? (
				<>
					<header className="shipping-returns-hero">
						<h1>{document.title}</h1>
						<p>{document.intro}</p>
					</header>
					{document.facts ? (
						<section className="shipping-facts" aria-labelledby="shipping-facts-title">
							<h2 className="sr-only" id="shipping-facts-title">{factsTitle}</h2>
							<div className="shipping-facts-grid">
								{document.facts.map((fact) => (
									<div className="shipping-fact" key={fact.label}>
										<p className="shipping-fact-label">{fact.label}</p>
										<p className="shipping-fact-value">{fact.value}</p>
									</div>
								))}
							</div>
						</section>
					) : null}
					<div className="shipping-returns-layout">
						<aside className="shipping-contents">
							<p className="shipping-contents-title">{contentsTitle}</p>
							<nav aria-label={contentsTitle}>
								<ul>
									{document.sections.map((section) => section.id ? <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li> : null)}
								</ul>
							</nav>
						</aside>
						{content}
					</div>
				</>
			) : (
				<>
					<header>
						<h1>{document.title}</h1>
						<p>{document.intro}</p>
					</header>
					{content}
				</>
			)}
		</main>
	);
}
