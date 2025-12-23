'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20 font-serif">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigatie */}
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase font-sans transition-colors">
            <ArrowLeft size={16}/> Terug naar Home
        </Link>

        {/* Titel Sectie */}
        <div className="border-b border-white/10 pb-8 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-museum-gold">Algemene Voorwaarden</h1>
            <p className="text-gray-400 text-lg font-sans">
                Welkom bij MuseaThuis. Lees deze voorwaarden zorgvuldig door voordat u gebruik maakt van onze diensten.
                Door gebruik te maken van het platform gaat u akkoord met het verzamelen en verwerken van data zoals hieronder beschreven.
            </p>
            <p className="text-gray-500 text-sm mt-4 font-sans uppercase tracking-widest">Laatst bijgewerkt: 23 december 2025</p>
        </div>

        <div className="prose prose-lg prose-invert prose-gold max-w-none font-sans text-gray-300">
          
          {/* ARTIKEL 1 */}
          <section className="mb-12 bg-white/5 p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-museum-gold">1.</span> Diensten & AI-Generatie
            </h2>
            <p>
              MuseaThuis biedt een digitaal platform voor kunstbeleving ("de Dienst"). De content op het platform, waaronder audiotours, salons, games en artikelen, wordt 
              groten-deels gegenereerd door geavanceerde Artificial Intelligence (AI).
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-gray-400 text-sm">
                <li>Hoewel wij streven naar historische accuratesse, kunnen er geen rechten worden ontleend aan de feitelijke juistheid van AI-gegenereerde content.</li>
                <li>De selectie van kunstwerken en thema's wordt dynamisch bepaald op basis van beschikbaarheid en uw gebruikersprofiel.</li>
            </ul>
          </section>

          {/* ARTIKEL 2 (HET VERDIENMODEL) */}
          <section className="mb-12 bg-white/5 p-8 rounded-2xl border border-museum-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-museum-gold">2.</span> Gebruikersprofiel & Dataverwerking
            </h2>
            <p className="font-bold text-white mb-2">Dit is een essentieel onderdeel van onze dienstverlening.</p>
            <p>
              Om u de meest relevante kunstbeleving te bieden, bouwt MuseaThuis een gedetailleerd 'Cultureel DNA' profiel op. 
              Door gebruik te maken van de dienst, geeft u expliciet toestemming voor:
            </p>
            <ul className="list-disc pl-5 space-y-3 mt-4 text-gray-300">
                <li>
                    <strong>Profilering:</strong> Het analyseren van uw klikgedrag, quiz-resultaten, favoriete periodes, locatiegegevens en opgegeven interesses om een gedetailleerd gebruikersprofiel samen te stellen.
                </li>
                <li>
                    <strong>Matching:</strong> Het gebruiken van dit profiel om u te matchen met relevante culturele instellingen, musea en partners.
                </li>
                <li>
                    <strong>Gepersonaliseerd Aanbod:</strong> Wij kunnen uw (gepseudonimiseerde) profielkenmerken gebruiken om relevante tentoonstellingen of aanbiedingen van onze partners aan u te tonen.
                </li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 italic">
                Voor volledige details over hoe wij uw privacy waarborgen en uw rechten onder de AVG, verwijzen wij naar ons Privacybeleid.
            </p>
          </section>

          {/* ARTIKEL 3 */}
          <section className="mb-12 bg-white/5 p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-museum-gold">3.</span> Lidmaatschap & Betaling
            </h2>
            <div className="space-y-4">
                <p><strong>3.1 Mecenas Lidmaatschap:</strong> Het premium lidmaatschap kost €6,95 per maand, inclusief BTW.</p>
                <p><strong>3.2 Betaling:</strong> Betalingen geschieden vooraf via de aangeboden betaalmethoden. Bij niet-tijdige betaling wordt de toegang tot premium functies opgeschort.</p>
                <p><strong>3.3 Opzegging:</strong> Het lidmaatschap is maandelijks opzegbaar via uw profielinstellingen. Er geldt geen opzegtermijn, maar reeds betaalde periodes worden niet gerestitueerd.</p>
            </div>
          </section>

          {/* ARTIKEL 4 */}
          <section className="mb-12 bg-white/5 p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-museum-gold">4.</span> Intellectueel Eigendom
            </h2>
            <p>
              Alle softwarecode, algoritmes, database-structuren, teksten en audiocommentaren op MuseaThuis zijn eigendom van MuseaThuis. 
              De getoonde afbeeldingen van kunstwerken vallen onder het Publiek Domein (Public Domain) of worden gebruikt onder licentie van open-data partners (zoals Rijksmuseum API, Met Museum API).
            </p>
            <p className="mt-4 text-gray-400">Het is niet toegestaan om (profiel)data van het platform te scrapen of te kopiëren zonder schriftelijke toestemming.</p>
          </section>

           {/* ARTIKEL 5 */}
           <section className="mb-12 bg-white/5 p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-museum-gold">5.</span> Aansprakelijkheid
            </h2>
            <p>
              MuseaThuis is niet aansprakelijk voor enige directe of indirecte schade voortvloeiend uit het gebruik van de app, waaronder begrepen:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-400 text-sm">
                <li>Technische storingen of onderbrekingen van de dienst.</li>
                <li>Inhoudelijke onjuistheden in de door AI gegenereerde teksten of audiotours.</li>
                <li>Het niet beschikbaar zijn van specifieke kunstwerken.</li>
            </ul>
          </section>

        </div>
        
        {/* Footer van de pagina */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm font-sans">
            <p>Heeft u vragen over deze voorwaarden? Neem contact op via <a href="mailto:legal@museathuis.nl" className="text-museum-gold hover:underline">legal@museathuis.nl</a></p>
        </div>

      </div>
    </div>
  );
}
