import { test } from "node:test";
import assert from "node:assert/strict";
import { workspaceReturnPath } from "../src/lib/workspace-return";
test("workspace selection preserves Studio handoff and rejects external destinations", () => {
  const path = "/text-to-speech?draft=sample&voice=hf_alpha&language=hinglish";
  assert.equal(workspaceReturnPath(path), path);
  assert.equal(workspaceReturnPath("/voices?tab=cloning"), "/voices?tab=cloning");
  for (const invalid of ["https://example.com", "//example.com", "/sign-in", "/home\\evil", "/home\n", undefined]) assert.equal(workspaceReturnPath(invalid), "/home");
});
