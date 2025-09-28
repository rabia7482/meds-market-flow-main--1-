import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  notes: string;
  created_at: string;
  pharmacy: {
    name: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
      brand: string;
    };
  }>;
  delivery?: {
    id: string;
    status_delivery: string;
    delivery_agent: string;
  };
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name),
          order_items(
            *,
            product:products(name, brand)
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orderIds = ordersData?.map(order => order.id) || [];

      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select(`
          id,
          order_id,
          status_delivery,
          profiles!deliveries_delivery_agent_id_fkey(full_name)
        `)
        .in('order_id', orderIds);

      if (deliveriesError) throw deliveriesError;

      // Transform orders with deliveries
      const transformedOrders = ordersData?.map(order => ({
        ...order,
        delivery: deliveriesData?.find(d => d.order_id === order.id) ? {
          id: deliveriesData.find(d => d.order_id === order.id)!.id,
          status_delivery: deliveriesData.find(d => d.order_id === order.id)!.status_delivery,
          delivery_agent: (deliveriesData.find(d => d.order_id === order.id)!.profiles as any)?.full_name || 'Unknown'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your medication orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="flex flec-col justify-between h-full">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to place your first order
              </p>
              <Button className="mt-auto" onClick={() => window.location.href = '/browse'}>
                Browse Medications
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.pharmacy.name} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="text-lg font-bold text-primary">
                        ₦{order.total_amount}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Items:</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.name} {item.product.brand && `(${item.product.brand})`}
                          <span className="text-muted-foreground"> × {item.quantity}</span>
                        </span>
                        <span>₦{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-medium mb-1">Delivery Address:</h4>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}

                  {/* Delivery Info */}
                  {order.delivery ? (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4" />
                        <h4 className="font-medium">Delivery</h4>
                        <Badge variant="secondary" className={
                          order.delivery.status_delivery === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.delivery.status_delivery === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {order.delivery.status_delivery.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent: {order.delivery.delivery_agent}
                      </p>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">No delivery assigned</p>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;