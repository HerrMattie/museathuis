import React from 'react';
import { 
  Star, 
  Flame, 
  Trophy, 
  Coffee, 
  Scroll, 
  CloudRain, 
  Eye, 
  Clock, 
  Sun, 
  Library, 
  Crown, 
  Globe, 
  Award, 
  Moon, 
  Grid, 
  BookOpen, 
  Map, 
  Heart, 
  Palette, 
  Target, 
  Brain, 
  Calendar,
  HelpCircle // Fallback voor als er iets mis is
} from 'lucide-react';

// De mapping object koppelt de string uit de DB aan het component
const iconMap: Record<string, React.ElementType> = {
  Star,
  Flame,
  Trophy,
  Coffee,
  Scroll,
  CloudRain,
  Eye,
  Clock,
  Sun,
  Library,
  Crown,
  Globe,
  Award,
  Moon,
  Grid,
  BookOpen,
  Map,
  Heart,
  Palette,
  Target,
  Brain,
  Calendar
};

interface BadgeIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function BadgeIcon({ name, className = "", size = 24 }: BadgeIconProps) {
  // We zoeken het icoon op in de lijst. Bestaat hij niet? Dan tonen we HelpCircle.
  const IconComponent = iconMap[name] || HelpCircle;

  return <IconComponent className={className} size={size} />;
}
