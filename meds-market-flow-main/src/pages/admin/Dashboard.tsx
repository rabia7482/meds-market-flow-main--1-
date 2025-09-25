import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store, Users, Package, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

interface AdminStats {
  totalPharmacies: number;
  pendingPharmacies: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalPharmacies: 0,
    pendingPharmacies: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch pharmacies
      const { data: pharmacies } = await supabase
        .from('pharmacies')
        .select('id, verification_status');

      // Fetch users
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      // Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('id');

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount');

      const totalPharmacies = pharmacies?.length || 0;
      const pendingPharmacies = pharmacies?.filter(p => p.verification_status === 'pending').length || 0;
      const totalUsers = users?.length || 0;
      const totalProducts = products?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalPharmacies,
        pendingPharmacies,
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPharmacies}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPharmacies} pending verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total transaction value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPharmacies}</div>
              <p className="text-xs text-muted-foreground">
                Pharmacies awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/admin/pharmacies" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Pharmacies</h3>
              <p className="text-sm text-muted-foreground">Verify and manage pharmacy registrations</p>
            </a>

            <a 
              href="/admin/users" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-muted-foreground">View and manage platform users</p>
            </a>

            <a 
              href="/admin/products" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Product Overview</h3>
              <p className="text-sm text-muted-foreground">Monitor product catalog</p>
            </a>

            <a 
              href="/admin/orders" 
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Order Management</h3>
              <p className="text-sm text-muted-foreground">Monitor platform orders</p>
            </a>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {stats.pendingPharmacies > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-orange-800">
                  <strong>{stats.pendingPharmacies} pharmacy registrations</strong> are waiting for your verification.
                </p>
                <a 
                  href="/admin/pharmacies" 
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  Review pending applications →
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;