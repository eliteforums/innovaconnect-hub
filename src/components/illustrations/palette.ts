/** Fixed illustration palette — mirrors the design tokens in globals.css. */
export const C = {
  ink: "#171717",
  charcoal: "#343434",
  paper: "#FFFDF7",
  cream: "#F5F0E5",
  deep: "#EBE3D3",
  rule: "#D9D0C0",
  stone: "#C9BFAE",
  taxi: "#F4C430",
  best: "#D62828",
  burgundy: "#941B45",
  violet: "#6D28D9",
  violetSoft: "#EDE5FF",
  rose: "#F4DCE4",
  glass: "#CBD6D3",
  chrome: "#B9B4AA",
  sea: "#9FB7BC",
} as const;

export type IllustrationProps = {
  className?: string;
  /** Accessible description. Omit (or pass "") for purely decorative use. */
  title?: string;
};

export function a11y(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true, focusable: false } as const);
}
