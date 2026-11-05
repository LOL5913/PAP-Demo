// ============================================================
//  Medidas da área de trabalho
//  Troca "a definir" por números (em mm). Exemplo: x: 250
// ============================================================
const AREA_DE_TRABALHO = { x: "a definir", y: "a definir" };

(function medidas() {
  const formatar = (v) => (typeof v === "number" ? `${v} mm` : v);

  document.querySelectorAll("[data-medida]").forEach((el) => {
    const eixo = el.dataset.medida;
    el.textContent = `${eixo.toUpperCase()}: ${formatar(AREA_DE_TRABALHO[eixo])}`;
  });

  const valor = document.getElementById("valor-area");
  if (valor) {
    const { x, y } = AREA_DE_TRABALHO;
    valor.textContent =
      typeof x === "number" && typeof y === "number" ? `${y} × ${x} mm` : "Medidas a definir";
  }
})();

// ============================================================
//  Impressora em 3D (vista isométrica) que se monta e desmonta
//  Cada peça: nome, deslocamento ao desmontar [x, y, z] e formas.
//  Quando tiveres os nomes finais das peças, é só mudar o campo "nome".
// ============================================================
(function impressoraDesmontavel() {
  const alvo = document.getElementById("impressora-3d");
  if (!alvo) return;

  const NS = "http://www.w3.org/2000/svg";
  const K = 10;          // escala
  const C = 0.866;       // cos 30°
  const S = 0.5;         // sin 30°

  // Projeção: X vai para a direita-baixo, Y para a direita-cima, Z para cima
  const P = (x, y, z) => [(x + y) * C * K, ((x - y) * S - z) * K];

  const madeira = { top: "#E0A24E", front: "#B9731F", right: "#8E5612" };
  const aluminio = { top: "#E6E9EE", front: "#B7BEC8", right: "#8F97A3" };
  const correia = { top: "#3a3f48", front: "#23262c", right: "#17191d" };
  const prata = { top: "#D8DCE2", front: "#A9B0BA", right: "#868E99" };
  const preto = { top: "#4a505b", front: "#2c3037", right: "#1c1f24" };
  const vermelho = { top: "#F2574C", front: "#D32F2F", right: "#A32020" };

  const caixa = (p, s, c) => ({ t: "caixa", p, s, c });
  const cilindro = (c, r, h, cor) => ({ t: "cil", c, r, h, cor });

  const motor = (x, y) => [
    caixa([x, y, 10.2], [4.2, 4.2, 0.8], prata),
    caixa([x, y, 11.0], [4.2, 4.2, 2.8], preto),
    caixa([x, y, 13.8], [4.2, 4.2, 0.8], prata),
  ];

  const partes = [
    { nome: "Placa lateral em madeira", expl: [0, -7, 0], formas: [caixa([0, 0, 0], [16, 1, 8], madeira)] },
    { nome: "Placa lateral em madeira", expl: [0, 7, 0], formas: [caixa([0, 22, 0], [16, 1, 8], madeira)] },
    { nome: "Guia linear MGN15H (250 mm)", expl: [0, 0, 7], formas: [caixa([2, 1, 8], [1.6, 21, 1.2], aluminio)] },
    { nome: "Correia GT2 6 mm", expl: [-5, 0, 7], formas: [caixa([0.8, 1, 8], [0.5, 21, 0.6], correia)] },
    { nome: "Placa do carro (madeira)", expl: [0, 0, 11], formas: [caixa([0.5, 9.8, 9.2], [8.5, 9.8, 1], madeira)] },
    { nome: "Motor Nema 17 1.5A (17HS4401)", expl: [0, 2, 17], formas: motor(1, 15.2) },
    { nome: "Motor Nema 17 1.5A (17HS4401)", expl: [0, -2, 18], formas: motor(1, 10.4) },
    { nome: "Polia GT2 20T, furo de 5 mm", expl: [0, 2, 26], formas: [cilindro([3.1, 17.3, 14.6], 1.2, 1.1, prata)] },
    { nome: "Polia GT2 20T, furo de 5 mm", expl: [0, -2, 27], formas: [cilindro([3.1, 12.5, 14.6], 1.2, 1.1, prata)] },
    { nome: "Guia linear MGN15H (250 mm)", expl: [3, 0, 12], formas: [caixa([6, 13.9, 10.2], [26, 1.6, 1.2], aluminio)] },
    { nome: "Correia GT2 6 mm", expl: [4, -3, 18], formas: [caixa([6, 13.2, 10.2], [26, 0.5, 0.6], correia)] },
    { nome: "Suporte do laser", expl: [0, 0, 19], formas: [caixa([15, 13.6, 11.4], [3.6, 2.4, 2.0], madeira)] },
    {
      nome: "Laser Tree 10W (LT-40W-AA)",
      expl: [0, 0, 27],
      formas: [
        caixa([15.6, 13.9, 13.4], [2.4, 1.8, 6.5], preto),
        caixa([15.5, 13.8, 19.9], [2.6, 2.0, 1.6], prata),
      ],
    },
    { nome: "Suporte de extremidade", expl: [6, 0, 4], formas: [caixa([31, 13.4, 9.2], [2, 2.6, 2.2], madeira)] },
    { nome: "Polia GT2 (retorno da correia)", expl: [5, 0, 16], formas: [cilindro([32, 14.7, 11.4], 1.0, 0.9, prata)] },
    { nome: "Final de curso (micro switch SPDT)", expl: [0, -5, 12], formas: [caixa([26, 12.6, 10.2], [1.2, 0.8, 0.9], vermelho)] },
  ];

  // --- utilitários SVG ---
  const el = (tag, attrs = {}, pai) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(n);
    return n;
  };
  const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  const contorno = { stroke: "rgba(0,0,0,.35)", "stroke-width": ".6", "stroke-linejoin": "round" };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const acumular = (x, y, ox = 0, oy = 0) => {
    minX = Math.min(minX, x, x + ox); maxX = Math.max(maxX, x, x + ox);
    minY = Math.min(minY, y, y + oy); maxY = Math.max(maxY, y, y + oy);
  };

  function desenharCaixa(g, f, ox, oy) {
    const [x0, y0, z0] = f.p;
    const [w, d, h] = f.s;
    const x1 = x0 + w, y1 = y0 + d, z1 = z0 + h;
    const front = [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)];
    const right = [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)];
    const top = [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
    el("polygon", { points: pts(front), fill: f.c.front, ...contorno }, g);
    el("polygon", { points: pts(right), fill: f.c.right, ...contorno }, g);
    el("polygon", { points: pts(top), fill: f.c.top, ...contorno }, g);
    [...front, ...right, ...top].forEach(([x, y]) => acumular(x, y, ox, oy));
  }

  function desenharCilindro(g, f, ox, oy) {
    const [cx, cy] = P(...f.c);
    const A = f.r * 1.2247 * K;
    const B = f.r * 0.7071 * K;
    const alt = f.h * K;
    el("path", {
      d: `M${cx - A},${cy - alt} L${cx - A},${cy} A${A},${B} 0 0 0 ${cx + A},${cy} L${cx + A},${cy - alt} Z`,
      fill: f.cor.front, ...contorno,
    }, g);
    el("ellipse", { cx, cy: cy - alt, rx: A, ry: B, fill: f.cor.top, ...contorno }, g);
    acumular(cx - A, cy - alt - B, ox, oy);
    acumular(cx + A, cy + B, ox, oy);
  }

  // Ordem de desenho: das peças mais afastadas para as mais próximas da câmara
  const profundidade = (parte) => {
    const c = parte.formas.map((f) => {
      if (f.t === "cil") return f.c[0] - f.c[1] + f.c[2];
      return f.p[0] + f.s[0] / 2 - (f.p[1] + f.s[1] / 2) + f.p[2] + f.s[2] / 2;
    });
    return c.reduce((a, b) => a + b, 0) / c.length;
  };
  const ordenadas = partes
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => profundidade(a) - profundidade(b));

  const svg = el("svg", { role: "img", "aria-label": "Impressora CNC Laser em vista isométrica que se monta e desmonta" });
  ordenadas.forEach((parte, n) => {
    const [ox, oy] = P(...parte.expl);
    const g = el("g", { class: "peca", "data-nome": parte.nome }, svg);
    g.style.setProperty("--dx", `${ox.toFixed(1)}px`);
    g.style.setProperty("--dy", `${oy.toFixed(1)}px`);
    g.style.setProperty("--i", n);
    parte.formas.forEach((f) =>
      f.t === "cil" ? desenharCilindro(g, f, ox, oy) : desenharCaixa(g, f, ox, oy)
    );
  });

  const m = 18;
  svg.setAttribute("viewBox", `${(minX - m).toFixed(0)} ${(minY - m).toFixed(0)} ${(maxX - minX + 2 * m).toFixed(0)} ${(maxY - minY + 2 * m).toFixed(0)}`);
  alvo.appendChild(svg);

  // --- interação: passar o cursor mostra as peças ---
  const legenda = document.getElementById("legenda-peca");
  const padrao = legenda.textContent;

  alvo.addEventListener("mouseover", (e) => {
    const peca = e.target.closest(".peca");
    legenda.textContent = peca ? peca.dataset.nome : padrao;
  });
  alvo.addEventListener("mouseenter", () => alvo.classList.add("aberto"));
  alvo.addEventListener("mouseleave", () => {
    alvo.classList.remove("aberto");
    legenda.textContent = padrao;
  });
  alvo.addEventListener("focus", () => alvo.classList.add("aberto"));
  alvo.addEventListener("blur", () => {
    alvo.classList.remove("aberto");
    legenda.textContent = padrao;
  });
  // Telemóvel / ecrã tátil: tocar abre e fecha
  alvo.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") return;
    const peca = e.target.closest(".peca");
    if (peca) legenda.textContent = peca.dataset.nome;
    alvo.classList.toggle("aberto");
    if (!alvo.classList.contains("aberto")) legenda.textContent = padrao;
  });
})();
