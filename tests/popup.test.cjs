const test = require("node:test");
const assert = require("node:assert/strict");
const { popupPage, settle } = require("./helpers.cjs");

test("popup loads the saved protection preference and permits interaction", async (t) => {
  for (const enabled of [true, false]) {
    const page = await popupPage(t, { enabled });
    const toggle = page.document.getElementById("enabled");
    assert.equal(toggle.checked, enabled);
    assert.equal(toggle.disabled, false);
    assert.match(page.document.getElementById("state").textContent, enabled ? /Ligada/ : /Desligada/);
  }
});

test("popup writes a changed preference and displays the saved result", async (t) => {
  const page = await popupPage(t);
  const toggle = page.document.getElementById("enabled");
  toggle.checked = false;
  toggle.dispatchEvent(new page.window.Event("change"));
  assert.equal(toggle.disabled, true, "disable during save to prevent conflicting writes");
  await settle();
  assert.deepEqual(page.storage.writes, [false]);
  assert.equal(toggle.checked, false);
  assert.equal(toggle.disabled, false);
  assert.equal(page.document.getElementById("state").textContent, "Desligada");
  assert.equal(page.document.getElementById("feedback").textContent, "");
});

test("failed writes restore the earlier preference and explain the failure", async (t) => {
  const page = await popupPage(t, { enabled: true, setError: true });
  const toggle = page.document.getElementById("enabled");
  toggle.checked = false;
  toggle.dispatchEvent(new page.window.Event("change"));
  await settle();
  assert.equal(toggle.checked, true);
  assert.equal(toggle.disabled, false);
  assert.match(page.document.getElementById("state").textContent, /Ligada/);
  assert.match(page.document.getElementById("feedback").textContent, /Não foi possível salvar/);
});

test("failed reads keep the control disabled and request reopening", async (t) => {
  const page = await popupPage(t, { getError: true });
  assert.equal(page.document.getElementById("enabled").disabled, true);
  assert.equal(page.document.getElementById("state").textContent, "Preferência indisponível");
  assert.match(page.document.getElementById("feedback").textContent, /reabra/);
  assert.deepEqual(page.storage.writes, []);
});
