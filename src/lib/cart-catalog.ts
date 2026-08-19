export type CartItemProduct = {
	product: {
		id: string;
		name: string;
		slug: string;
		priceIdr: number;
		merchandisingLabel: string;
		photo: { url: string; altText: string } | null;
	};
	variant: {
		id: string;
		sku: string;
		size: string | null;
		color: string | null;
		stockQuantity: number;
		available: boolean;
		unitsSold: number;
	};
};

export type CartItemsResponse = { data: CartItemProduct[]; missingVariantIds: string[] };
