import { ImageResponse } from "next/og";

export const alt = "InnovaHack Chapter 2 — Mumbai builds the future. Two domains. One national stage.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F5F0E5",
          color: "#171717",
          padding: "48px 64px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, borderBottom: "2px solid #171717", paddingBottom: 12 }}>
          <span>ELITE FORUMS PRESENTS · INDIA · CHAPTER 02 · 2027</span>
          <span style={{ color: "#941B45" }}>HYBRID NATIONAL HACKATHON</span>
        </div>
        <div style={{ display: "flex", fontSize: 168, fontWeight: 900, letterSpacing: -6, lineHeight: 1, marginTop: 28 }}>
          INNOVAHACK
        </div>
        <div style={{ display: "flex", borderTop: "4px solid #171717", marginTop: 18, paddingTop: 22, gap: 40, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 74, fontWeight: 900, color: "#941B45", lineHeight: 1 }}>MUMBAI BUILDS</span>
            <span style={{ fontSize: 74, fontWeight: 900, lineHeight: 1 }}>THE FUTURE.</span>
            <span style={{ fontSize: 30, marginTop: 18 }}>Two domains. One national stage.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "4px solid #171717", background: "#F4C430", padding: "16px 28px" }}>
            <span style={{ fontSize: 22, letterSpacing: 4 }}>CHAPTER 02</span>
            <span style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>2027</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
