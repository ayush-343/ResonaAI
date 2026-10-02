import { test } from "node:test";
import assert from "node:assert/strict";
import { listCloudRecords } from "../src/features/history/cloud-client";
test("non-JSON history errors show recoverable copy instead of parser errors", async t => {
 t.mock.method(globalThis, "fetch", async () => new Response("Temporary server failure", {status:502}));
 await assert.rejects(listCloudRecords(), /temporarily unavailable.*still on this device/);
});
test("expired sessions give a sign-in instruction even without a JSON body", async t => {
 t.mock.method(globalThis, "fetch", async () => new Response(null, {status:401}));
 await assert.rejects(listCloudRecords(), /Sign in again/);
});
