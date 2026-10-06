import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, loadConfig } from "../src/server.js";

test("read-only bridge authenticates and forwards only allowlisted resources", async () => {
  const calls = [];
  const base = new URL("http://127.0.0.1:1234/");
  const server = createServer({ base, token: "test-token", user: "test", password: "test" }, async (url, options) => {
    calls.push({ url: String(url), method: options.method });
    return new Response("<contacts/>", { status: 200 });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const endpoint = "http://127.0.0.1:" + server.address().port;
  try {
    assert.equal((await fetch(endpoint + "/contacts")).status, 401);
    assert.equal((await fetch(endpoint + "/contacts", { method: "POST", headers: { authorization: "Bearer test-token" } })).status, 405);
    assert.equal((await fetch(endpoint + "/invoices", { headers: { authorization: "Bearer test-token" } })).status, 404);
    const response = await fetch(endpoint + "/contacts?page=2", { headers: { authorization: "Bearer test-token" } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { resource: "contacts", page: 2, xml: "<contacts/>" });
    assert.deepEqual(calls, [{ url: "http://127.0.0.1:1234/contacts.xml?page=2", method: "GET" }]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("configuration reads only private secret files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "muse-kit-"));
  const paths = ["token", "user", "password"].map((name) => join(directory, name));
  try {
    for (const path of paths) await writeFile(path, "test-value\n", { mode: 0o600 });
    const env = { INCWO_API_BASE_URL: "https://example.com/api", CONNECTOR_TOKEN_FILE: paths[0], INCWO_USER_FILE: paths[1], INCWO_PASSWORD_FILE: paths[2] };
    const config = await loadConfig(env);
    assert.equal(config.base.href, "https://example.com/api/");
    await chmod(paths[0], 0o644);
    await assert.rejects(loadConfig(env), /E_CONFIG/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
