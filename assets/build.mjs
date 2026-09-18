// build.mjs -- regenerates every SVG element of the profile README.
//
// Run: node assets/build.mjs
//
// Everything below is data. Edit a card, a fact or a link here and rerun --
// the drawing code is shared, so the whole README keeps one visual grammar:
// khaki paper, a pencil-wobbled ink frame, copper for what matters.
//
// Cards and chips are wrapped in <a> inside README.md, so each one is a real
// link. Nothing here reaches an external badge service: the images live in
// this repository and cannot break when someone else's free tier ends.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));

const INK = "#1e1e1e";
const PAPER = "#dcd8d0";
const COPPER = "#c57e50";
const COPPER_DARK = "#a86134";
const BODY = "#4e4a42";
const MUTED = "#7e7a72";

const HAND = "'Comic Sans MS', 'Comic Neue', cursive";
const UI = "'Inter', system-ui, sans-serif";

// -- data ---------------------------------------------------------------

const PROOF = {
  title: "Proven, not claimed",
  lead: "Three things this profile can back with a date instead of an adjective.",
  facts: [
    {
      tag: "FAILOVER",
      head: "5m30s",
      body: [
        "Production network cut on purpose, twice.",
        "DNS moved, the warm standby raised itself,",
        "the college kept reading its timetable.",
      ],
      note: "no human action - 2026-09-18",
    },
    {
      tag: "BACKUPS",
      head: "restored",
      body: [
        "Copies are not merely written. They are",
        "restored weekly into a scratch database and",
        "row-counted against the dump's own claim.",
      ],
      note: "a dump that lies fails this check",
    },
    {
      tag: "IN USE",
      head: "2 products",
      body: [
        "A real college runs its timetable and its",
        "classroom games on them every working day.",
        "Tenant isolation is tested on every deploy.",
      ],
      note: "shipped and still on call for it",
    },
  ],
};

const CARDS = [
  {
    file: "card-eduklass.svg",
    num: "[01]",
    title: "EduKlass Schedule",
    desc: "College timetable platform. Imports the college's own",
    desc2: "spreadsheets, and survives the server dying.",
    stack: "Next.js - NestJS - Prisma - PostgreSQL",
    status: "IN PRODUCTION",
    live: true,
  },
  {
    file: "card-kvestnik.svg",
    num: "[02]",
    title: "Kvestnik",
    desc: "Real-time classroom games. One teacher, thirty phones,",
    desc2: "state in sync without a single refresh.",
    stack: "Next.js - NestJS - Socket.IO - Redis",
    status: "IN PRODUCTION",
    live: true,
  },
  {
    file: "card-skiponeai.svg",
    num: "[03]",
    title: "SkipOneAI",
    desc: "Agentic Telegram twin: retrieval over my own messages,",
    desc2: "local transcription, my own writing style.",
    stack: "Python - RAG - Whisper - Telethon",
    status: "SOURCE OPEN",
    live: false,
  },
  {
    file: "card-kvcg.svg",
    num: "[04]",
    title: "KVCG",
    desc: "Site for a construction company working since 2002.",
    desc2: "The editor is built into the finished site itself.",
    stack: "Next.js - Three.js - GSAP - Framer Motion",
    status: "IN PRODUCTION",
    live: true,
  },
  {
    file: "card-chronos.svg",
    num: "[M1]",
    title: "ChronOS-Web",
    desc: "College attendance tracking, handed to me at my",
    desc2: "request. Being rebuilt from the inside.",
    stack: "Next.js - Prisma - PostgreSQL",
    status: "IN DEVELOPMENT",
    live: false,
    muted: true,
    linked: false,
  },
  {
    file: "card-chronos-mobile.svg",
    num: "[M2]",
    title: "chronos-mobile",
    desc: "The mobile client for the same system:",
    desc2: "being brought to a release.",
    stack: "React Native - TypeScript",
    status: "IN DEVELOPMENT",
    live: false,
    muted: true,
    linked: false,
  },
];

const CHIPS = [
  { file: "chip-telegram.svg", label: "Telegram", sub: "@l_SkipOne_l", solid: true },
  { file: "chip-mail.svg", label: "Email", sub: "contact@skipone.dev", solid: false },
  { file: "chip-site.svg", label: "skipone.dev", sub: "projects and write-ups", solid: false },
];

// -- shared drawing -----------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Пергамент с карандашной рамкой: любой элемент начинается с него, поэтому
// новая карточка не может случайно выпасть из общего стиля.
function sheet(w, h, { accent = false } = {}) {
  const stroke = accent ? COPPER : INK;
  return `  <rect width="${w}" height="${h}" rx="4" fill="${PAPER}"/>
  <rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="3" fill="none"
        stroke="${stroke}" stroke-width="2" filter="url(#pencil)"/>
  <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="2" fill="none"
        stroke="${INK}" stroke-width="0.6" stroke-dasharray="6 4" opacity="0.18"/>`;
}

// Линия от руки: прямая выдала бы машинную графику, а весь профиль нарисован
// как страница из тетради.
function rule(x1, y, x2, { color = INK, opacity = 0.22, width = 1 } = {}) {
  const mid = (x1 + x2) / 2;
  return `  <path d="M ${x1},${y} Q ${mid},${y - 2} ${x2},${y}" fill="none"
        stroke="${color}" stroke-width="${width}" opacity="${opacity}" filter="url(#pencil)"/>`;
}

const DEFS = `  <defs>
    <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2"
                         xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="warmGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

// Оживает только то, что и правда живое: индикатор боевой эксплуатации.
const STYLE = `    .pulse { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
    .fade-in { animation: fadeIn 0.9s ease-out both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .pulse, .fade-in { animation: none; opacity: 1; }
    }`;

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img">
${DEFS}
  <style>
${STYLE}
  </style>
${body}
</svg>
`;
}

// -- card ---------------------------------------------------------------

function card(c) {
  const W = 440;
  const H = 170;
  const numColor = c.muted ? MUTED : COPPER;
  const dot = c.live
    ? `    <circle cx="406" cy="36" r="4" fill="${c.muted ? MUTED : COPPER}"
            filter="url(#warmGlow)" class="pulse"/>`
    : "";
  const statusColor = c.muted ? MUTED : COPPER_DARK;
  return svg(
    W,
    H,
    `${sheet(W, H)}
  <g class="fade-in">
    <text x="24" y="44" font-family="${HAND}" font-size="17" font-weight="bold"
          fill="${numColor}">${esc(c.num)}</text>
    <text x="72" y="46" font-family="${HAND}" font-size="25" font-weight="bold"
          fill="${INK}">${esc(c.title)}</text>
${dot}
${rule(24, 62, 416, { color: numColor, opacity: c.muted ? 0.3 : 0.45, width: 1.6 })}
    <text x="24" y="84" font-family="${UI}" font-size="12.5" fill="${BODY}">${esc(c.desc)}</text>
    <text x="24" y="102" font-family="${UI}" font-size="12.5" fill="${BODY}">${esc(c.desc2)}</text>
    <text x="24" y="126" font-family="${UI}" font-size="10" fill="${MUTED}"
          letter-spacing="0.6">${esc(c.stack)}</text>
${rule(24, 136, 416, { opacity: 0.14 })}
    <text x="24" y="154" font-family="${UI}" font-size="8.5" font-weight="600"
          letter-spacing="1.6" fill="${statusColor}">${esc(c.status)}</text>
${c.linked === false ? "" : `    <text x="416" y="154" text-anchor="end" font-family="${UI}" font-size="8.5"
          letter-spacing="1.2" fill="${MUTED}">${esc("OPEN ->")}</text>`}
  </g>`
  );
}

// -- chip ---------------------------------------------------------------

function chip(c) {
  const W = 260;
  const H = 62;
  const ground = c.solid
    ? `  <rect width="${W}" height="${H}" rx="4" fill="${COPPER}"/>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="3" fill="none"
        stroke="${INK}" stroke-width="2" filter="url(#pencil)"/>`
    : sheet(W, H);
  const sub = c.solid ? "#4a2f1d" : MUTED;
  return svg(
    W,
    H,
    `${ground}
  <text x="${W / 2}" y="31" text-anchor="middle" font-family="${HAND}"
        font-size="18" font-weight="bold" fill="${INK}">${esc(c.label)}</text>
  <text x="${W / 2}" y="48" text-anchor="middle" font-family="${UI}"
        font-size="9.5" letter-spacing="1" fill="${sub}">${esc(c.sub)}</text>`
  );
}

// -- proof panel --------------------------------------------------------

function proof(p) {
  const W = 1000;
  const H = 330;
  const colW = 300;
  const gap = 28;
  const x0 = 44;
  const cols = p.facts
    .map((f, i) => {
      const x = x0 + i * (colW + gap);
      const lines = f.body
        .map(
          (l, j) => `    <text x="${x}" y="${208 + j * 19}" font-family="${UI}"
          font-size="12.5" fill="${BODY}">${esc(l)}</text>`
        )
        .join("\n");
      return `  <g class="fade-in" style="animation-delay: ${0.15 + i * 0.18}s">
    <rect x="${x - 16}" y="132" width="${colW}" height="152" rx="3"
          fill="${INK}" fill-opacity="0.035" stroke="${INK}" stroke-width="1.4"
          filter="url(#pencil)"/>
    <text x="${x}" y="156" font-family="${UI}" font-size="9" font-weight="600"
          letter-spacing="1.8" fill="${MUTED}">${esc(f.tag)}</text>
    <text x="${x}" y="186" font-family="${HAND}" font-size="26" font-weight="bold"
          fill="${COPPER}">${esc(f.head)}</text>
${lines}
${rule(x, 258, x + colW - 32, { opacity: 0.16 })}
    <text x="${x}" y="272" font-family="${UI}" font-size="9" font-style="italic"
          fill="${MUTED}">${esc(f.note)}</text>
  </g>`;
    })
    .join("\n");

  return svg(
    W,
    H,
    `${sheet(W, H, { accent: true })}
  <text x="${W / 2}" y="60" text-anchor="middle" font-family="${HAND}"
        font-size="32" font-weight="bold" fill="${INK}">${esc(p.title)}</text>
${rule(390, 74, 610, { color: COPPER, opacity: 0.55, width: 2 })}
  <text x="${W / 2}" y="100" text-anchor="middle" font-family="${UI}"
        font-size="12.5" fill="${BODY}">${esc(p.lead)}</text>
${cols}
  <text x="${W / 2}" y="312" text-anchor="middle" font-family="${UI}" font-size="9"
        letter-spacing="1.4" fill="${MUTED}">EVERY LINE HERE IS SOMETHING I CAN SHOW ON REQUEST</text>`
  );
}

// -- write --------------------------------------------------------------

const files = [
  ["proof.svg", proof(PROOF)],
  ...CARDS.map((c) => [c.file, card(c)]),
  ...CHIPS.map((c) => [c.file, chip(c)]),
];

for (const [name, content] of files) {
  writeFileSync(join(OUT, name), content, "utf8");
  console.log("wrote", name);
}
