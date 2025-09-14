import {
  HeartIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  ShoppingCartIcon,
  User,
} from "lucide-react";

export const DashboardUserMenuItems = [
  { title: "Compras", href: "/userDashboard/shopping", icon: ShoppingCartIcon },
  { title: "Favoritos", href: "/userDashboard/favorites", icon: HeartIcon },
  // { title: 'Chat', href: '/userDashboard/chat', icon: MessagesSquareIcon },
  // { title: "Notificaciones", href: "/dashboard", icon: BellIcon },
  { title: "Perfil", href: "/userDashboard/profile", icon: User },
];

export const HeaderMenuItems = [
  { title: "Compras", href: "/userDashboard/shopping", icon: ShoppingCartIcon },
  { title: "Favoritos", href: "/userDashboard/favorites", icon: HeartIcon },
  // { title: "Notificaciones", href: "/userDashboard", icon: BellIcon },
  { title: "Perfil", href: "/userDashboard/profile", icon: User },
];

export const adminMenuItems = [
  { title: "Perfil", href: "/dashboard/profile", icon: User },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Chat", href: "/dashboard/chat", icon: MessagesSquareIcon },
];

export const menuItems = [
  { name: "Proyectos", href: "/projects" },
  { name: "Servicios", href: "/services" },
  { name: "Nosotros", href: "/about" },
  { name: "Preguntas", href: "/faqs" },
  { name: "Proceso", href: "/process" },
];
