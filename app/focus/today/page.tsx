import Link from "next/link";

export default function Page() {
  return (
    <div className="main-grid">
      <section className="card">
        <span className="badge">Sectie</span>
        <h2>Focus van de dag</h2>
        <p>Placeholder voor de publieke focus-sessie van de dag.</p>
        <div className="link-row">
          <Link href="/">Terug naar start</Link>
        </div>
      </section>
    </div>
  );
}
