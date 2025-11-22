import Link from "next/link";

export default function Page() {
  return (
    <div className="main-grid">
      <section className="card">
        <span className="badge">Sectie</span>
        <h2>Analytics</h2>
        <p>Basisoverzicht voor afgeronde tours, games en focus-sessies.</p>
        <div className="link-row">
          <Link href="/">Terug naar start</Link>
        </div>
      </section>
    </div>
  );
}
