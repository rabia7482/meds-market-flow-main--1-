import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Store, User, Calendar, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  notes?: string;
  created_at: string;
  customer: {
    full_name?: string;
  };
  pharmacy: {
    name: string;
  };
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  delivery?: {
    id: string;
    status_delivery: string;
    delivery_agent?: string;
  };
}

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles and order items separately to avoid relation issues
      const orderIds = data?.map(order => order.id) || [];
      
      const [profilesResponse, itemsResponse, deliveriesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', data?.map(order => order.customer_id) || []),
        supabase
          .from('order_items')
          .select(`
            order_id,
            quantity,
            unit_price,
            product:products(name)
          `)
          .in('order_id', orderIds),
        supabase
          .from('deliveries')
          .select(`
            id,
            order_id,
            status_delivery,
            delivery_agent_id,
            profiles!deliveries_delivery_agent_id_fkey(full_name)
          `)
          .in('order_id', orderIds)
      ]);

      const profiles = profilesResponse.data || [];
      const items = itemsResponse.data || [];
      const deliveries = deliveriesResponse.data || [];

      // Transform the data
      const transformedOrders = data?.map(order => ({
        ...order,
        customer: profiles.find(p => p.user_id === order.customer_id) || { full_name: undefined },
        order_items: items
          .filter(item => item.order_id === order.id)
          .map(item => ({
            product_name: (item.product as any)?.name || 'Unknown Product',
            quantity: item.quantity,
            unit_price: item.unit_price
          })),
        delivery: deliveries.find(d => d.order_id === order.id) ? {
          id: deliveries.find(d => d.order_id === order.id)!.id,
          status_delivery: deliveries.find(d => d.order_id === order.id)!.status_delivery,
          delivery_agent: (deliveries.find(d => d.order_id === order.id)!.profiles as any)?.full_name
        } : undefined
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Monitor platform orders and transactions</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Search by customer, pharmacy, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.customer.full_name || 'Unknown Customer'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>{order.pharmacy.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₦{order.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Order Items</p>
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>₦{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.delivery ? (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4" />
                        <p className="font-medium">Delivery</p>
                        <Badge variant="secondary" className={
                          order.delivery.status_delivery === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.delivery.status_delivery === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {order.delivery.status_delivery.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent: {order.delivery.delivery_agent || 'Not assigned'}
                      </p>
                      <Link
                        to={`/admin/deliveries?order=${order.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Delivery Details →
                      </Link>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">No delivery assigned</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="border-t pt-4">
                      <p className="font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No orders match your search criteria.' 
                    : 'No orders have been placed yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;