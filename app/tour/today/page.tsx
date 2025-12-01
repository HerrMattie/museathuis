type Work = {
  id: string;
  title: string;
  artist: string;
  museum: string;
};

type Tour = {
  id: string;
  title: string;
  intro: string;
  durationMinutes: number;
  works: Work[];
};

async function getTodayTour(): Promise<Tour> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tour/today`, {
    // voorkomt caching tijdens ontwikkelen
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Kon tour van vandaag niet ophalen");
  }

  return res.json();
}

export default async function TodayTourPage() {
  const tour = await getTodayTour();

  return (
    <div className="py-10">
      <section>
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: "0.7rem",
            color: "#737373",
            marginBottom: "0.5rem",
          }}
        >
          Tour van vandaag
        </p>
        <h1>{tour.title}</h1>
        <p style={{ fontSize: "0.9rem", maxWidth: "40rem" }}>{tour.intro}</p>
        <p style={{ fontSize: "0.75rem", color: "#737373" }}>
          Totale luistertijd circa {tour.durationMinutes} minuten.
        </p>
      </section>

      <section>
        <h2>Kunstwerken in deze tour</h2>
        {tour.works.map((work) => (
          <div
            key={work.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "16px",
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.9rem",
              background: "#ffffff",
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{work.title}</div>
              <div style={{ color: "#555" }}>
                {work.artist} · {work.museum}
              </div>
            </div>
            <button className="btn-secondary">Bekijk werk</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Volgende stap</h2>
        <p style={{ fontSize: "0.9rem", maxWidth: "40rem" }}>
          Deze tour komt nu uit een eenvoudige API-route. In een volgende stap
          vervangen we de mock data door een echte tour uit je database en CRM,
          zonder de voorkant nog eens te hoeven aanpassen.
        </p>
      </section>
    </div>
  );
}
