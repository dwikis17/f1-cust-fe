import assert from "node:assert/strict";
import test from "node:test";
import { CHECKOUT_DETAILS_STORAGE_KEY, emptyShippingDetails, parseStoredShippingDetails, readStoredShippingDetails, writeStoredShippingDetails } from "./checkout-details.ts";

const details = { email: "a@b.co", firstName: "Ana", lastName: "Putri", address: "Jl. Sudirman 1", province: "DKI Jakarta", city: "Jakarta", postalCode: "12240", phone: "0812345678" };

test("checkout details round-trip through storage", () => {
	const values = new Map<string, string>();
	const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => void values.set(key, value) };
	assert.deepEqual(readStoredShippingDetails(storage), emptyShippingDetails);
	writeStoredShippingDetails(storage, details);
	assert.ok(values.has(CHECKOUT_DETAILS_STORAGE_KEY));
	assert.deepEqual(readStoredShippingDetails(storage), details);
});

test("checkout details ignore malformed data and failing storage", () => {
	assert.deepEqual(parseStoredShippingDetails("not json"), emptyShippingDetails);
	assert.deepEqual(parseStoredShippingDetails("[1]"), emptyShippingDetails);
	assert.deepEqual(parseStoredShippingDetails(JSON.stringify({ email: 5, city: "Bandung", postalCode: "40a1159", extra: "x" })), { ...emptyShippingDetails, city: "Bandung", postalCode: "40115" });
	const throwing = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
	assert.deepEqual(readStoredShippingDetails(throwing), emptyShippingDetails);
	assert.doesNotThrow(() => writeStoredShippingDetails(throwing, details));
	assert.deepEqual(readStoredShippingDetails(undefined), emptyShippingDetails);
});
