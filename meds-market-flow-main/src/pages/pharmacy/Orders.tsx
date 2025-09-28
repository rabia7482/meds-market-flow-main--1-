import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Package, Truck } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  notes: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      brand: string;
    };
  }>;
  delivery?: {
    id: string;
    status_delivery: string;
    delivery_agent: string;
    confirmed_by_pharmacy: boolean;
  };
}

const PharmacyOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
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

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, brand)
          )
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orderIds = ordersData?.map(order => order.id) || [];

      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select(`
          id,
          order_id,
          status_delivery,
          confirmed_by_pharmacy,
          delivery_agent_id
        `)
        .in('order_id', orderIds);

      if (deliveriesError) throw deliveriesError;

      // Fetch delivery agent profiles
      const deliveryAgentIds = deliveriesData?.map(d => d.delivery_agent_id).filter(Boolean) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', deliveryAgentIds);

      // Transform orders with deliveries
      const transformedOrders = ordersData?.map(order => {
        const delivery = deliveriesData?.find(d => d.order_id === order.id);
        const agentProfile = profilesData?.find(p => p.user_id === delivery?.delivery_agent_id);
        return {
          ...order,
          order_items: order.order_items?.map(item => ({
            ...item,
            products: item.products || { name: 'Unknown Product', brand: '' }
          })) || [],
          delivery: delivery ? {
            id: delivery.id,
            status_delivery: delivery.status_delivery,
            delivery_agent: agentProfile?.full_name || 'Unknown',
            confirmed_by_pharmacy: delivery.confirmed_by_pharmacy
          } : undefined
        };
      }) || [];

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

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const confirmDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ confirmed_by_pharmacy: true })
        .eq('id', deliveryId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.delivery?.id === deliveryId
          ? { ...order, delivery: { ...order.delivery, confirmed_by_pharmacy: true } }
          : order
      ));

      toast({
        title: "Delivery confirmed",
        description: "Delivery handover confirmed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm delivery",
        variant: "destructive",
      });
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

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">Process and manage customer orders</p>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Orders will appear here once customers start purchasing'
                  : `No orders with ${statusFilter} status found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Customer • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-bold text-cyan-600">
                          ₦{order.total_amount}
                        </span>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Items:</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm bg-muted p-2 rounded">
                        <span>
                          {item.products.name} {item.products.brand && `(${item.products.brand})`}
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
                      <h4 className="font-medium mb-1">Customer Notes:</h4>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Agent: {order.delivery.delivery_agent}
                      </p>
                      {!order.delivery.confirmed_by_pharmacy && (
                        <Button
                          onClick={() => confirmDelivery(order.delivery!.id)}
                          variant="outline"
                          size="sm"
                        >
                          Confirm Delivery Handover
                        </Button>
                      )}
                      {order.delivery.confirmed_by_pharmacy && (
                        <p className="text-sm text-green-600">✓ Confirmed by pharmacy</p>
                      )}
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">No delivery assigned</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'approved')}
                          className="flex-1 bg-gradient-to-r from-cyan-700 to-blue-700"
                        >
                          Confirm Order
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="text-destructive hover:text-destructive bg-gradient-to-r from-cyan-700 to-blue-700"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'approved' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 bg-gradient-to-r from-cyan-700 to-blue-700"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    
                    {order.status === 'delivered' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Order completed</span>
                      </div>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Order cancelled</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PharmacyOrders;