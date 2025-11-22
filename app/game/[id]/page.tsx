import Link from "next/link";

export default function Page() {
  return (
    <div className="main-grid">
      <section className="card">
        <span className="badge">Sectie</span>
        <h2>Game detail</h2>
        <p>Placeholder voor een specifieke game op basis van ID.</p>
        <div className="link-row">
          <Link href="/">Terug naar start</Link>
        </div>
      </section>
    </div>
  );
}
