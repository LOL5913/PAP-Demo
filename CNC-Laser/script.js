// ---------- Configuração ----------
// Troca pelo teu email real de suporte.
const EMAIL_SUPORTE = "emailtestedesuporte";

// ---------- Navegação entre telas ----------
const TELAS = {
  inicio: "CNC Laser",
  informacoes: "Informações · CNC Laser",
  downloads: "Downloads · CNC Laser",
  suporte: "Suporte · CNC Laser",
};

function mostrar(nome, { mudarHash = true, focar = true } = {}) {
  if (!TELAS[nome]) nome = "inicio";

  document.querySelectorAll(".tela").forEach((tela) => {
    tela.hidden = tela.id !== `view-${nome}`;
  });

  document.querySelectorAll(".menu button").forEach((botao) => {
    if (botao.dataset.go === nome) botao.setAttribute("aria-current", "page");
    else botao.removeAttribute("aria-current");
  });

  document.title = TELAS[nome];
  if (mudarHash && location.hash !== `#${nome}`) history.pushState(null, "", `#${nome}`);

  window.scrollTo({ top: 0 });
  if (focar) document.querySelector(`#view-${nome} h1`)?.focus({ preventScroll: true });
}

// Qualquer elemento com data-go leva à tela indicada (menu, logótipo, botões)
document.addEventListener("click", (e) => {
  const alvo = e.target.closest("[data-go]");
  if (!alvo) return;
  e.preventDefault();
  mostrar(alvo.dataset.go);
});

// Botões "voltar" e "avançar" do browser
window.addEventListener("popstate", () => {
  mostrar(location.hash.slice(1), { mudarHash: false });
});

// Tela inicial (respeita o endereço, ex.: index.html#suporte)
mostrar(location.hash.slice(1) || "inicio", { mudarHash: false, focar: false });

// ---------- Suporte: copiar email ----------
const botaoEmail = document.getElementById("copiar-email");
const estadoCopia = document.getElementById("estado-copia");
let temporizador;

botaoEmail.textContent = EMAIL_SUPORTE;

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Alternativa para quando o browser bloqueia a área de transferência (ex.: ficheiro aberto sem servidor)
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.style.position = "fixed";
    campo.style.opacity = "0";
    document.body.appendChild(campo);
    campo.select();
    const ok = document.execCommand("copy");
    campo.remove();
    return ok;
  }
}

botaoEmail.addEventListener("click", async () => {
  const ok = await copiarTexto(EMAIL_SUPORTE);
  estadoCopia.classList.toggle("erro", !ok);
  estadoCopia.textContent = ok
    ? "Email copiado!"
    : "Não foi possível copiar. Seleciona e copia o email manualmente.";
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (estadoCopia.textContent = ""), 3000);
});

// ---------- Tema claro / escuro ----------
const botaoTema = document.getElementById("tema");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  const escuro = tema === "escuro";
  botaoTema.setAttribute("aria-checked", String(escuro));
  botaoTema.title = escuro ? "Mudar para modo claro" : "Mudar para modo escuro";
}

aplicarTema(document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro");

botaoTema.addEventListener("click", () => {
  const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(novo);
  try { localStorage.setItem("tema", novo); } catch (e) {}
});
