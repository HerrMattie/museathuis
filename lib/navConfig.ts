// lib/navConfig.ts
import { 
  Home, Compass, Gamepad2, Newspaper, 
  Coffee, GraduationCap, Star, User 
} from 'lucide-react';

export const MAIN_NAV_LINKS = [
  { 
    label: 'Vandaag', 
    href: '/', // <--- FIX: Was '/home', moet '/' zijn
    icon: Home 
  },
  { 
    label: 'Tour', 
    href: '/tour', 
    icon: Compass 
  },
  { 
    label: 'Game', // <--- FIX: Toegevoegd op juiste plek
    href: '/game', 
    icon: Gamepad2 
  },
  { 
    label: 'Focus', 
    href: '/focus', 
    icon: Newspaper 
  },
  { 
    label: 'Salon', 
    href: '/salon', 
    icon: Coffee 
  },
  { 
    label: 'Academie', // <--- FIX: Toegevoegd
    href: '/academie', 
    icon: GraduationCap 
  },
  { 
    label: 'Best Of', // <--- FIX: Toegevoegd
    href: '/best-of', 
    icon: Star 
  },
  { 
    label: 'Profiel', 
    href: '/profile', 
    icon: User 
  },
];
