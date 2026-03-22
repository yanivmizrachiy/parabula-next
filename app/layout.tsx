import "./globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "מרכז הבקרה",
  description: "מרכז בקרה פרטי",
};

const nav = [
  ["דף הבית", "/"],
  ["מכשירים", "/devices"],
  ["GitHub", "/github"],
  ["n8n", "/n8n"],
  ["OpenAI / API", "/openai"],
  ["Google", "/google"],
  ["Microsoft", "/microsoft"],
  ["מקורות מידע", "/data-sources"],
  ["בדיקות מערכת", "/diagnostics"],
  ["אוטומציות", "/automations"],
  ["לוגים", "/logs"],
  ["הגדרות", "/settings"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh" }}>
          <aside style={{ borderInlineStart: "1px solid #24304d", padding: 20, background: "#0e1530" }}>
            <h1 style={{ marginTop: 0 }}>מרכז הבקרה</h1>
            <p style={{ opacity: 0.8 }}>מערכת פרטית לניהול מצב, חיבורים, אבחון ותזמור.</p>
            <nav style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {nav.map(([label, href]) => (
                <Link key={href} href={href} style={{ padding: 10, borderRadius: 10, background: "#121933" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main style={{ padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
