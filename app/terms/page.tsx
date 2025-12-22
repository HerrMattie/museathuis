'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20 font-serif">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase font-sans">
            <ArrowLeft size={16}/> Terug naar Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Algemene Voorwaarden</h1>
        <div className="prose prose-invert prose-gold">
          <p className="text-gray-300 mb-6">Laatst bijgewerkt: 22 december 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Diensten</h2>
            <p className="text-gray-400">MuseaThuis biedt een digitaal platform voor kunstbeleving, inclusief audiotours, games en artikelen. De diensten worden aangeboden op basis van beschikbaarheid.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Lidmaatschap & Betaling</h2>
            <p className="text-gray-400">Het Mecenas-lidmaatschap kost €6,95 per maand. Betalingen worden vooraf voldaan. Opzeggen kan maandelijks via uw profielinstellingen.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Intellectueel Eigendom</h2>
            <p className="text-gray-400">Alle content, inclusief teksten, audiocommentaar en softwarecode, is eigendom van MuseaThuis of haar licentiegevers. Kunstafbeeldingen worden getoond onder publiek domein of licentie.</p>
          </section>

           <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Aansprakelijkheid</h2>
            <p className="text-gray-400">MuseaThuis streeft naar accurate informatie, maar is niet aansprakelijk voor historische onjuistheden of technische storingen.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
