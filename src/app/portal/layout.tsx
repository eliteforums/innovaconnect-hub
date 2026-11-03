import type { Metadata } from "next";

// The portal reads the session cookie on every request.
export const instant = false;

export const metadata: Metadata = {
  title: "Finalist portal",
  robots: { index: false, follow: false },
};

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-paper">{children}</div>;
}
