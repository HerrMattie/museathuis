import Link from "next/link";

export default function HomePage() {
  return (
    <div className="main-grid">
      <section className="card">
        <span className="badge">Vandaag</span>
        <h2>Tour van vandaag</h2>
        <p>
          De dagelijkse tour met 6 tot 8 kunstwerken, circa drie minuten audio per werk,
          gebaseerd op jouw fundament.
        </p>
        <div className="link-row">
          <Link href="/tour/today" className="link-chip">
            Start tour
          </Link>
        </div>
      </section>

      <section className="card">
        <span className="badge">Vandaag</span>
        <h2>Game van vandaag</h2>
        <p>
          De dagelijkse game, los van de tour. Quiz, raad het werk of detailspel als basis.
        </p>
        <div className="link-row">
          <Link href="/game/today" className="link-chip">
            Start game
          </Link>
        </div>
      </section>

      <section className="card">
        <span className="badge">Verdieping</span>
        <h2>Focus van de dag</h2>
        <p>
          Één kunstwerk centraal, circa tien minuten audio met extra context en verdieping.
        </p>
        <div className="link-row">
          <Link href="/focus/today" className="link-chip">
            Start focus sessie
          </Link>
        </div>
      </section>

      <section className="card">
        <span className="badge">Structuur</span>
        <h2>Over MuseaThuis</h2>
        <p>
          Uitleg over het platform, doelgroep en de rol van premium. Deze tekst kun je later
          eenvoudig vervangen.
        </p>
        <div className="link-row">
          <Link href="/premium" className="link-chip">
            Premium uitleg
          </Link>
          <Link href="/about" className="link-chip">
            Over
          </Link>
          <Link href="/museums" className="link-chip">
            Voor musea
          </Link>
        </div>
      </section>
    </div>
  );
}
