import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingCart, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
}

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get pharmacy ID (handle multiple rows safely)
      const { data: pharmacies, error: pharmacyErr } = await supabase
        .from('pharmacies')
        .select('id, verification_status')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pharmacyErr) throw pharmacyErr;
      const pharmacy = pharmacies?.[0];

      if (!pharmacy) throw new Error('Pharmacy not found');

      // Fetch products stats
      const { data: products } = await supabase
        .from('products')
        .select('id, is_active')
        .eq('pharmacy_id', pharmacy.id);

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .eq('pharmacy_id', pharmacy.id);

      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.is_active).length || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Overview of your pharmacy operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total revenue to date
              </p>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products available for sale
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/pharmacy/products" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-muted-foreground">Add or update your inventory</p>
            </a>

            <a 
              href="/pharmacy/orders" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">View Orders</h3>
              <p className="text-sm text-muted-foreground">Process customer orders</p>
            </a>

            <a 
              href="/profile" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Pharmacy Profile</h3>
              <p className="text-sm text-muted-foreground">Update pharmacy information</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;