import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import PharmacyRegister from "./pages/PharmacyRegister";
import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import PharmacyProducts from "./pages/pharmacy/Products";
import PharmacyOrders from "./pages/pharmacy/Orders";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPharmacies from "./pages/admin/Pharmacies";
import AdminUsers from "./pages/admin/Users";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/pharmacy-register" element={<PharmacyRegister />} />
              
              {/* Pharmacy Routes */}
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/products" element={<PharmacyProducts />} />
              <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
