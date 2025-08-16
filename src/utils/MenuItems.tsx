import {
  GridIcon,
  ShoppingCartIcon,
  CircleDollarSignIcon,
  BellIcon,
  UserIcon,
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: GridIcon,
  },
  {
    title: 'Ventas',
    url: '/dashboard/investments',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Clientes',
    url: '/dashboard/projects',
    icon: CircleDollarSignIcon,
  },
  {
    title: 'Notificaciones',
    url: '/dashboard/analytics',
    icon: BellIcon,
  },
  {
    title: 'Perfil',
    url: '/dashboard/notifications',
    icon: UserIcon,
  },
];
