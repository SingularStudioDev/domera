import {
  GridIcon,
  ShoppingCartIcon,
  CircleDollarSignIcon,
  BellIcon,
  UserIcon,
  MessagesSquareIcon,
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: GridIcon,
  },
  {
    title: 'Ventas',
    url: '/dashboard/sales',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Clientes',
    url: '/dashboard/clients',
    icon: CircleDollarSignIcon,
  },
  {
    title: 'Chat',
    url: '/dashboard/chat',
    icon: MessagesSquareIcon,
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
