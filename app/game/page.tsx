export default function GamePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dagelijkse Game</h2>
      <p className="text-slate-300 max-w-2xl">
        Op deze pagina komt de spelervaring: bijvoorbeeld een detailspel of
        tijdlijnspel op basis van werken uit de tour. De logica haakt straks aan
        op de tabellen <code>games</code> en <code>game_results</code>.
      </p>
      <p className="text-slate-400 text-sm">
        Nu is de pagina nog statisch, zodat de build slaagt en je later de game
        stap voor stap kunt uitbouwen.
      </p>
    </div>
  );
}
