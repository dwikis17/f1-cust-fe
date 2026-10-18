export const CHECKOUT_DETAILS_STORAGE_KEY = "valyde-checkout-details";

export type ShippingDetails = {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	province: string;
	city: string;
	postalCode: string;
	phone: string;
};

type DetailsStorage = Pick<Storage, "getItem" | "setItem">;

export const emptyShippingDetails: ShippingDetails = { email: "", firstName: "", lastName: "", address: "", province: "", city: "", postalCode: "", phone: "" };

const fieldLimits: Record<keyof ShippingDetails, number> = {
	email: 254,
	firstName: 80,
	lastName: 80,
	address: 500,
	province: 120,
	city: 120,
	postalCode: 5,
	phone: 25,
};

export function parseStoredShippingDetails(value: string | null): ShippingDetails {
	if (!value) return emptyShippingDetails;
	try {
		const parsed: unknown = JSON.parse(value);
		if (!parsed || typeof parsed !== "object") return emptyShippingDetails;
		const record = parsed as Record<string, unknown>;
		const details = { ...emptyShippingDetails };
		for (const field of Object.keys(fieldLimits) as Array<keyof ShippingDetails>) {
			const fieldValue = record[field];
			if (typeof fieldValue !== "string") continue;
			details[field] = (field === "postalCode" ? fieldValue.replace(/\D/g, "") : fieldValue).slice(0, fieldLimits[field]);
		}
		return details;
	} catch {
		return emptyShippingDetails;
	}
}

export function browserStorage(): DetailsStorage | undefined {
	try {
		return typeof window === "undefined" ? undefined : window.localStorage;
	} catch {
		return undefined;
	}
}

// Storage can be unavailable or throw (private browsing, blocked site data); checkout must still work.
export function readStoredShippingDetails(storage: DetailsStorage | undefined): ShippingDetails {
	try {
		return parseStoredShippingDetails(storage?.getItem(CHECKOUT_DETAILS_STORAGE_KEY) ?? null);
	} catch {
		return emptyShippingDetails;
	}
}

export function writeStoredShippingDetails(storage: DetailsStorage | undefined, details: ShippingDetails) {
	try {
		storage?.setItem(CHECKOUT_DETAILS_STORAGE_KEY, JSON.stringify(details));
	} catch {
		// Saving is a convenience only.
	}
}
