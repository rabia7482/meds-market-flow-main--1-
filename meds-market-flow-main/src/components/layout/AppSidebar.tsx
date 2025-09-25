import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Store, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings,
  Pill
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

const customerItems = [
  { title: "Browse", url: "/browse", icon: Store },
  { title: "Cart", url: "/cart", icon: ShoppingCart },
  { title: "Orders", url: "/orders", icon: FileText },
  { title: "Profile", url: "/profile", icon: Settings },
];

const pharmacyItems = [
  { title: "Dashboard", url: "/pharmacy/dashboard", icon: Home },
  { title: "Products", url: "/pharmacy/products", icon: Package },
  { title: "Orders", url: "/pharmacy/orders", icon: FileText },
  { title: "Profile", url: "/profile", icon: Settings },
];

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Pharmacies", url: "/admin/pharmacies", icon: Store },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { role } = useUserRole();
  const currentPath = location.pathname;

  const getItems = () => {
    switch (role) {
      case 'admin':
        return adminItems;
      case 'pharmacy':
        return pharmacyItems;
      default:
        return customerItems;
    }
  };

  const items = getItems();
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Pill className="h-6 w-6 text-primary" />
            {!isCollapsed && <span className="font-bold text-primary">MedsMarket</span>}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {role === 'admin' ? 'Admin' : role === 'pharmacy' ? 'Pharmacy' : 'Customer'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
