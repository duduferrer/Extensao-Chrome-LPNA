const MARCA_INI = "\u200B\u200B";
const MARCA_FIM = "\u200C\u200C";

function normalizar(s) {
  return (s || "").replace(/\s+/g, " ").trim().normalize("NFC").toLowerCase();
}

function nomeAcessivel(el) {
  const labelledby = el.getAttribute("aria-labelledby");
  if (labelledby) {
    const texto = labelledby
      .split(/\s+/)
      .map(id => document.getElementById(id)?.textContent || "")
      .join(" ");
    if (normalizar(texto)) return normalizar(texto);
  }

  const ariaLabel = el.getAttribute("aria-label");
  if (normalizar(ariaLabel)) return normalizar(ariaLabel);

  if (el.labels?.length) {
    const texto = [...el.labels].map(l => l.textContent).join(" ");
    if (normalizar(texto)) return normalizar(texto);
  }

  const formControl = el.closest(".MuiFormControl-root");
  const labelEl = formControl?.querySelector("label, .MuiInputLabel-root");
  if (labelEl && normalizar(labelEl.textContent)) {
    return normalizar(labelEl.textContent);
  }

  const placeholder = el.getAttribute("placeholder");
  if (normalizar(placeholder)) return normalizar(placeholder);

  return "";
}

function acharPorNome(nome) {
  const alvo = normalizar(nome);
  const seletor = [
    'input:not([type="hidden"])',
    'textarea:not([aria-hidden="true"])',
    'select',
    '[role="combobox"]',
    '[role="textbox"]',
    '[role="button"][aria-haspopup="listbox"]'
  ].join(", ");

  for (const el of document.querySelectorAll(seletor)) {
    if (nomeAcessivel(el) === alvo) return el;
  }
  return null;
}

function campoReal(el) {
  if (!el) return null;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el;
  return el.querySelector('textarea:not([aria-hidden="true"]), input:not([type="hidden"])') ?? el;
}

function lerValor(el) {
  const ehCombobox =
    el.getAttribute("role") === "combobox" || el.hasAttribute("aria-haspopup");

  if (ehCombobox) {
    const raiz =
      el.closest(".MuiAutocomplete-root") ||
      el.closest(".MuiInputBase-root") ||
      el.closest(".MuiFormControl-root") ||
      el.parentElement;

    const chips = raiz?.querySelectorAll(".MuiChip-label") ?? [];
    if (chips.length) {
      return [...chips].map(c => c.textContent.trim());
    }

    if (el.tagName === "INPUT" && el.value) return el.value;

    const sel = raiz?.querySelector(".MuiSelect-select");
    if (sel) return sel.textContent.trim();

    return el.value || "";
  }

  if (el.type === "checkbox") return el.checked;
  if (el.tagName === "SELECT" && el.multiple)
    return [...el.selectedOptions].map(o => o.value);

  return el.value;
}

const CAMPOS = {
  date: "Data",
  start: "Hora de Início",
  workload: "Carga horária",
  position: "Posição",
  sectorization: "Setor",
  complexity: "Complexidade",
  restrictions: "Restrições Técnicas",
  operational: "Condições Operacionais"
};

function lerCampo(nome) {
  const el = acharPorNome(nome);
  if (!el) {
    console.warn(`[ext] Campo "${nome}" não encontrado.`);
    return null;
  }
  return lerValor(el);
}

function setValorReact(el, valor) {
  if (!el) throw new Error("setValorReact: elemento nulo");

  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype :
    el instanceof HTMLInputElement    ? HTMLInputElement.prototype :
    null;

  if (!proto) {
    throw new Error(
      `setValorReact: elemento não suportado <${el.tagName?.toLowerCase()}>`
    );
  }

  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, valor);

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function textoDoUsuario(valor) {
  const ini = valor.indexOf(MARCA_INI);
  const fim = valor.indexOf(MARCA_FIM);

  if (ini === -1 || fim === -1 || fim < ini) return valor.trim();

  const antes = valor.slice(0, ini);
  const depois = valor.slice(fim + MARCA_FIM.length);
  return (antes + depois).trim();
}

function aplicarBloco(el, texto) {
  const usuario = textoDoUsuario(el.value);
  const bloco = `${MARCA_INI}${texto}${MARCA_FIM}`;
  const novo = usuario ? `${bloco}\n${usuario}` : bloco;
  setValorReact(el, novo);
}

function fmt(v) {
  return Array.isArray(v) ? v.join(", ") : (v ?? "");
}

function temValor(v) {
  return Array.isArray(v) ? v.length > 0 : Boolean(v);
}

function dataBR(iso) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const COMPLEXIDADE = {
  1: "Muito Baixa",
  2: "Baixa",
  3: "Média",
  4: "Alta"
};

function decodeComplexity(code) {
  if (code === null || code === undefined || code === "") return "";
  const n = Number(code);
  return Number.isInteger(n) && COMPLEXIDADE[n] ? COMPLEXIDADE[n] : String(code);
}

function montarTexto(dict) {
  const linhas = [
    `Data: ${dataBR(dict.date)} - ${fmt(dict.start)}`,
    `Posição: ${fmt(dict.position)} - Setores: ${fmt(dict.sectorization)} - Complexidade: ${decodeComplexity(dict.complexity)}`
  ];

  if (temValor(dict.operational)) {
    linhas.push(`Condições Operacionais: ${fmt(dict.operational)}`);
  }

  if (temValor(dict.restrictions)) {
    linhas.push(`Restrições Técnicas: ${fmt(dict.restrictions)}`);
  }

  return linhas.join("\n");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PREENCHER") {
    const dict = {};
    const faltando = [];
    for (const [chave, rotulo] of Object.entries(CAMPOS)) {
      const valor = lerCampo(rotulo);
      dict[chave] = valor;
      if (valor === null) faltando.push(rotulo);
    }

    const el = campoReal(acharPorNome("Comentários"));
    if (!el) {
      sendResponse({ ok: false, erro: "Campo Comentários não encontrado" });
      return true;
    }

    aplicarBloco(el, montarTexto(dict));
    sendResponse({ ok: true, valor: dict, faltando });
  }
  return true;
});