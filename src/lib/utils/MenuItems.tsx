import {
  BellIcon,
  BuildingIcon,
  CircleDollarSignIcon,
  GridIcon,
  HouseIcon,
  LayersIcon,
  MessagesSquareIcon,
  ShoppingCartIcon,
  BookmarkIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";

export const OrgMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: GridIcon,
  },
  {
    title: "Reservas",
    url: "/dashboard/sales",
    icon: BookmarkIcon,
  },
  {
    title: "Ventas",
    url: "/dashboard/purchases",
    icon: ShoppingCartIcon,
  },
  {
    title: "Clientes",
    url: "/dashboard/clients",
    icon: CircleDollarSignIcon,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: MessagesSquareIcon,
  },
  {
    title: "Notificaciones",
    url: "/dashboard/notifications",
    icon: BellIcon,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: UserIcon,
  },
];

export const SuperAdminMenuItems = [
  {
    title: "Organizaciones",
    url: "/super/dashboard/organizations",
    icon: LayersIcon,
  },
  {
    title: "Proyectos",
    url: "/super/dashboard/projects",
    icon: BuildingIcon,
  },
  {
    title: "Unidades",
    url: "/super/dashboard/units",
    icon: HouseIcon,
  },
];
