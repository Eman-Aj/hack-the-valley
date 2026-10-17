import type { Resident } from "../lib/types";

const palettes = [
  { background: "#eaf2ff", skin: "#d6a780", hair: "#4d3c36", clothing: "#7793b5" },
  { background: "#f5eee6", skin: "#e3b995", hair: "#77706a", clothing: "#8d9b88" },
  { background: "#f0eafa", skin: "#c78e68", hair: "#282b32", clothing: "#907eaa" },
  { background: "#e8f2ef", skin: "#edc8a6", hair: "#5b4636", clothing: "#678f83" },
  { background: "#f8edf0", skin: "#e0b08a", hair: "#6c5142", clothing: "#ad7d8a" },
  { background: "#edf0f6", skin: "#9b654a", hair: "#25272b", clothing: "#647d9e" },
];

export default function ResidentAvatar({ resident }: { resident: Resident }) {
  const paletteIndex = Number(resident.id.match(/\d+$/)?.[0] ?? 0) % palettes.length;
  const palette = palettes[paletteIndex];

  return (
    <svg
      className="avatar care-resident-avatar"
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${resident.preferredName}'s placeholder portrait`}
    >
      <circle cx="24" cy="24" r="24" fill={palette.background}/>
      <path d="M7 48c1-10 7-15 17-15s16 5 17 15" fill={palette.clothing}/>
      <path d="M19 30h10v9H19z" fill={palette.skin}/>
      <path d="M14 20c-1-9 3-14 10-14s11 5 10 14c-2-3-5-5-10-5s-8 2-10 5" fill={palette.hair}/>
      <ellipse cx="24" cy="21" rx="8" ry="10" fill={palette.skin}/>
      <path d="M16 19c2-2 5-4 8-4 4 0 7 2 8 4-1-7-4-10-8-10s-8 4-8 10" fill={palette.hair}/>
      <path d="M21 23h.5m5 0h.5" stroke="#58463e" strokeLinecap="round" strokeWidth="1.2"/>
      <path d="M22 27c1.2 1 2.8 1 4 0" fill="none" stroke="#9b655a" strokeLinecap="round" strokeWidth="1"/>
    </svg>
  );
}
