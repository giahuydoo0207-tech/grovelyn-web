import { BACKGROUNDS, HAIR_COLORS, OUTFIT_COLORS, SKINS, detailOf, shade, type Character, type Emotion, type Status } from "./character";

/**
 * Vẽ nhân vật thành chuỗi SVG (chỉ từ các lựa chọn có sẵn, không có chữ người dùng nhập).
 * Hoạt hình: nét mực đậm, có đổ bóng, nền vườn lá. Điểm ảnh: lưới 16 x 16 ô.
 * `id` phải khác nhau giữa các nhân vật trên cùng trang (dùng cho clipPath).
 */

const INK = "#06110a";
const LEAF = "#5bd13a";
const DEEP = "#1d6b1d";
const WHITE_TEE = "#f4f6f1";
const MOUTH_IN = "#7a2323";
const TONGUE = "#f28b8b";
const GOLD = "#f2c13a";

interface Colors {
  bg: string;
  skin: string;
  hair: string;
  outfit: string;
  detail: string;
}

function colorsOf(c: Character): Colors {
  const outfit = OUTFIT_COLORS[c.outfitColor] ?? OUTFIT_COLORS[0];
  return {
    bg: BACKGROUNDS[c.bg] ?? BACKGROUNDS[0],
    skin: SKINS[c.skin] ?? SKINS[0],
    hair: HAIR_COLORS[c.hairColor] ?? HAIR_COLORS[0],
    outfit,
    detail: detailOf(outfit),
  };
}

/* ================= Hoạt hình ================= */

const SW = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"`;
const BODY = "M9 100 C11 81 27 72 50 72 C73 72 89 81 91 100 Z";
const EYE_Y = 47;
const HEAD = "translate(50 45) scale(1.04) translate(-50 -45)";

function hairFront(hair: Character["hair"], col: string) {
  const p = (d: string) => `<path d="${d}" fill="${col}" ${SW}/>`;
  switch (hair) {
    case "Ngắn":
      return p("M31 44 C29 24 42 19 52 20 C64 21 72 29 69.5 44 C67 35 60 30.5 50 31 C41 31.5 35 35 31 44 Z");
    case "Đầu đinh":
      return p("M32 39 C32 25 68 25 68 39 C62 33 38 33 32 39 Z");
    case "Mái dài":
      return p("M31 47 C28 22 71 18 70 45 C65 36 57 31 47 38 C41 34 35 38 31 47 Z");
    case "Tóc dài":
      return p("M31 46 C30 23 70 22 69 46 C63 35 39 33 31 46 Z");
    case "Búi":
      return p("M32 41 C31 25 69 25 68 41 C61 33 39 33 32 41 Z");
    case "Xoăn":
      return [
        [33, 36],
        [38, 28],
        [45, 24],
        [53, 23],
        [61, 26],
        [67, 32],
        [69, 40],
        [31, 44],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${col}" ${SW}/>`)
        .join("");
  }
}

function hairBack(hair: Character["hair"], col: string) {
  if (hair === "Tóc dài") return `<path d="M27 46 C26 20 74 20 73 46 L75 82 C66 87 34 87 25 82 Z" fill="${col}" ${SW}/>`;
  if (hair === "Búi") return `<circle cx="50" cy="19" r="9" fill="${col}" ${SW}/>`;
  return "";
}

function outfitDetails(o: Character["outfit"], k: Colors) {
  switch (o) {
    case "Áo thun":
      return `<path d="M41 72.5 Q50 81 59 72.5" fill="${k.skin}" stroke="${k.detail}" stroke-width="2"/>`;
    case "Sơ mi":
      return `<path d="M43 72 Q50 78 57 72 L57 76 Q50 82 43 76 Z" fill="${k.skin}"/><path d="M41 71 L50 80 L44 86 L37 74 Z M59 71 L50 80 L56 86 L63 74 Z" fill="#fff" stroke="${k.detail}" stroke-width="1" stroke-linejoin="round"/><circle cx="50" cy="89" r="1.4" fill="${k.detail}"/><circle cx="50" cy="96" r="1.4" fill="${k.detail}"/>`;
    case "Hoodie":
      return `<path d="M40 73 Q50 80 60 73" fill="${k.skin}"/><path d="M45.5 79 L45 92 M54.5 79 L55 92" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M34 92 Q50 96 66 92 L66 100 L34 100 Z" fill="${k.detail}" opacity=".45"/>`;
    case "Blazer":
      return `<path d="M42 72 L50 92 L58 72 Z" fill="#fff"/><path d="M44 72 Q50 77 56 72" fill="${k.skin}"/><path d="M41 71.5 L50 92 L45 100 L35 76 Z M59 71.5 L50 92 L55 100 L65 76 Z" fill="${k.detail}"/><circle cx="57" cy="94" r="1.3" fill="${k.outfit}"/>`;
    case "Áo len":
      return `<path d="M41 72.5 Q50 81 59 72.5" fill="${k.skin}" stroke="${k.detail}" stroke-width="4"/><path d="M14 88 Q50 84 86 88" stroke="${k.detail}" stroke-width="3" fill="none" stroke-dasharray="2 3"/>`;
  }
}

const lid = (x: number, y: number) => `<path d="M${x - 3} ${y + 0.6} Q${x} ${y - 2.6} ${x + 3} ${y + 0.6}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const dot = (x: number, y: number, ry = 2.9) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="${ry}" fill="${INK}"/><circle cx="${x + 0.7}" cy="${y - 1}" r=".75" fill="#fff"/>`;
const brow = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) =>
  `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
const nose = (y: number) => `<path d="M50 ${y} q-1.8 3.2 .6 3.8" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

/** Cười nhe răng: miệng mở, hàng răng trên trắng, đường chia răng mảnh. */
function grin(y: number, w = 7, open = 7.5) {
  const l = 50 - w;
  const r = 50 + w;
  return `<path d="M${l} ${y} Q50 ${y + 1.6} ${r} ${y} Q${r - 1} ${y + open} 50 ${y + open} Q${l + 1} ${y + open} ${l} ${y} Z" fill="${MOUTH_IN}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${l + 1.2} ${y + 0.6} Q50 ${y + 2.1} ${r - 1.2} ${y + 0.6} L${r - 1.7} ${y + 3.6} Q50 ${y + 4.8} ${l + 1.7} ${y + 3.6} Z" fill="#fff"/><path d="M50 ${y + 1.4} L50 ${y + 4.5} M${50 - w / 2} ${y + 1.1} L${50 - w / 2 + 0.2} ${y + 4.1} M${50 + w / 2} ${y + 1.1} L${50 + w / 2 - 0.2} ${y + 4.1}" stroke="#d9d9d9" stroke-width=".7"/><path d="M${50 - w / 2} ${y + open - 1.4} Q50 ${y + open - 3.6} ${50 + w / 2} ${y + open - 1.4} Q50 ${y + open + 0.2} ${50 - w / 2} ${y + open - 1.4} Z" fill="${TONGUE}"/>`;
}

const y = EYE_Y;
const FACES: Record<Emotion, string> = {
  "Cười nhe răng": dot(43, y) + dot(57, y) + brow(38.5, y - 6, 43, y - 8.6, 46.5, y - 6.6) + brow(53.5, y - 6.6, 57, y - 8.6, 61.5, y - 6) + nose(y + 2.2) + grin(y + 8.4),
  "Mỉm cười":
    lid(43, y) +
    lid(57, y) +
    brow(38.5, y - 6, 43, y - 8, 46.5, y - 6.4) +
    brow(53.5, y - 6.4, 57, y - 8, 61.5, y - 6) +
    nose(y + 2.2) +
    `<path d="M44.5 ${y + 9} Q50 ${y + 13.5} 55.5 ${y + 9}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  "Nháy mắt":
    dot(43, y) +
    `<path d="M54 ${y + 0.4} Q57 ${y - 1.6} 60 ${y + 0.4}" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    brow(38.5, y - 6.6, 43, y - 9, 46.5, y - 7) +
    brow(53.5, y - 5, 57, y - 6, 61.5, y - 4.6) +
    nose(y + 2.2) +
    grin(y + 8.6, 6, 6.5),
  "Ngạc nhiên":
    `<circle cx="43" cy="${y}" r="3.2" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="43" cy="${y}" r="1.6" fill="${INK}"/><circle cx="57" cy="${y}" r="3.2" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="57" cy="${y}" r="1.6" fill="${INK}"/>` +
    brow(38.5, y - 8, 43, y - 11, 46.5, y - 8.6) +
    brow(53.5, y - 8.6, 57, y - 11, 61.5, y - 8) +
    nose(y + 2.6) +
    `<ellipse cx="50" cy="${y + 11.5}" rx="3" ry="3.8" fill="${MOUTH_IN}" stroke="${INK}" stroke-width="1.6"/>`,
  "Tự tin":
    dot(43, y + 0.6, 2.2) +
    dot(57, y + 0.6, 2.2) +
    `<path d="M40 ${y - 1.4} L46 ${y - 1.4} M54 ${y - 1.4} L60 ${y - 1.4}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
    brow(38.5, y - 5.4, 43, y - 6.4, 46.5, y - 5.6) +
    brow(53.5, y - 7.4, 57, y - 10, 61.5, y - 8) +
    nose(y + 2.2) +
    `<path d="M44.5 ${y + 10.6} Q51 ${y + 12.6} 56 ${y + 8.6}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  "Suy nghĩ":
    `<ellipse cx="44.2" cy="${y - 0.8}" rx="2" ry="2.8" fill="${INK}"/><ellipse cx="58.2" cy="${y - 0.8}" rx="2" ry="2.8" fill="${INK}"/><circle cx="44.9" cy="${y - 1.9}" r=".75" fill="#fff"/><circle cx="58.9" cy="${y - 1.9}" r=".75" fill="#fff"/>` +
    brow(38.5, y - 6.2, 43, y - 7.4, 46.5, y - 6.4) +
    brow(53.5, y - 7.6, 57.5, y - 10.4, 61.5, y - 8.6) +
    nose(y + 2.2) +
    `<path d="M46 ${y + 11} Q49 ${y + 10} 54.5 ${y + 11.6}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="68" cy="${y - 15}" r="1.6" fill="#fff" stroke="${INK}" stroke-width="1"/><circle cx="72.5" cy="${y - 20}" r="2.4" fill="#fff" stroke="${INK}" stroke-width="1"/>`,
};

function hatColors(k: Colors) {
  const light = k.outfit === WHITE_TEE;
  return { main: light ? LEAF : k.outfit, dark: light ? DEEP : k.detail };
}

const EXTRA_SVG: Record<Character["extras"][number], (k: Colors) => string> = {
  Kính: () =>
    `<g stroke="${INK}" stroke-width="2.4" fill="#fff" fill-opacity=".22"><rect x="35" y="${y - 5}" width="12.5" height="10" rx="4"/><rect x="52.5" y="${y - 5}" width="12.5" height="10" rx="4"/><path d="M47.5 ${y - 1} L52.5 ${y - 1}" fill="none"/></g>`,
  "Kính râm": () =>
    `<g stroke="${INK}" stroke-width="2.4"><path d="M34.5 ${y - 5} H47.5 V${y + 1} Q47.5 ${y + 5} 41 ${y + 5} Q34.5 ${y + 5} 34.5 ${y + 1} Z" fill="${INK}"/><path d="M52.5 ${y - 5} H65.5 V${y + 1} Q65.5 ${y + 5} 59 ${y + 5} Q52.5 ${y + 5} 52.5 ${y + 1} Z" fill="${INK}"/><path d="M47.5 ${y - 3} L52.5 ${y - 3}" fill="none"/></g><path d="M37 ${y - 2.5} l3 0 M55 ${y - 2.5} l3 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`,
  "Mũ lưỡi trai": (k) => {
    const h = hatColors(k);
    return `<path d="M30.5 39 C30 17 70 17 69.5 39 Z" fill="${h.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 37 L82 38.5 Q83 43 72 43 L50 41 Z" fill="${h.dark}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="50" cy="19.5" r="1.8" fill="${h.dark}"/><path d="M36 30 Q44 22 54 22" stroke="${shade(h.main, 0.35)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  },
  "Mũ len": (k) => {
    const h = hatColors(k);
    return `<circle cx="50" cy="15" r="4.6" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M30.5 38 C30 16 70 16 69.5 38 Z" fill="${h.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><rect x="29" y="31" width="42" height="9" rx="3.5" fill="${h.dark}" stroke="${INK}" stroke-width="2.2"/><path d="M35 33 v5 M41 33 v5 M47 33 v5 M53 33 v5 M59 33 v5 M65 33 v5" stroke="${shade(h.dark, 0.3)}" stroke-width="1.2"/><path d="M38 26 Q44 20 52 20" stroke="${shade(h.main, 0.35)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  },
  "Tai nghe": () =>
    `<path d="M29.5 46 C28 13 72 13 70.5 46" stroke="${INK}" stroke-width="4.5" fill="none"/><rect x="24" y="39" width="10" height="16" rx="4.5" fill="${INK}"/><rect x="66" y="39" width="10" height="16" rx="4.5" fill="${INK}"/><rect x="26.2" y="42" width="3.2" height="10" rx="1.6" fill="${LEAF}"/>`,
  "Khuyên tai": () =>
    `<circle cx="31" cy="54" r="2" fill="${GOLD}" stroke="${INK}" stroke-width="1"/><circle cx="69" cy="54" r="2" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>`,
};
// Mũ vẽ trước, rồi kính, tai nghe, khuyên tai, để tai nghe nằm đè lên mũ.
const EXTRA_ORDER: Character["extras"][number][] = ["Mũ lưỡi trai", "Mũ len", "Kính", "Kính râm", "Tai nghe", "Khuyên tai"];

const hand = (x: number, yy: number, k: Colors) => `<ellipse cx="${x}" cy="${yy}" rx="5.2" ry="4.2" fill="${k.skin}" stroke="${INK}" stroke-width="2"/>`;
const leafMark = (x: number, yy: number) => `<path d="M0 0c2 -2.4 5.6 -2.4 7.6 0c-2 2.4 -5.6 2.4 -7.6 0z" fill="${LEAF}" transform="translate(${x} ${yy}) rotate(-35)"/>`;

/** Đồ vật trong tay theo trạng thái, chỉ vẽ ở ảnh lớn. */
function statusProp(s: Status, k: Colors, id: string) {
  switch (s) {
    case "Đang làm việc":
      return `<g transform="translate(50 100) scale(1.25) translate(-50 -96)"><rect x="25" y="79" width="50" height="28" rx="4" fill="#c9d0c4" stroke="${INK}" stroke-width="2.2"/><rect x="25" y="79" width="50" height="4" rx="2" fill="#e2e7de"/>${leafMark(46, 92)}${hand(26, 86, k)}${hand(74, 86, k)}</g>`;
    case "Đang học":
      return `<g transform="translate(50 100) scale(1.2) translate(-50 -98)"><path d="M24 84 Q37 79 50 85 L50 103 Q37 97 24 102 Z M76 84 Q63 79 50 85 L50 103 Q63 97 76 102 Z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M29 88 Q37 85 45 88.5 M29 92 Q37 89 45 92.5 M55 88.5 Q63 85 71 88 M55 92.5 Q63 89 71 92" stroke="#a8b5a6" stroke-width="1.2" fill="none"/><path d="M22 102 Q36 96.5 50 102.5 Q64 96.5 78 102" stroke="${DEEP}" stroke-width="3" fill="none"/>${hand(24, 93, k)}${hand(76, 93, k)}</g>`;
    case "Nghỉ giải lao":
      return `<g transform="translate(70 84) scale(1.35) translate(-70 -84)"><path d="M67 66 q-2 -3 0 -6 q2 -3 0 -6 M73 66 q-2 -3 0 -6 q2 -3 0 -6" stroke="#a8b5a6" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="62" y="70" width="18" height="20" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.2"/><path d="M80 75 q6 0 6 5.5 q0 5.5 -6 5.5" stroke="${INK}" stroke-width="2.2" fill="none"/>${leafMark(67.5, 81)}${hand(63, 86, k)}</g>`;
    case "Tìm cộng sự":
      return `<g transform="translate(76 86) scale(1.35) translate(-76 -86)"><path d="M76 86 L86 98" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><circle cx="70" cy="78" r="9" fill="#ddeffb" fill-opacity=".75" stroke="${INK}" stroke-width="2.6"/><path d="M65.5 75 q2 -3.5 5.5 -3.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>${hand(82, 94, k)}</g>`;
    case "Sẵn sàng nhận việc":
      return `<defs><path id="${id}arc" d="M9 52 A41 41 0 0 0 91 52"/></defs><path d="M4.5 50 A45.5 45.5 0 0 0 95.5 50" stroke="${DEEP}" stroke-width="15" fill="none"/><text font-family="Be Vietnam Pro, sans-serif" font-size="8.4" font-weight="800" fill="#fff" letter-spacing=".4"><textPath href="#${id}arc" startOffset="50%" text-anchor="middle">#SẴN SÀNG NHẬN VIỆC</textPath></text>`;
  }
  return "";
}

const LEAVES: [string, number, number, number][] = [
  ["#5bd13a", 12, 20, 30],
  ["#f2c13a", 80, 16, -40],
  ["#e8875f", 86, 52, 20],
  ["#a491ee", 10, 58, -20],
  ["#6bb3e8", 24, 8, 60],
  ["#1d6b1d", 70, 8, 10],
];

function cartoon(c: Character, id: string, status: Status | null) {
  const k = colorsOf(c);
  const shadeSkin = shade(k.skin, -0.13);
  const dark = k.bg === INK;
  let s = `<rect x="-10" y="-10" width="120" height="120" fill="${k.bg}"/>`;
  s += LEAVES.map(([col, x, yy, a]) => `<path d="M0 0c4 -4 11 -4 15 0c-4 4 -11 4 -15 0z" fill="${col}" opacity=".85" transform="translate(${x} ${yy}) rotate(${a})"/>`).join("");
  s += `<ellipse cx="50" cy="104" rx="56" ry="20" fill="${shade(k.bg, dark ? 0.12 : -0.08)}"/>`;

  s += `<g transform="${HEAD}">${hairBack(c.hair, k.hair)}</g>`;
  s += `<g transform="translate(0 2)">`;
  s += `<rect x="43.5" y="58" width="13" height="18" rx="5" fill="${shadeSkin}" ${SW}/>`;
  if (c.outfit === "Hoodie") s += `<path d="M31 76 C32 64 68 64 69 76 C62 82 38 82 31 76 Z" fill="${k.detail}" ${SW}/>`;
  s += `<clipPath id="${id}b"><path d="${BODY}"/></clipPath><path d="${BODY}" fill="${k.outfit}" ${SW}/>`;
  s += `<g clip-path="url(#${id}b)"><ellipse cx="82" cy="96" rx="18" ry="26" fill="${shade(k.outfit, k.outfit === INK ? 0.12 : -0.16)}"/><path d="M24 84 Q30 78 38 76" stroke="${shade(k.outfit, 0.3)}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
  s += outfitDetails(c.outfit, k);
  s += `<ellipse cx="50" cy="63" rx="8" ry="3.4" fill="${shade(k.skin, -0.25)}" opacity=".55"/>`;
  s += `</g>`;

  s += `<g transform="${HEAD}">`;
  s += `<circle cx="31.5" cy="47" r="5" fill="${k.skin}" ${SW}/><circle cx="68.5" cy="47" r="5" fill="${k.skin}" ${SW}/>`;
  s += `<clipPath id="${id}h"><ellipse cx="50" cy="45" rx="18.5" ry="20"/></clipPath><ellipse cx="50" cy="45" rx="18.5" ry="20" fill="${k.skin}" ${SW}/>`;
  s += `<g clip-path="url(#${id}h)"><ellipse cx="66" cy="48" rx="9" ry="24" fill="${shadeSkin}" opacity=".7"/></g>`;
  s += hairFront(c.hair, k.hair);
  if (c.hair !== "Đầu đinh") s += `<path d="M38 29 Q45 24 53 24.5" stroke="${shade(k.hair, 0.4)}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>`;
  if (c.hair !== "Xoăn" && c.hair !== "Đầu đinh") s += `<path d="M44 26 Q48 30 47 34 M56 26 Q59 29 60 33" stroke="${shade(k.hair, 0.35)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  s += FACES[c.emotion] ?? FACES["Cười nhe răng"];
  s += `<ellipse cx="38.5" cy="${y + 6}" rx="3" ry="2" fill="${TONGUE}" opacity=".45"/><ellipse cx="61.5" cy="${y + 6}" rx="3" ry="2" fill="${TONGUE}" opacity=".45"/>`;
  s += EXTRA_ORDER.filter((e) => c.extras.includes(e))
    .map((e) => EXTRA_SVG[e](k))
    .join("");
  s += `</g>`;
  if (status) s += statusProp(status, k, id);
  return s;
}

/* ================= Điểm ảnh ================= */

const HAIR_MASK: Record<Character["hair"], string[]> = {
  Ngắn: ["................", "................", ".....hhhhhh.....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...h........h...", "...h........h..."],
  "Đầu đinh": ["................", "................", "................", "....hhhhhhhh....", "....h......h...."],
  "Mái dài": ["................", "................", ".....hhhhhh.....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhh...hh...", "...h........h..."],
  "Tóc dài": [
    "................",
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "...hhhhhhhhhh...",
    "...h........h...",
    "...h........h...",
    "...h........h...",
    "...h........h...",
    "...h........h...",
    "...h........h...",
    "..hh........hh..",
    "..hh........hh..",
  ],
  Búi: ["......hhhh......", "......hhhh......", ".....hhhhhh.....", "....hhhhhhhh....", "....h......h...."],
  Xoăn: ["................", "....h.hh.hh.h...", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhh......hhh..", "..hh........hh..", "...h........h..."],
};

function pixel(c: Character) {
  const k = colorsOf(c);
  const grid: string[][] = Array.from({ length: 16 }, () => Array<string>(16).fill(k.bg));
  const put = (r: number, col: number, color: string) => {
    if (r >= 0 && r < 16 && col >= 0 && col < 16) grid[r][col] = color;
  };
  const row = (r: number, from: number, to: number, color: string) => {
    for (let x = from; x <= to; x++) put(r, x, color);
  };

  row(12, 3, 12, k.outfit);
  for (let r = 13; r < 16; r++) row(r, 2, 13, k.outfit);
  row(11, 6, 9, shade(k.skin, -0.12));
  for (let r = 3; r <= 10; r++) row(r, 4, 11, k.skin);
  put(3, 4, k.bg);
  put(3, 11, k.bg);
  put(10, 4, k.bg);
  put(10, 11, k.bg);
  put(7, 3, k.skin);
  put(7, 12, k.skin);
  for (let r = 4; r <= 9; r++) put(r, 11, shade(k.skin, -0.1));

  // Mặt theo cảm xúc
  const e = c.emotion;
  if (e === "Mỉm cười") {
    put(7, 6, INK);
    put(7, 9, INK);
    put(6, 5, INK);
    put(6, 10, INK);
  } else if (e === "Nháy mắt") {
    put(7, 6, INK);
    row(7, 9, 10, INK);
  } else if (e === "Ngạc nhiên") {
    row(6, 6, 6, INK);
    put(7, 6, INK);
    put(6, 9, INK);
    put(7, 9, INK);
  } else if (e === "Suy nghĩ") {
    put(6, 6, INK);
    put(6, 9, INK);
  } else {
    put(7, 6, INK);
    put(7, 9, INK);
  }
  if (e === "Tự tin") {
    row(6, 5, 6, INK);
    row(6, 9, 10, INK);
  }
  put(8, 5, TONGUE);
  put(8, 10, TONGUE);
  if (e === "Cười nhe răng" || e === "Nháy mắt") {
    row(9, 6, 9, "#ffffff");
    row(10, 7, 8, MOUTH_IN);
    put(9, 5, INK);
    put(9, 10, INK);
  } else if (e === "Ngạc nhiên") {
    put(9, 7, MOUTH_IN);
    put(9, 8, MOUTH_IN);
    put(10, 7, MOUTH_IN);
    put(10, 8, MOUTH_IN);
  } else if (e === "Tự tin" || e === "Suy nghĩ") {
    row(9, 7, 9, MOUTH_IN);
  } else {
    put(9, 6, MOUTH_IN);
    row(10, 7, 8, MOUTH_IN);
    put(9, 9, MOUTH_IN);
  }

  // Trang phục
  if (c.outfit === "Áo thun") row(12, 7, 8, k.skin);
  if (c.outfit === "Sơ mi") {
    row(12, 5, 6, "#ffffff");
    row(12, 9, 10, "#ffffff");
    row(12, 7, 8, k.skin);
    put(14, 8, k.detail);
  }
  if (c.outfit === "Hoodie") {
    row(12, 3, 12, k.detail);
    row(12, 7, 8, k.skin);
    put(13, 6, "#ffffff");
    put(14, 6, "#ffffff");
    put(13, 9, "#ffffff");
    put(14, 9, "#ffffff");
  }
  if (c.outfit === "Blazer") {
    row(12, 6, 9, "#ffffff");
    row(13, 7, 8, "#ffffff");
    for (let r = 12; r < 15; r++) {
      put(r, 5, k.detail);
      put(r, 10, k.detail);
    }
    put(13, 6, k.detail);
    put(13, 9, k.detail);
  }
  if (c.outfit === "Áo len") {
    row(12, 5, 10, k.detail);
    row(12, 7, 8, k.skin);
    row(14, 2, 13, shade(k.outfit, 0.25));
  }

  HAIR_MASK[c.hair].forEach((line, r) => [...line].forEach((ch, x) => ch === "h" && put(r, x, k.hair)));

  // Phụ kiện
  const hat = hatColors(k);
  if (c.extras.includes("Mũ lưỡi trai")) {
    row(1, 5, 10, hat.main);
    row(2, 4, 11, hat.main);
    row(3, 4, 11, hat.main);
    row(4, 4, 14, hat.dark);
  }
  if (c.extras.includes("Mũ len")) {
    row(0, 7, 8, "#ffffff");
    row(1, 5, 10, hat.main);
    row(2, 4, 11, hat.main);
    row(3, 3, 12, hat.dark);
    row(4, 3, 12, hat.dark);
  }
  if (c.extras.includes("Kính")) {
    row(7, 4, 11, INK);
    put(7, 6, "#cfeaff");
    put(7, 9, "#cfeaff");
    put(6, 6, INK);
    put(6, 9, INK);
  }
  if (c.extras.includes("Kính râm")) {
    row(6, 4, 11, INK);
    row(7, 5, 6, INK);
    row(7, 9, 10, INK);
    put(6, 5, "#5b6b62");
    put(6, 9, "#5b6b62");
  }
  if (c.extras.includes("Tai nghe")) {
    row(1, 5, 10, INK);
    put(2, 4, INK);
    put(2, 11, INK);
    for (let r = 3; r <= 5; r++) {
      put(r, 3, INK);
      put(r, 12, INK);
    }
    for (let r = 6; r <= 8; r++) {
      row(r, 2, 3, INK);
      row(r, 12, 13, INK);
    }
    put(7, 2, LEAF);
  }
  if (c.extras.includes("Khuyên tai")) {
    put(8, 3, GOLD);
    put(8, 12, GOLD);
  }

  let s = "";
  grid.forEach((line, yy) => {
    let x = 0;
    while (x < 16) {
      let w = 1;
      while (x + w < 16 && line[x + w] === line[x]) w++;
      s += `<rect x="${x}" y="${yy}" width="${w}" height="1" fill="${line[x]}"/>`;
      x += w;
    }
  });
  return s;
}

/** Trả về viewBox và nội dung SVG. `close`: cắt sát mặt cho cỡ nhỏ. `status`: vẽ đồ vật trong tay (ảnh lớn). */
export function characterSvg(c: Character, opts: { id: string; close?: boolean; status?: Status | null }) {
  if (c.style === "pixel") return { viewBox: opts.close ? "2 1 12 12" : "0 0 16 16", body: pixel(c), pixel: true };
  // Cắt sát mặt thì không vẽ đồ vật trong tay.
  return { viewBox: opts.close ? "16 8 68 68" : "0 0 100 100", body: cartoon(c, opts.id, opts.close ? null : (opts.status ?? null)), pixel: false };
}
