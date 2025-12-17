// lib/navConfig.ts
import { Home, Compass, Newspaper, Coffee, User } from 'lucide-react';

export const MAIN_NAV_LINKS = [
  { 
    label: 'Vandaag', 
    href: '/home', 
    icon: Home 
  },
  { 
    label: 'Tour', 
    href: '/tour', 
    icon: Compass 
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
    label: 'Profiel', 
    href: '/profile', 
    icon: User 
  },
];
