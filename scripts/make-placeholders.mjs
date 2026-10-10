// Creates soft illustrated placeholder photos in photos/ until the resort's
// real photos arrive. Real photos with the same file name simply replace them.
// Usage: `node scripts/make-placeholders.mjs && pnpm images`

import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "photos");
await mkdir(dir, { recursive: true });

// [key, label, sky, far hill, near hill]
const items = [
  ["pool-villa", "Pool Villa", "#EEF3EC", "#C9D8C7", "#8FA98F"],
  ["pool", "Pool", "#E6EFF1", "#BFD6DC", "#7FA3AD"],
  ["deluxe-room", "Deluxe Room", "#F6EFE6", "#E6D5BF", "#BFA68A"],
  ["garden-cottage", "Garden Cottage", "#EDF2E8", "#CADBC0", "#88A578"],
  ["villa-bath", "Villa bath", "#F4EEE8", "#E2D6CB", "#B7A595"],
  ["food", "Thali lunch", "#F8EDE0", "#EBCFAE", "#C9976A"],
  ["breakfast", "Chai & poha", "#F8F0E1", "#EED9B3", "#CDA66E"],
  ["sunrise", "Golden hour", "#FBEBD7", "#E9CDB0", "#A88E78"],
  ["valley", "Valley view", "#EEF2EE", "#C6D6CC", "#7E9C88"],
  ["bonfire", "Bonfire", "#E9E4EC", "#C9BBC9", "#8B7A8C"],
  ["spa", "Spa", "#EFF0EA", "#D4D9CB", "#9AA58E"],
  ["trek", "Ridge trek", "#EBF1EA", "#C3D5BF", "#7C9A75"],
  ["games", "Carrom", "#F5EEE4", "#E1D1BC", "#B19A7E"],
  ["waterfall", "Monsoon falls", "#E7EEF0", "#C2D4D8", "#7F9DA4"],
  ["events", "Lawn dinners", "#F3EBE3", "#DDCBBB", "#A8917E"],
  ["monsoon", "First rains", "#E5EBEA", "#BDCECB", "#7A958F"],
];

const svg = (label, sky, far, near) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 1800 1200">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${sky}"/>
  </linearGradient></defs>
  <rect width="1800" height="1200" fill="url(#s)"/>
  <circle cx="1320" cy="330" r="110" fill="#ffffff" opacity="0.7"/>
  <path d="M0 640 C 300 520, 520 600, 820 540 S 1400 470, 1800 560 V1200 H0Z" fill="${far}"/>
  <path d="M0 820 C 360 700, 640 820, 980 740 S 1500 680, 1800 760 V1200 H0Z" fill="${near}" opacity="0.75"/>
  <path d="M0 980 C 420 900, 760 1000, 1120 940 S 1600 900, 1800 950 V1200 H0Z" fill="${near}"/>
  <text x="900" y="1110" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#ffffff" opacity="0.92">${label.replace(/&/g, "&amp;")} · photo coming soon</text>
</svg>`;

for (const [key, label, sky, far, near] of items) {
  const file = path.join(dir, `${key}.jpg`);
  try {
    await access(file);
    continue; // never overwrite a real photo
  } catch {}
  await sharp(Buffer.from(svg(label, sky, far, near))).jpeg({ quality: 85 }).toFile(file);
  console.log("placeholder:", key);
}
