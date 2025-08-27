import {
  GridIcon,
  ShoppingCartIcon,
  CircleDollarSignIcon,
  BellIcon,
  UserIcon,
  MessagesSquareIcon,
  BuildingIcon,
  Building2Icon,
} from 'lucide-react';

export const OrgMenuItems = [
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

export const SuperAdminMenuItems = [
  {
    title: 'Organizaciones',
    url: '/super/dashboard/organizations',
    icon: BuildingIcon,
  },
  {
    title: 'Proyectos',
    url: '/super/dashboard/projects',
    icon: Building2Icon,
  },
];
