import {
  ArrowLeft,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Menu,
  Music,
  Pause,
  Play,
  Search,
  Trash2,
  Upload,
  User,
  Volume2,
  X,
} from 'lucide-react';
import { IconMap } from '../types';

const iconMap: IconMap = {
  Home,
  LogOut,
  Menu,
  Music,
  Upload,
  User,
  X,
  Eye,
  EyeOff,
  Search,
  Trash2,
  ArrowLeft,
  Pause,
  Play,
  Volume2,
};

interface IconProps {
  name: keyof typeof iconMap;
  className?: string;
}

export const Icon = ({ name, className = '' }: IconProps) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent className={className} />;
};
