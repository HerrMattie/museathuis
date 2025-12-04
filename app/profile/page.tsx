export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Profiel</h2>
      <p className="text-slate-300 max-w-2xl">
        Dit wordt de plek waar gebruikers hun voorkeuren, voortgang en badges
        zien. De data komt straks uit <code>profiles</code>,{" "}
        <code>user_preferences</code>, <code>tour_progress</code> en{" "}
        <code>user_badges</code>.
      </p>
      <p className="text-slate-400 text-sm">
        Voor nu staat hier alleen een placeholder; zo kun je eerst de
        navigatiestructuur en het premium-ecosysteem technisch afronden.
      </p>
    </div>
  );
}
