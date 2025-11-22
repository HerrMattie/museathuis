import type { ReactNode } from "react";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", fontSize: "0.9rem" }}>
        <a href="/crm/dashboard">Dashboard</a>
        <a href="/crm/artworks">Kunstwerken</a>
        <a href="/crm/tours">Tours</a>
        <a href="/crm/focus">Focus</a>
        <a href="/crm/analytics">Analytics</a>
      </nav>
      {children}
    </div>
  );
}
