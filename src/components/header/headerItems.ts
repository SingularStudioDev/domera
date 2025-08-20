import {
  User,
  ShoppingCartIcon,
  StarIcon,
  MessagesSquareIcon,
  BellIcon,
  LayoutDashboardIcon,
} from 'lucide-react';

export const userMenuItems = [
  { title: 'Perfil', href: '/userDashboard', icon: User },
  { title: 'Compras', href: '/userDashboard', icon: ShoppingCartIcon },
  { title: 'Favoritos', href: '/userDashboard/favorites', icon: StarIcon },
  { title: 'Chat', href: '/userDashboard/chat', icon: MessagesSquareIcon },
  { title: 'Notificaciones', href: '/dashboard', icon: BellIcon },
];

export const adminMenuItems = [
  { title: 'Perfil', href: '/dashboard/profile', icon: User },
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { title: 'Chat', href: '/dashboard/chat', icon: MessagesSquareIcon },
];

export const menuItems = [
  { name: 'Proyectos', href: '/projects' },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Nosotros', href: '#nosotros' },
  { name: 'Preguntas', href: '#preguntas' },
  { name: 'Contacto', href: '#contacto' },
];
