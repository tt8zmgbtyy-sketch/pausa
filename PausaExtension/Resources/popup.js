(function () {
  "use strict";
  const api = globalThis.browser;
  const toggle = document.getElementById("enabled");
  const state = document.getElementById("state");
  const feedback = document.getElementById("feedback");
  let saved = true;

  function showState() {
    toggle.checked = saved;
    state.textContent = saved ? "Ligada nas páginas autorizadas" : "Desligada";
  }

  api.storage.local.get({ enabled: true }).then((values) => {
    saved = values.enabled !== false;
    showState();
    toggle.disabled = false;
  }).catch(() => {
    state.textContent = "Preferência indisponível";
    feedback.textContent = "Não foi possível ler a preferência. Feche e reabra a extensão para tentar novamente.";
  });

  toggle.addEventListener("change", async () => {
    const requested = toggle.checked;
    toggle.disabled = true;
    feedback.textContent = "";
    try {
      await api.storage.local.set({ enabled: requested });
      saved = requested;
    } catch {
      feedback.textContent = "Não foi possível salvar. A preferência anterior foi mantida.";
    } finally {
      showState();
      toggle.disabled = false;
    }
  });
})();
