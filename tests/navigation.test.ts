import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DASHBOARD_ROUTES, PROFILE_PATH, WORKSPACE_PATH, isActiveRoute } from "../src/features/dashboard/data/navigation";
test("every sidebar destination has a real page rather than a fragment", () => {
  for (const route of DASHBOARD_ROUTES) {
    assert.ok(!route.url.includes("#"));
    assert.ok(existsSync(`src/app/(dashboard)${route.url}/page.tsx`),route.url);
  }
});
test("active navigation matches nested settings without matching siblings", () => {
  assert.ok(isActiveRoute(PROFILE_PATH + "/security", "/settings"));
  assert.ok(isActiveRoute(PROFILE_PATH + "/security", PROFILE_PATH));
  assert.ok(isActiveRoute(WORKSPACE_PATH + "/members", WORKSPACE_PATH));
  assert.ok(!isActiveRoute(PROFILE_PATH, WORKSPACE_PATH));
  assert.ok(!isActiveRoute("/settings-extra", "/settings"));
  assert.ok(!isActiveRoute("/voices", "/"));
});
