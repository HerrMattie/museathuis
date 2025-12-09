import { ReactNode } from "react";
// DE FIX: Accolades weggehaald omdat NavBar een 'export default' is
import NavBar from "./NavBar"; 
// Footer bestaat misschien nog niet, als dat zo is, haal die regel dan ook weg of comment hem uit
// import { Footer } from "./Footer"; 

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-midnight-950 text-white">
      {/* LET OP: Omdat we NavBar nu ook in app/layout.tsx hebben, 
         kan hij hier dubbel verschijnen. 
         Voor nu fixen we alleen de error, maar waarschijnlijk 
         kun je <NavBar /> hieronder verwijderen als je layout.tsx gebruikt.
      */}
      <NavBar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* <Footer /> */}
    </div>
  );
}
